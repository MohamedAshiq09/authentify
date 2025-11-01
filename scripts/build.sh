#!/bin/bash

echo "🔨 Building Authentify Contract..."

# Clean previous builds
cargo clean

# Build the contract
cargo contract build --release

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📦 Contract artifacts:"
    ls -lh target/ink/authentify_contract.*
    echo ""
    echo "📍 Contract location: target/ink/authentify_contract.contract"
else
    echo "❌ Build failed!"
    exit 1
fi