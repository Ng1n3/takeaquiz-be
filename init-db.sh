#!/bin/bash

echo "Waiting for PostgreSQL to start..."
for i in {1..30}; do
    if pg_isready -h db -U ${POSTGRES_USER}; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting for PostgreSQL... ${i}/30"
    sleep 2
done

if ! pg_isready -h db -U ${POSTGRES_USER}; then
    echo "PostgreSQL failed to become ready in time"
    exit 1
fi

echo "Checking if the database exists..."
DB_EXISTS=$(PGPASSWORD=${POSTGRES_PASSWORD} psql -h db -U ${POSTGRES_USER} -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'")

if [ -z "$DB_EXISTS" ]; then
    echo "Database '${POSTGRES_DB}' does not exist. Creating it..."
    PGPASSWORD=${POSTGRES_PASSWORD} psql -h db -U ${POSTGRES_USER} -c "CREATE DATABASE ${POSTGRES_DB};"
else
    echo "Database '${POSTGRES_DB}' already exists."
fi

echo "Generating drizzle client..."
timeout 30s bun run db:generate || echo "db:generate timed out!"

echo "Pushing schema changes..."
timeout 30s bun run db:push || echo "db:push timed out!"

echo "Database setup completed successfully!"
