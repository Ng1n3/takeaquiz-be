#!/bin/bash

echo "Waiting for PostgreSQL to start..."
# Increase timeout and add more verbose output
for i in {1..30}; do
    if pg_isready -h db -U ${POSTGRES_USER}; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting for PostgreSQL... ${i}/30"
    sleep 2
done

# If we never got ready, exit
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

echo "Dropping existing schema and recreating it..."
PGPASSWORD=${POSTGRES_PASSWORD} psql -h db -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'


echo "generate drizzle-client..."
timeout 30s bun run db:generate || echo "db:generate timed out!"

echo "Running migrations..."
bun run db:migrate

echo "Database setup completed successfully!"
