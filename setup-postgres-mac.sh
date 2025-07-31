#!/bin/bash
set -e

echo "Setting up PostgreSQL for doctaba project on macOS..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    brew install postgresql@15
    echo "Starting PostgreSQL service..."
    brew services start postgresql@15
else
    echo "PostgreSQL already installed. Starting service..."
    brew services start postgresql@15
fi

# Wait a moment for PostgreSQL to start
sleep 3

# Get current user
CURRENT_USER=$(whoami)

echo "Creating database and user..."

# Create user if it doesn't exist
psql postgres -c "CREATE USER $CURRENT_USER WITH CREATEDB SUPERUSER;" 2>/dev/null || echo "User $CURRENT_USER already exists, skipping user creation."

# Create database
psql postgres -c "DROP DATABASE IF EXISTS doctaba_dev;"
psql postgres -c "CREATE DATABASE doctaba_dev OWNER $CURRENT_USER;"

echo "PostgreSQL setup complete!"

# Create DATABASE_URL
DATABASE_URL="postgresql://$CURRENT_USER@localhost:5432/doctaba_dev"

echo "Database URL: $DATABASE_URL"
echo ""
echo "Add this to your environment variables:"
echo "export DATABASE_URL=\"$DATABASE_URL\""
echo ""
echo "Or create a .env file with:"
echo "DATABASE_URL=\"$DATABASE_URL\""
echo ""

# Test connection
echo "Testing connection..."
psql -d doctaba_dev -c "SELECT 'Connection successful!' as status;"

echo ""
echo "Setup complete! You can now run:"
echo "1. Add DATABASE_URL to your environment"
echo "2. npm run db:push"
echo "3. npm run dev"