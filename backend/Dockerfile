# Use Node.js Alpine for a lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (will be overridden by docker-compose but good practice)
EXPOSE 3002

# Run app
CMD ["npm", "run", "dev"]