#!/bin/bash
# server/db/setup.sh

DB_NAME="auth_db"
DB_USER="postgres"
# Uncomment and set if needed:
# DB_PASSWORD="your_password" 
# DB_HOST="localhost"
# DB_PORT="5432"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database $DB_NAME already exists."
else
    echo "Creating database $DB_NAME..."
    psql -c "CREATE DATABASE $DB_NAME;"
fi

# Run schema files
echo "Creating types..."
psql -d $DB_NAME -f server/db/schema/types.sql

echo "Creating tables..."
psql -d $DB_NAME -f server/db/schema/auth.sql

echo "Database setup complete!"