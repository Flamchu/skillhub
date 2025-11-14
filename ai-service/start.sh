#!/bin/bash
echo "Starting SkillHub AI Service..."
echo "Model: sentence-transformers/all-MiniLM-L6-v2"
echo "Port: 5000"
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Activated virtual environment"
fi

# Install requirements if they don't exist
python -c "import sentence_transformers" 2>/dev/null || {
    echo "Installing requirements..."
    pip install -r requirements.txt
}

# Start the service
echo "🚀 Starting AI service on http://localhost:8000"
echo "📊 Health check: http://localhost:8000/health"
echo "📖 API docs: http://localhost:8000/docs"
echo ""

python app.py