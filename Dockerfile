# Hugging Face Spaces (Docker) - Stable deployment
# - Builds the React/Vite frontend
# - Bundles the Express server (server.ts -> dist/server.cjs)
# - Runs on the port expected by Spaces (PORT env var) with fallback

FROM node:20-bullseye

WORKDIR /app

# Install dependencies first (better Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . ./

# Build (vite build + bundle server)
RUN npm run build

# Hugging Face Spaces expects containers to listen on app_port (default 7860)
ENV PORT=7860
ENV NODE_ENV=production

EXPOSE 7860

# Start server
CMD ["node", "dist/server.cjs"]

