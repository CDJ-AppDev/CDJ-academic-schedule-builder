FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY index.html ./
COPY style.css ./
COPY favicon.png ./
COPY assets ./assets
COPY pages ./pages
COPY scripts ./scripts

EXPOSE 80
