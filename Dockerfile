# ---- Build Stage ----
    FROM node:20-alpine AS builder
    WORKDIR /usr/src/app
    
    # Copy package files
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy all source code
    COPY . .
    
    # Build Next.js
    RUN npm run build
    
    # ---- Production Stage ----
    FROM node:20-alpine AS production
    WORKDIR /usr/src/app
    
    # Copy package files
    COPY package*.json ./
    
    # Install only production deps
    RUN npm install --omit=dev
    
    # Copy build output
    COPY --from=builder /usr/src/app/.next ./.next
    COPY --from=builder /usr/src/app/public ./public
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    
    # Copy config if present (JS or TS)
    COPY --from=builder /usr/src/app/next.config.* ./ 
    
    # Expose port
    EXPOSE 3000
    
    # Start Next.js
    CMD ["npx", "next", "start", "-p", "3000"]
    