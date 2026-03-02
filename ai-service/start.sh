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

# install pip if it's missing
python -c "import pip" 2>/dev/null || {
    echo "Installing pip..."
    python -m ensurepip --upgrade
}

# Install requirements if they don't exist
python -c "import sentence_transformers" 2>/dev/null || {
    echo "Installing requirements..."
    python -m pip install -r requirements.txt
}

# Start the service
echo "🚀 Starting AI service on http://localhost:5000"
echo "📊 Health check: http://localhost:5000/health"
echo "📖 API docs: http://localhost:5000/docs"
echo ""

python app.py
