#!/bin/bash
set -e

echo "Setting up PostgreSQL for doctaba project..."

# Create user and database
sudo -u postgres psql -c "DROP USER IF EXISTS nicholas;"
sudo -u postgres psql -c "CREATE USER nicholas WITH CREATEDB SUPERUSER;"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS doctaba_dev;"
sudo -u postgres psql -c "CREATE DATABASE doctaba_dev OWNER nicholas;"

echo "PostgreSQL setup complete!"
echo "Testing connection..."
psql -d doctaba_dev -c "SELECT 'Connection successful!' as status;"

echo "You can now run: npm run db:push && npm run dev"