#!/bin/bash

echo "🚀 Deploying Authentify Contract..."

# Check if contract is built
if [ ! -f "target/ink/authentify_contract.contract" ]; then
    echo "❌ Contract not built. Run ./scripts/build.sh first!"
    exit 1
fi

# Deploy to local node (adjust for testnet/mainnet)
cargo contract instantiate \
    --constructor new \
    --suri //Alice \
    --skip-confirm \
    --execute

echo "✅ Contract deployed!"
echo "📝 Save the contract address from above output!"