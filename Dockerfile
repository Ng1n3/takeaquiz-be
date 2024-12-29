#official Deno.js runtime as parent image
FROM denoland/deno:alpine AS base

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
COPY deno.json deno.lock main.ts ./
COPY src/config.ts ./src/

#cache dependencies
RUN deno cache --reload --lock=deno.lock src/config.ts

# Copy application source
COPY . .

#Compline the app
RUN deno cache main.ts && \
chown -R deno:deno /app

# Define the production stage
FROM base AS production

#Switch to non-root user
USER deno

#Expose port
EXPOSE 5000

# Add Health checks
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
CMD curl -f http://localhost:5000/health || exit 1

CMD ["deno", "run", "--allow-net", "main.ts" ]

#Define the development stage
FROM base AS development
#Switch to non-root user
USER deno

#Expose port
EXPOSE 5000

CMD ["deno", "task", "dev" ]

