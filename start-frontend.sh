#!/bin/bash

echo "🎨 Starting Frontend Server..."
echo "================================"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local
    echo "✅ Created .env.local with default API URL"
fi

echo ""
echo "🎯 Starting frontend on http://localhost:3000"
echo "================================"
npm run dev
