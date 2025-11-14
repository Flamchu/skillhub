# dockerfile for ai service (sentence-transformer)

FROM python:3.14-slim

WORKDIR /app

# install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# copy requirements
COPY requirements.txt .

# install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# pre-download the sentence-transformer model during build
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# copy application code
COPY app.py .

# create non-root user
RUN useradd --create-home --shell /bin/bash aiuser && \
    chown -R aiuser:aiuser /app

USER aiuser

# expose port
EXPOSE 5000

# health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD curl -f https://skillhub.lopataa.site:5000/health || exit 1

# run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
