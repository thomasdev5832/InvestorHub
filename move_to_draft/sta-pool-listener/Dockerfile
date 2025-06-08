# Use official Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose the metrics port
EXPOSE 3001

# Start the application
CMD [ "npm", "start" ]