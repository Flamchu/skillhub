#!/usr/bin/env python3
"""
SkillHub Local AI Service
Uses sentence-transformers for skill recommendation via semantic similarity
"""

from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SkillHub AI Service", version="1.0.0")

# Load the embedding model
print("Loading SentenceTransformer model...")
logging.info("Loading SentenceTransformer model...")
try:
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    model_available = True
    device_info = f"CUDA ({model.device})" if str(model.device).startswith('cuda') else f"CPU ({model.device})"
    logging.info(f"✅ Model loaded successfully on {device_info}")
    print(f"✅ Model ready on {device_info}")
except Exception as e:
    logging.error(f"❌ Failed to load SentenceTransformer model: {e}")
    print(f"❌ Model loading failed: {e}")
    raise e  # Don't continue without the model
logger.info("Model loaded successfully!")

class SkillRecommendationRequest(BaseModel):
    prompt: str
    skills: List[Dict[str, str]]  # [{"name": "JavaScript", "slug": "javascript", "description": "..."}]
    max_recommendations: int = 7

class SkillSuggestion(BaseModel):
    skillName: str
    skillSlug: str
    suggestedProficiency: str
    reason: str
    priority: int

class SkillRecommendationResponse(BaseModel):
    skills: List[SkillSuggestion]
    analysis: str

# AI model is now always available - no fallback needed

@app.get("/health")
def health_check():
    """Health check endpoint"""
    device_info = f"CUDA ({model.device})" if str(model.device).startswith('cuda') else f"CPU ({model.device})"
    return {
        "status": "healthy",
        "service": "SkillHub AI Service", 
        "model": "sentence-transformers/all-MiniLM-L6-v2",
        "device": device_info,
        "model_available": True,
        "timestamp": time.time()
    }

@app.post("/recommend-skills", response_model=SkillRecommendationResponse)
def recommend_skills(request: SkillRecommendationRequest):
    """
    Recommend skills based on user prompt using semantic similarity
    """
    try:
        start_time = time.time()
        logger.info(f"Processing skill recommendation for prompt: '{request.prompt[:50]}...'")
        
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if not request.skills:
            raise HTTPException(status_code=400, detail="Skills list cannot be empty")
        
        # AI model is required - no fallback
        
        # Encode the user prompt
        prompt_embedding = model.encode([request.prompt])
        
        # Prepare skill texts for embedding
        skill_texts = []
        skill_metadata = []
        
        for skill in request.skills:
            # Combine skill name and description for better semantic matching
            skill_text = f"{skill['name']}: {skill.get('description', skill['name'])}"
            skill_texts.append(skill_text)
            skill_metadata.append({
                'name': skill['name'],
                'slug': skill['slug'],
                'description': skill.get('description', '')
            })
        
        # Encode all skills
        skill_embeddings = model.encode(skill_texts)
        
        # Calculate cosine similarities
        similarities = cosine_similarity(prompt_embedding, skill_embeddings)[0]
        
        # Get top recommendations
        top_indices = np.argsort(similarities)[::-1][:request.max_recommendations]
        
        # Determine proficiency level based on prompt
        proficiency = determine_proficiency_level(request.prompt)
        
        # Build recommendations
        recommendations = []
        for i, idx in enumerate(top_indices):
            similarity_score = similarities[idx]
            
            # Skip skills with very low similarity (< 0.1)
            if similarity_score < 0.1:
                continue
            
            skill_meta = skill_metadata[idx]
            
            recommendations.append(SkillSuggestion(
                skillName=skill_meta['name'],
                skillSlug=skill_meta['slug'],
                suggestedProficiency=proficiency,
                reason=generate_reason(request.prompt, skill_meta['name'], similarity_score),
                priority=10 - i
            ))
        
        processing_time = time.time() - start_time
        analysis = f"AI analyzed your request using semantic similarity. Found {len(recommendations)} relevant skills in {processing_time:.2f}s using sentence-transformers."
        
        logger.info(f"Recommended {len(recommendations)} skills in {processing_time:.2f}s")
        
        return SkillRecommendationResponse(
            skills=recommendations,
            analysis=analysis
        )
        
    except Exception as e:
        logger.error(f"Error in skill recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def determine_proficiency_level(prompt: str) -> str:
    """Determine suggested proficiency level based on prompt keywords"""
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['beginner', 'new', 'start', 'first time', 'never', 'learn']):
        return 'NONE'
    elif any(word in prompt_lower for word in ['intermediate', 'some experience', 'familiar']):
        return 'BASIC'
    elif any(word in prompt_lower for word in ['advanced', 'experienced', 'expert', 'professional']):
        return 'INTERMEDIATE'
    else:
        return 'BASIC'  # Default

def generate_reason(prompt: str, skill_name: str, similarity_score: float) -> str:
    """Generate human-readable reason for skill recommendation"""
    confidence_level = "highly" if similarity_score > 0.6 else "moderately" if similarity_score > 0.3 else "somewhat"
    
    # Extract key topics from prompt
    topics = extract_key_topics(prompt)
    
    if topics:
        return f"AI found {skill_name} {confidence_level} relevant to your interest in {', '.join(topics)}"
    else:
        return f"AI identified {skill_name} as {confidence_level} relevant to your learning goals"

def extract_key_topics(prompt: str) -> List[str]:
    """Extract key learning topics from the prompt"""
    topics = []
    prompt_lower = prompt.lower()
    
    # Common tech topics
    tech_keywords = {
        'web development': ['web', 'website', 'frontend', 'backend'],
        'data science': ['data', 'analytics', 'science', 'analysis'],
        'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
        'testing': ['test', 'testing', 'qa', 'quality assurance'],
        'mobile development': ['mobile', 'app', 'android', 'ios'],
        'devops': ['devops', 'deployment', 'infrastructure', 'cloud'],
        'security': ['security', 'cybersecurity', 'hacking', 'penetration'],
        'game development': ['game', 'gaming', 'unity', 'unreal']
    }
    
    for topic, keywords in tech_keywords.items():
        if any(keyword in prompt_lower for keyword in keywords):
            topics.append(topic)
    
    return topics[:3]  # Limit to top 3 topics

# Simple embedding endpoint (for future use)
@app.post("/embed")
def embed_text(text: Dict[str, str]):
    """Generate embeddings for text"""
    try:
        embedding = model.encode(text["text"]).tolist()
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")