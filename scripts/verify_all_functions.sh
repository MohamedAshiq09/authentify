#!/bin/bash

echo "🔍 Verifying All Contract Functions"
echo "=================================="

# Check if contract metadata contains all required functions
METADATA_FILE="target/ink/authentify_contract.json"

if [ ! -f "$METADATA_FILE" ]; then
    echo "❌ Metadata file not found. Build the contract first."
    exit 1
fi

echo "📋 Checking Contract Functions..."

# Core Registration Functions
echo ""
echo "🔐 IDENTITY REGISTRATION FUNCTIONS:"
functions=(
    "register_identity"
    "is_username_available" 
    "is_social_id_available"
    "has_identity"
)

for func in "${functions[@]}"; do
    if grep -q "\"name\":\"$func\"" "$METADATA_FILE"; then
        echo "✅ $func - FOUND"
    else
        echo "❌ $func - MISSING"
    fi
done

# Authentication Functions  
echo ""
echo "🔑 AUTHENTICATION FUNCTIONS:"
auth_functions=(
    "authenticate"
    "verify_password"
)

for func in "${auth_functions[@]}"; do
    if grep -q "\"name\":\"$func\"" "$METADATA_FILE"; then
        echo "✅ $func - FOUND"
    else
        echo "❌ $func - MISSING"
    fi
done

# Identity Management Functions
echo ""
echo "👤 IDENTITY MANAGEMENT FUNCTIONS:"
identity_functions=(
    "verify_identity"
    "change_password"
    "unlock_account"
    "get_identity"
    "get_account_by_username"
    "get_account_by_social"
)

for func in "${identity_functions[@]}"; do
    if grep -q "\"name\":\"$func\"" "$METADATA_FILE"; then
        echo "✅ $func - FOUND"
    else
        echo "❌ $func - MISSING"
    fi
done

# Session Management Functions
echo ""
echo "🔄 SESSION MANAGEMENT FUNCTIONS:"
session_functions=(
    "create_session"
    "verify_session" 
    "revoke_session"
)

for func in "${session_functions[@]}"; do
    if grep -q "\"name\":\"$func\"" "$METADATA_FILE"; then
        echo "✅ $func - FOUND"
    else
        echo "❌ $func - MISSING"
    fi
done

# Query Functions
echo ""
echo "📊 QUERY FUNCTIONS:"
query_functions=(
    "get_total_users"
    "get_active_sessions"
    "get_admin"
    "get_max_failed_attempts"
    "get_lockout_duration"
)

for func in "${query_functions[@]}"; do
    if grep -q "\"name\":\"$func\"" "$METADATA_FILE"; then
        echo "✅ $func - FOUND"
    else
        echo "❌ $func - MISSING"
    fi
done

# Admin Functions
echo ""
echo "👑 ADMIN FUNCTIONS:"
admin_functions=(
    "transfer_admin"
    "update_max_failed_attempts"
    "update_lockout_duration"
)

for func in "${admin_functions[@]}"; do
    if grep -q "\"name\":\"$func\"" "$METADATA_FILE"; then
        echo "✅ $func - FOUND"
    else
        echo "❌ $func - MISSING"
    fi
done

# Check Events
echo ""
echo "📡 CONTRACT EVENTS:"
events=(
    "IdentityRegistered"
    "IdentityVerified"
    "LoginSuccessful"
    "LoginFailed"
    "AccountLocked"
    "AccountUnlocked"
    "SessionCreated"
    "SessionRevoked"
    "PasswordChanged"
)

for event in "${events[@]}"; do
    if grep -q "\"name\":\"$event\"" "$METADATA_FILE"; then
        echo "✅ $event - FOUND"
    else
        echo "❌ $event - MISSING"
    fi
done

echo ""
echo "🎉 Function verification completed!"
echo ""
echo "📈 Contract Statistics:"
echo "- Contract Size: $(ls -lh target/ink/authentify_contract.contract | awk '{print $5}')"
echo "- WASM Size: $(ls -lh target/ink/authentify_contract.wasm | awk '{print $5}')"
echo "- Metadata Size: $(ls -lh target/ink/authentify_contract.json | awk '{print $5}')"