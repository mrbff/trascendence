FROM nginx:alpine

COPY conf/nginx.conf /etc/nginx/nginx.conf

COPY conf/security-headers.conf /etc/nginx/security-headers.conf

CMD ["nginx", "-g", "daemon off;"]
