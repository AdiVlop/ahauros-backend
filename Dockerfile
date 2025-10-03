# Node.js Dockerfile for Ahauros Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY backend/ .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ahauros -u 1001

# Change ownership of the app directory
RUN chown -R ahauros:nodejs /app
USER ahauros

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node scripts/health-check.js

# Start the application
CMD ["npx", "pm2-runtime", "src/server.js"]