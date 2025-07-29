# Doctaba

A modern healthcare platform built with React, Express, and PostgreSQL.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 12 or higher)

### Installing PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS:
```bash
brew install postgresql
```

#### Windows:
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd doctaba

# Install dependencies
npm install
```

### 2. PostgreSQL Database Setup

#### Option 1: Automated Setup (Recommended)
Run the provided setup script:

```bash
chmod +x setup-postgres.sh
./setup-postgres.sh
```

#### Option 2: Manual Setup
```bash
# Create PostgreSQL user and database
sudo -u postgres psql -c "CREATE USER $(whoami) WITH CREATEDB SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE doctaba_dev OWNER $(whoami);"

# Test the connection
psql -d doctaba_dev -c "SELECT version();"
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:

```env
DATABASE_URL=postgres:///doctaba_dev?host=/var/run/postgresql
```

### 4. Database Schema Migration

Push the database schema to your local PostgreSQL:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
doctaba/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Database operations
├── shared/                 # Shared code
│   └── schema.ts          # Database schema
├── .env                   # Environment variables
└── drizzle.config.ts      # Database configuration
```

## Troubleshooting

### PostgreSQL Connection Issues

If you encounter PostgreSQL connection errors:

1. **Check if PostgreSQL is running:**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Start PostgreSQL if not running:**
   ```bash
   sudo systemctl start postgresql
   ```

3. **Verify user exists:**
   ```bash
   sudo -u postgres psql -c "\du"
   ```

4. **Check database exists:**
   ```bash
   psql -l
   ```

### Common Error: "role does not exist"

If you see `role "username" does not exist`, run:

```bash
sudo -u postgres createuser --interactive $(whoami)
# Choose 'y' for superuser
```

### Common Error: "database does not exist"

If you see `database "doctaba_dev" does not exist`, run:

```bash
sudo -u postgres createdb doctaba_dev -O $(whoami)
```

### Environment Variables Not Loading

Ensure your `.env` file is in the project root and contains:

```env
DATABASE_URL=postgres:///doctaba_dev?host=/var/run/postgresql
```

## Development Notes

- The application runs on port 5000 by default
- The frontend and backend are served from the same port in development
- Database changes require running `npm run db:push` to apply migrations
- Hot reloading is enabled for both frontend and backend code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally using the setup instructions above
5. Submit a pull request
