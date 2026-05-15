# DATABASE
### docker build -t jjtschooldlsud/sched-builder-db:v1.3 -f db/Dockerfile .
### docker push jjtschooldlsud/sched-builder-db:v1.3

# kubectl apply -f db/db-configmap.yaml
### kubectl apply -f db/db-secret.yaml
### kubectl apply -f db/db-deployment.yaml

# FRONT-END
### docker build -t jjtschooldlsud/sched-builder:v3.7 .
### docker push jjtschooldlsud/sched-builder:v3.7

### kubectl apply -f deployment.yaml
### kubectl apply -f load-balancer.yaml

# CHECKING

### kubectl get pods
### kubectl get svc
### kubectl get deployments

# TODO
### IMAGE FOR POST-GRE
### DEPLOYMENT FOR POST-GRE