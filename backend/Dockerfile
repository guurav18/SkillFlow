# Production Dockerfile for SkillFlow Backend
FROM node:20-alpine AS base

# Install security updates and dumb-init for clean process reaping
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy application source
COPY src ./src

# Create non-privileged system user for security
USER node

# Expose backend port
EXPOSE 5000

# Run using dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start production server
CMD ["npm", "start"]
