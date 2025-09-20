#!/bin/bash

# NGO Volunteer Management System Startup Script

echo "🚀 Starting NGO Volunteer Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please ensure MongoDB is installed and running."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/certificates
mkdir -p server/uploads

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Copying from .env.example..."
    cp server/.env.example server/.env
    echo "📝 Please update server/.env with your configuration."
fi

if [ ! -f "client/.env.local" ]; then
    echo "📝 Creating client/.env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > client/.env.local
fi

echo "✅ Setup complete!"
echo ""
echo "🌐 Starting the application..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API:      http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start the application
npm run dev