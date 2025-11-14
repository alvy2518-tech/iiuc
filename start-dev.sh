#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   Job Portal - Development Server${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if tmux is available
if command -v tmux &> /dev/null; then
    echo -e "${GREEN}🚀 Starting servers in tmux session...${NC}"
    echo ""
    
    # Kill existing session if it exists
    tmux kill-session -t jobportal 2>/dev/null
    
    # Create new tmux session
    tmux new-session -d -s jobportal -n "JobPortal"
    
    # Split window horizontally
    tmux split-window -h -t jobportal
    
    # Run backend in left pane
    tmux send-keys -t jobportal:0.0 "cd $(pwd)/backend && npm run dev" C-m
    
    # Run frontend in right pane
    tmux send-keys -t jobportal:0.1 "cd $(pwd)/frontend && npm run dev" C-m
    
    # Set pane titles
    tmux select-pane -t jobportal:0.0 -T "Backend"
    tmux select-pane -t jobportal:0.1 -T "Frontend"
    
    echo -e "${GREEN}✅ Servers started in tmux session 'jobportal'${NC}"
    echo ""
    echo -e "${BLUE}📌 Access points:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "   Backend:  ${GREEN}http://localhost:5000/api/v1${NC}"
    echo ""
    echo -e "${YELLOW}💡 Commands:${NC}"
    echo -e "   View servers: ${GREEN}tmux attach -t jobportal${NC}"
    echo -e "   Detach:       ${GREEN}Ctrl+B then D${NC}"
    echo -e "   Stop servers: ${GREEN}tmux kill-session -t jobportal${NC}"
    echo ""
    
    # Attach to the session
    tmux attach -t jobportal
    
else
    # Fallback: run in parallel without tmux
    echo -e "${YELLOW}⚠️  tmux not found, running servers in background...${NC}"
    echo -e "${GREEN}Installing dependencies and starting servers...${NC}"
    echo ""
    
    # Start backend
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Servers started!${NC}"
    echo ""
    echo -e "${BLUE}📌 Access points:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "   Backend:  ${GREEN}http://localhost:5000/api/v1${NC}"
    echo ""
    echo -e "${YELLOW}📋 Logs:${NC}"
    echo -e "   Backend:  tail -f backend.log"
    echo -e "   Frontend: tail -f frontend.log"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
    
    # Wait for processes
    wait $BACKEND_PID $FRONTEND_PID
fi
