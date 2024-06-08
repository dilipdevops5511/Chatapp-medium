# Use the official Node.js 16 image based on Alpine Linux
FROM node:16-alpine

# Install curl
RUN apk update && apk add curl

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 5000

# Set environment variables
ENV MONGO_USERNAME="app"
ENV MONGO_PASSWORD="admin"

# Command to run the application
CMD ["npm", "start"]
