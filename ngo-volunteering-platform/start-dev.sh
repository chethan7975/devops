#!/bin/bash

# Start development servers for NGO Volunteering Platform

echo "🚀 Starting NGO Volunteering Platform Development Servers..."

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or"
    echo "   mongod --dbpath /path/to/your/db"
    exit 1
fi

# Start backend server
echo "📡 Starting backend server on port 5000..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 3000..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "🔗 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api"
echo "   API Health: http://localhost:5000/api/health"
echo ""
echo "📝 To stop servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎯 Ready to test the application!"

# Wait for user to stop
wait