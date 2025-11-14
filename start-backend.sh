#!/bin/bash

echo "🚀 Starting Backend Server..."
echo "================================"

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Please update .env with your actual configuration"
    else
        echo "❌ .env.example not found!"
    fi
fi

echo ""
echo "🎯 Starting backend on http://localhost:5000"
echo "================================"
npm run dev
