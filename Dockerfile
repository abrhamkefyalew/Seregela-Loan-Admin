# -----------------------------------
# Stage 1: Build app
# -----------------------------------
FROM node:22.12.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -----------------------------------
# Stage 2: Run production build
# -----------------------------------
FROM node:22.12.0-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy necessary build artifacts and files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Use env var from .env for port
ENV PORT=${CONTAINER_PORT}
EXPOSE ${CONTAINER_PORT}

# Start using shell to expand $PORT
#
#
# PRODUCTION    -   -   - NO Volume Mount (NO Live Code Editing)
# CMD ["sh", "-c", "npx next start -p $PORT"]
#
#
# DEVELOPMENT   -   -   - VOLUME MOUNT (LIVE Code Editing) = [ - WORKING - ] - [ - USED - ]
CMD ["sh", "-c", "npx next dev -p $PORT"]
