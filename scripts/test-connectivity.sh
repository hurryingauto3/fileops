#!/bin/bash

echo "Testing service connectivity..."

# Test frontend
echo "Testing frontend..."
curl -I http://localhost:3000

# Test backend health
echo "Testing backend health..."
curl http://localhost:5001/api/health

# Test backend-db connectivity
echo "Testing backend-db connectivity..."
docker-compose exec backend python -c "from app import db; db.session.execute('SELECT 1')"

# Test backend-redis connectivity
echo "Testing backend-redis connectivity..."
docker-compose exec redis redis-cli ping

# Test worker-redis connectivity
echo "Testing worker-redis connectivity..."
docker-compose exec worker celery -A app.celery inspect ping 