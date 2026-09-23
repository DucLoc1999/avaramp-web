#!/bin/sh
set -e

echo "Starting entrypoint script..."

if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
    echo "Warning: DB_HOST or DB_PORT not set. Skipping database check."
else
    echo "Checking database connection at $DB_HOST:$DB_PORT..."
    timeout=60
    counter=0

    while ! nc -z $DB_HOST $DB_PORT; do
        counter=$((counter + 1))
        if [ $counter -ge $timeout ]; then
            echo "Error: Database connection timeout after ${timeout}s"
            exit 1
        fi
        echo "Waiting for database... (${counter}s)"
        sleep 1
    done
    echo "Database connected."
fi

if [ -d "/app/logs" ]; then
    echo "Setting up logs directory..."
    chown -R node:node /app/logs
    chmod -R 755 /app/logs
else
    echo "Logs directory not found, creating..."
    mkdir -p /app/logs
    chown -R node:node /app/logs
    chmod -R 755 /app/logs
fi

if [ -d "/app/backend/logs" ]; then
    echo "Setting up backend logs directory..."
    chown -R node:node /app/backend/logs
    chmod -R 755 /app/backend/logs
else
    echo "Backend logs directory not found, creating..."
    mkdir -p /app/backend/logs
    chown -R node:node /app/backend/logs
    chmod -R 755 /app/backend/logs
fi

if [ -d "/app/data" ]; then
    echo "Setting up data directory..."
    chown -R node:node /app/data
    chmod -R 755 /app/data
else
    echo "Data directory not found, creating..."
    mkdir -p /app/data
    chown -R node:node /app/data
    chmod -R 755 /app/data
fi

echo "Switching to 'node' user..."
exec su-exec node "$@"
