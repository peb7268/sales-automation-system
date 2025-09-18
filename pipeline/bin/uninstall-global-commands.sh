#!/bin/bash

# Sales Pipeline Global Command Uninstaller
# Removes global bin commands for sales-pipeline component

set -e

INSTALL_DIR="/usr/local/bin"
COMMANDS=(
    "sales-prospect"
    "sales-pitch"
    "sales-analytics"
    "sales-kanban"
    "sales-status"
    "sales-dev"
    "mastra-prospect"
    "mastra-pitch"
    "mastra-status"
)

echo "🗑️  Uninstalling sales-pipeline global commands..."

# Check if we have write permissions to /usr/local/bin
if [ ! -w "$INSTALL_DIR" ]; then
    echo "❌ No write permission to $INSTALL_DIR"
    echo "Please run with sudo: sudo npm run uninstall:global"
    exit 1
fi

# Remove each command
for cmd in "${COMMANDS[@]}"; do
    if [ -f "$INSTALL_DIR/$cmd" ]; then
        rm -f "$INSTALL_DIR/$cmd"
        echo "✅ Removed: $cmd"
    else
        echo "⚠️  Not found: $cmd"
    fi
done

echo ""
echo "🎉 Sales-pipeline global commands uninstalled successfully!"