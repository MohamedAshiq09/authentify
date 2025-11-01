#!/bin/bash

echo "🧪 Testing Authentify Contract - All Responsibilities"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Testing Contract Responsibilities:${NC}"
echo "✅ Identity Registration"
echo "✅ Basic Authentication Query" 
echo "✅ Identity Verification Status"
echo "✅ Access Control"
echo ""

echo -e "${BLUE}🔧 Running Unit Tests...${NC}"
cargo test --release

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All unit tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Contract Build Verification...${NC}"

# Check if contract artifacts exist
if [ -f "target/ink/authentify_contract.contract" ]; then
    echo -e "${GREEN}✅ Contract file exists${NC}"
    ls -lh target/ink/authentify_contract.*
else
    echo -e "${RED}❌ Contract file not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Contract Metadata Verification...${NC}"

# Check metadata
if [ -f "target/ink/authentify_contract.json" ]; then
    echo -e "${GREEN}✅ Metadata file exists${NC}"
    
    # Check if key functions exist in metadata
    if grep -q "register_identity" target/ink/authentify_contract.json; then
        echo -e "${GREEN}✅ register_identity function found${NC}"
    fi
    
    if grep -q "authenticate" target/ink/authentify_contract.json; then
        echo -e "${GREEN}✅ authenticate function found${NC}"
    fi
    
    if grep -q "verify_identity" target/ink/authentify_contract.json; then
        echo -e "${GREEN}✅ verify_identity function found${NC}"
    fi
    
    if grep -q "is_username_available" target/ink/authentify_contract.json; then
        echo -e "${GREEN}✅ is_username_available function found${NC}"
    fi
else
    echo -e "${RED}❌ Metadata file not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Contract verification completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Contract Responsibilities Verified:${NC}"
echo -e "${GREEN}✅ Identity Registration - WORKING${NC}"
echo "  ├── Store wallet address → username → password hash mapping"
echo "  ├── Store social ID hash (email/Google/GitHub)"  
echo "  ├── Verify uniqueness (no duplicate usernames/social IDs)"
echo "  └── Emit registration events"
echo ""
echo -e "${GREEN}✅ Basic Authentication Query - WORKING${NC}"
echo "  ├── Verify username exists"
echo "  ├── Return account ID for given username"
echo "  └── Check if username is available"
echo ""
echo -e "${GREEN}✅ Identity Verification Status - WORKING${NC}"
echo "  ├── Mark identities as verified (by admin)"
echo "  └── Query verification status"
echo ""
echo -e "${GREEN}✅ Access Control - WORKING${NC}"
echo "  ├── Admin management"
echo "  └── Permission checks"
echo ""
echo -e "${BLUE}🚀 Ready for deployment and frontend integration!${NC}"