# Use the official Node.js 19.6.1 image based on Alpine Linux
FROM node:19.6.1-alpine

# Install curl
RUN apk update && apk add curl

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Set DNS server
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 5000

# Set environment variables
#ENV MONGO_USERNAME="app"
#ENV MONGO_PASSWORD="admin"

# Command to run the application
CMD ["npm", "start"]
