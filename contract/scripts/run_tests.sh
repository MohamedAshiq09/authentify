#!/bin/bash

echo "🧪 Running Authentify Contract Tests - Fixed Version"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Building contract...${NC}"
cargo contract build --release

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contract built successfully!${NC}"
else
    echo -e "${RED}❌ Contract build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🧪 Running unit tests...${NC}"
cargo test --release -- --nocapture

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo -e "${BLUE}📋 Contract Responsibilities Verified:${NC}"
    echo -e "${GREEN}✅ Identity Registration${NC}"
    echo "  ├── Store wallet address → username → password hash mapping"
    echo "  ├── Store social ID hash (email/Google/GitHub)"  
    echo "  ├── Verify uniqueness (no duplicate usernames/social IDs)"
    echo "  └── Emit registration events"
    echo ""
    echo -e "${GREEN}✅ Basic Authentication Query${NC}"
    echo "  ├── Verify username exists"
    echo "  ├── Return account ID for given username"
    echo "  └── Check if username is available"
    echo ""
    echo -e "${GREEN}✅ Identity Verification Status${NC}"
    echo "  ├── Mark identities as verified (by admin)"
    echo "  └── Query verification status"
    echo ""
    echo -e "${GREEN}✅ Access Control${NC}"
    echo "  ├── Admin management"
    echo "  └── Permission checks"
    echo ""
    echo -e "${YELLOW}📊 Contract Statistics:${NC}"
    echo "- Contract Size: $(ls -lh target/ink/authentify_contract.contract | awk '{print $5}')"
    echo "- WASM Size: $(ls -lh target/ink/authentify_contract.wasm | awk '{print $5}')"
    echo "- Metadata Size: $(ls -lh target/ink/authentify_contract.json | awk '{print $5}')"
    echo ""
    echo -e "${GREEN}🚀 Contract is ready for deployment and frontend integration!${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo -e "${YELLOW}💡 Check the test output above for details${NC}"
    exit 1
fi