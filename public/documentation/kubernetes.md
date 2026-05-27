# Kubernetes (K8s) — Feature Documentation

## Overview
Kubernetes manifests deploy the frontend (static web), backend (Express API), and PostgreSQL database with Services for connectivity. The setup is designed for a simple single-namespace deployment.

## Key Files & Locations
- Deployments:
  - `k8s/frontend.yaml`
  - `k8s/backend.yaml`
  - `k8s/postgres.yaml`
- Services:
  - `k8s/frontend-service.yaml`
  - `k8s/backend-service.yaml`
  - `k8s/postgres-service.yaml`
- Configuration:
  - `k8s/configmap.yaml`
  - `k8s/secret.yaml`
- Storage:
  - `k8s/postgres-pv.yaml`
  - `k8s/postgres-pvc.yaml`

## Features
- **Frontend**
  - Deployment exposes port 80
  - LoadBalancer Service exposes the UI externally
  - **Audit change**: added resource requests/limits and readiness/liveness HTTP probes (`/`)
- **Backend**
  - Deployment exposes port 3000
  - LoadBalancer Service exposes the API externally
  - Env vars sourced from ConfigMap/Secret for DB connectivity and JWT/SMTP
  - **Audit change**: added resource requests/limits and readiness/liveness HTTP probes (`/api/programs`), plus `NODE_ENV=production`
  - **Audit change**: optional `ENCRYPTION_KEY` env var wiring (secret key optional)
- **Postgres**
  - Deployment exposes port 5432
  - Service provides cluster-internal hostname (`postgres-service`)
  - PV/PVC provides storage via `hostPath` + manual StorageClass
  - **Audit change**: added resource requests/limits and TCP readiness/liveness probes

## Dependencies
- **SQL Database schema**: `backend/sql/1setup.sql` must be applied to the Postgres instance to create tables/indexes.
- **Node.js Backend**: expects DB + JWT secrets to be present via env vars.

## TODOs & Known Limitations
- **Secrets in repo**: `k8s/secret.yaml` contains base64-encoded credentials and should be treated as dev/local only. Move to a secret manager / sealed-secrets and rotate credentials.
- **Service exposure**: both backend and frontend are `type: LoadBalancer`. In many environments you’ll want `ClusterIP` + Ingress instead.
- **Storage portability**: `hostPath` PV is node-specific and not suitable for managed multi-node clusters; use a dynamic provisioner (e.g. EBS/GCE PD/CSI).
- **APP_URL**: `k8s/configmap.yaml` sets `APP_URL` to localhost; update it to the externally reachable frontend URL in real deployments.

