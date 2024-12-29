#official Deno.js runtime as parent image
FROM oven/bun:canary-alpine AS base

# Install additional security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl tzdata && \
    rm -rf /var/cache/apk/*

#create a non-root user if it doesn't exist
RUN getent group deno || addgroup --system deno && \
    id -u deno &>/dev/null || adduser --system --ingroup deno deno

#set working director
WORKDIR /app

#copy dependency files
COPY package.json ./
COPY bun.lockb ./

#install dependencies
RUN bun install

# Copy application source
COPY . .

#change ownereship to non-root
RUN chown -R bun:bun /app

# Define the production stage
FROM base AS production

#Switch to non-root user
USER bun

#Expose port
EXPOSE 5000

# Add Health checks
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
CMD curl -f http://localhost:5000/health || exit 1

CMD ["bun", "run", "main.ts" ]

#Define the development stage
FROM base AS development
#Switch to non-root user
USER bun

#Expose port
EXPOSE 5000

CMD ["bun", "run", "dev" ]