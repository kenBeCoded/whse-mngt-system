# Use lightweight Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Expose the correct port
EXPOSE 5175

# Command to run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5175"]
