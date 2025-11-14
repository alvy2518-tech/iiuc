#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   Job Portal - Fresh Start${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    pkill -9 node 2>/dev/null
    lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null
    lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

echo -e "${YELLOW}🧹 Step 1: Cleaning up old processes...${NC}"
pkill -9 node 2>/dev/null
sleep 1
lsof -ti:5000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1
echo -e "${GREEN}✓ Processes cleaned${NC}"
echo ""

echo -e "${YELLOW}🧹 Step 2: Clearing build cache...${NC}"
rm -rf frontend/.next 2>/dev/null
rm -rf frontend/node_modules/.cache 2>/dev/null
rm -f backend.log frontend.log 2>/dev/null
echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

echo -e "${YELLOW}🚀 Step 3: Starting Backend Server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

echo -e "${YELLOW}🚀 Step 4: Starting Frontend Server...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Servers Running Successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📌 Access Points:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5000/api/v1${NC}"
echo ""
echo -e "${YELLOW}📋 View Logs:${NC}"
echo -e "   Backend:  ${BLUE}tail -f backend.log${NC}"
echo -e "   Frontend: ${BLUE}tail -f frontend.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
