#!/bin/bash

echo "🧪 Running Authentify Contract Tests..."

# Run unit tests
cargo test --release

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed!"
    exit 1
fi