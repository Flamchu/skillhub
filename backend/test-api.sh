#!/bin/bash

echo "🚀 Testing YouTube Course API Endpoints"
echo "======================================"

# Configuration
BASE_URL="http://localhost:4000/api"
ADMIN_TOKEN=""  # You'll need to set this with a valid admin token

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function for API calls
call_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [[ -n "$ADMIN_TOKEN" ]]; then
        auth_header="-H \"Authorization: Bearer $ADMIN_TOKEN\""
    fi
    
    echo -e "${BLUE}➤ $method $endpoint${NC}"
    if [[ -n "$data" ]]; then
        echo -e "${YELLOW}   Data: $data${NC}"
    fi
    
    local cmd="curl -s -X $method \"$BASE_URL$endpoint\" -H \"Content-Type: application/json\""
    if [[ -n "$auth_header" ]]; then
        cmd="$cmd $auth_header"
    fi
    if [[ -n "$data" ]]; then
        cmd="$cmd -d '$data'"
    fi
    
    local response=$(eval $cmd)
    local status_code=$(eval "$cmd -o /dev/null -w '%{http_code}'")
    
    if [[ $status_code -eq 200 ]] || [[ $status_code -eq 201 ]]; then
        echo -e "${GREEN}✅ Success ($status_code)${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}❌ Failed ($status_code)${NC}"
        echo "$response"
    fi
    echo ""
}

# Check if server is running
echo "🔍 Checking if server is running..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [[ $SERVER_STATUS -ne 200 ]]; then
    echo -e "${RED}❌ Server not running at $BASE_URL${NC}"
    echo "Please start the backend server with: yarn dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Prompt for admin token if not set
if [[ -z "$ADMIN_TOKEN" ]]; then
    echo -e "${YELLOW}⚠️  Admin token required for import endpoints${NC}"
    echo "To test the import functionality, you'll need an admin JWT token."
    echo "You can:"
    echo "1. Login as admin through the frontend and copy the token from localStorage"
    echo "2. Or run: export ADMIN_TOKEN='your-jwt-token-here'"
    echo ""
    echo "Continuing with public endpoint tests..."
    echo ""
fi

# Test 1: Get courses (should include any previously imported YouTube courses)
echo "📚 Test 1: Get all courses"
echo "------------------------"
call_api "GET" "/courses"

# Test 2: Get courses with YouTube filter
echo "📹 Test 2: Get YouTube courses only"
echo "-----------------------------------"
call_api "GET" "/courses?source=YOUTUBE"

# Test 3: Test YouTube import (requires admin token)
if [[ -n "$ADMIN_TOKEN" ]]; then
    echo "📥 Test 3: Import YouTube video"
    echo "-------------------------------"
    
    # Import a single video
    VIDEO_DATA='{
        "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        "tags": ["JavaScript", "Tutorial", "API-Test"],
        "difficulty": "BEGINNER",
        "overrides": {
            "title": "Test JavaScript Video Import"
        }
    }'
    
    call_api "POST" "/courses/import/youtube" "$VIDEO_DATA"
    
    echo "📥 Test 4: Import YouTube playlist"
    echo "----------------------------------"
    
    # Import a small playlist
    PLAYLIST_DATA='{
        "url": "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy4QAjFlPNRVEjtg2FURHK9",
        "tags": ["JavaScript", "Beginner", "API-Test"],
        "difficulty": "BEGINNER"
    }'
    
    call_api "POST" "/courses/import/youtube" "$PLAYLIST_DATA"
else
    echo "⚠️  Skipping import tests (no admin token)"
    echo ""
fi

# Test 5: Get courses with lessons
if [[ -n "$COURSE_ID" ]]; then
    echo "📖 Test 5: Get course with lessons"
    echo "----------------------------------"
    call_api "GET" "/courses/$COURSE_ID/lessons"
else
    echo "⚠️  Skipping lesson test (no course ID available)"
    echo ""
fi

# Test summary
echo "📊 Test Summary"
echo "==============="
echo -e "${GREEN}✅ Public endpoints tested${NC}"
if [[ -n "$ADMIN_TOKEN" ]]; then
    echo -e "${GREEN}✅ Admin endpoints tested${NC}"
else
    echo -e "${YELLOW}⚠️  Admin endpoints skipped (no token)${NC}"
fi

echo ""
echo "🎯 Next steps to fully test:"
echo "1. Set ADMIN_TOKEN environment variable"
echo "2. Test user progress endpoints (requires user authentication)"
echo "3. Check the database for imported courses and lessons"

echo ""
echo "📋 Quick admin token setup:"
echo "1. Login to frontend as admin"
echo "2. Open browser dev tools → Application → Local Storage"
echo "3. Copy the 'auth_token' value"
echo "4. Export ADMIN_TOKEN='paste-token-here'"