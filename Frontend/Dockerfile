# Stage 1: Builder
FROM node:18.12.1-buster-slim AS builder

# Set the working directory
WORKDIR /app

# Copy necessary files to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY public/ public/
COPY src/ src/

# Build the application
RUN npm run build

# Debugging step: list the contents after build
RUN echo "After build:" && ls -la /app && ls -la /app/build

# Stage 2: Nginx
FROM nginx:1.23.2-alpine

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the builder stage to the nginx html directory
COPY --from=builder /app/build /usr/share/nginx/html

# Ensure proper permissions for the nginx user
RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Switch to nginx user
USER nginx

# Expose port 80 for Nginx
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
