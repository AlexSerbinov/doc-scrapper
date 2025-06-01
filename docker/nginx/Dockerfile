# Nginx Dockerfile with SSL support
FROM nginx:alpine

# Install openssl for certificate generation
RUN apk add --no-cache openssl curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate for development
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=UA/ST=Ukraine/L=Kyiv/O=DocScrapper/CN=localhost"

# Create non-root user
RUN addgroup -g 1001 -S nginx-user
RUN adduser -S nginx-user -u 1001

# Set proper permissions
RUN chown -R nginx-user:nginx-user /etc/nginx/ssl
RUN chmod 600 /etc/nginx/ssl/nginx.key
RUN chmod 644 /etc/nginx/ssl/nginx.crt

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f -k https://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 