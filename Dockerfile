# Multi-stage Dockerfile for Calendar Booking Application
# Stage 1: Build frontend
FROM node:20-alpine AS builder-frontend

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS builder-backend

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/ .

# Build backend
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend production dependencies and build
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend compiled code
COPY --from=builder-backend /app/backend/dist ./dist

# Copy frontend build
COPY --from=builder-frontend /app/frontend/dist ./frontend/dist

# Expose port (Render sets PORT env variable)
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
