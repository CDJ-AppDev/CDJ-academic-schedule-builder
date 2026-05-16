FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY pages/login.html ./
COPY pages/signup.html ./
COPY style.css ./
COPY favicon.png ./
COPY assets ./assets
COPY pages ./pages
COPY scripts ./scripts

EXPOSE 80
