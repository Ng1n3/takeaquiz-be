#official Deno.js runtime as parent image
FROM denoland/deno:2.1.3-alpine

# Install additional security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl tzdata && \
    rm -rf /var/cache/apk/*

#create a non-root user
RUN addgroup --system deno && \
adduser --system --ingroup deno deno

#set working director
WORKDIR /app

#copy dependency files
COPY deno.json deno.lock ./

#cache dependencies
RUN deno cache main.ts

# Copy application source
COPY . .

#Compline the app
RUN deno cache main.ts && \
chown -R deno:deno /app

#Switch to non-root user
USER deno

#Expose port
EXPOSE 5000

# Add Health checks
HEALTHCHECK --interval= --timeout=30s --start-period=5s --retries=3 \
CMD curl -f http://localhost:5000/health || exit 1

CMD ["deno", "run", "--allow-net", "main.ts" ]
