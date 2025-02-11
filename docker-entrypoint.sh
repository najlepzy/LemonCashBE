#!/bin/sh
set -e

echo "Running Prisma migrations..."
yarn prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting the application..."
exec "$@"
