# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Define build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_WEBSOCKET_URL
ARG VITE_AI_API_URL
ARG VITE_OAUTH_GOOGLE_URL

# Set environment variables from build args (Vite reads these during build)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL
ENV VITE_OAUTH_GOOGLE_URL=$VITE_OAUTH_GOOGLE_URL

# Copy package files
COPY package*.json yarn.lock* ./

# Install ALL dependencies (including dev) for building
# Remove lock file to avoid rollup platform issues
RUN rm -f package-lock.json && npm install

# Copy source code
COPY . .

# Build the application (Vite will embed env vars into the bundle)
RUN npm run build

# Production stage - using lightweight nginx instead of node
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Install serve globally
RUN npm install -g serve@latest

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
