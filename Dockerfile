FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY index.html ./
COPY favicon.png ./
COPY assets ./assets
COPY pages ./pages
COPY frontend ./frontend
COPY private ./private

# Copy nginx configuration for API proxying
COPY k8s/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
