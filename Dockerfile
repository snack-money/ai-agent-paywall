FROM nginx:latest

# Copy custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static content
COPY balaji.html /usr/share/nginx/html/balaji.html
COPY index.html /usr/share/nginx/html/index.html

# Copy static content
COPY robots.txt /usr/share/nginx/html/robots.txt

# Optional: show denial page
RUN echo "Access Denied: Token invalid or missing." > /usr/share/nginx/html/access_denied.html
