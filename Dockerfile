FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY index.html ./
COPY favicon.png ./
COPY assets ./assets
COPY pages ./pages
COPY frontend ./frontend
COPY private ./private

EXPOSE 80
