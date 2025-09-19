# Multi-stage Dockerfile for Ahauros Backend
FROM node:18-alpine AS node-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Python stage for AI services
FROM python:3.11-slim AS python-base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM node:18-alpine AS final

# Install Python and system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    postgresql-dev \
    && ln -sf python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy Node.js dependencies from node-base
COPY --from=node-base /app/node_modules ./node_modules
COPY --from=node-base /app/package*.json ./

# Copy Python dependencies from python-base
COPY --from=python-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-base /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ahauros -u 1001

# Change ownership of the app directory
RUN chown -R ahauros:nodejs /app
USER ahauros

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node scripts/health-check.js

# Start the application
CMD ["npm", "start"]

