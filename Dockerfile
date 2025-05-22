# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy build files from build stage
COPY --from=build /app/build ./build

# Expose port (will be overridden by Render)
EXPOSE 10000

# Start the app using environment variable PORT
CMD ["sh", "-c", "serve -s build -l ${PORT:-10000}"]

# # Build stage
# FROM node:18-alpine as build

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# # Production stage
# FROM nginx:alpine

# # Copy built files
# COPY --from=build /app/build /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"] 