# Build the backend image
docker build -t jjtschooldlsud/sched-builder-backend:v1.0 -f db/db-Dockerfile .

# Push to registry
docker push jjtschooldlsud/sched-builder-backend:v1.0