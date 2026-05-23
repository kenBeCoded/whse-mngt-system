# Use Node.js LTS
FROM node:20

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

# Expose port
EXPOSE 8000

# Run app
CMD ["npm", "start"]