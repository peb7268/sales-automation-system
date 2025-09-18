#!/bin/bash

# Sales Operations Shell Script
# Abstracts sales automation operations for the PM agent

set -e

# Get the project root (parent of bin directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Source the project-specific .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

# Function to display help
show_help() {
    echo "Sales Operations"
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  add-prospect <name> [--location] [--type]     Add new prospect with research"
    echo "  status                                        Check prospect research status"
    echo "  retry <prospect-name>                         Retry failed prospect research"
    echo "  generate-pitches [--all]                      Generate AI-powered pitches"
    echo "  update-analytics                              Update sales analytics and metrics"
    echo "  sync-kanban                                   Sync sales kanban board"
    echo "  test-analytics                                Test analytics system"
    echo ""
    echo "Mastra Agent Operations:"
    echo "  mastra-prospect <name> [--location] [--type]  Add prospect using Mastra agent"
    echo "  mastra-pitch <prospect-name>                  Generate pitch using Mastra agent"
    echo ""
    echo "System Operations:"
    echo "  setup                                         Set up sales automation system"
    echo "  build                                         Build sales automation project"
    echo "  test                                          Run sales automation tests"
    echo "  start-agents                                  Start sales agents"
    echo "  stop-agents                                   Stop sales agents"
    echo ""
    echo "Examples:"
    echo "  $0 add-prospect \"Restaurant Name\" --location=\"Denver, CO\" --type=\"restaurant\""
    echo "  $0 status"
    echo "  $0 generate-pitches --all"
    echo "  $0 update-analytics"
}

# Check if sales-automation directory exists
check_sales_automation() {
    if [ ! -d "sales-automation" ]; then
        echo "Error: sales-automation directory not found"
        echo "Please ensure you're running this from the MHM root directory"
        exit 1
    fi
}

# Parse command line arguments
LOCATION=""
TYPE=""
ALL_FLAG=""
PROSPECT_NAME=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --location)
            LOCATION="$2"
            shift 2
            ;;
        --location=*)
            LOCATION="${1#*=}"
            shift
            ;;
        --type)
            TYPE="$2"
            shift 2
            ;;
        --type=*)
            TYPE="${1#*=}"
            shift
            ;;
        --all)
            ALL_FLAG="--all"
            shift
            ;;
        -*)
            echo "Unknown option $1"
            show_help
            exit 1
            ;;
        *)
            if [ -z "$COMMAND" ]; then
                COMMAND="$1"
            elif [ -z "$PROSPECT_NAME" ]; then
                PROSPECT_NAME="$1"
            fi
            shift
            ;;
    esac
done

# Main command processing
case "$COMMAND" in
    "add-prospect")
        if [ -z "$PROSPECT_NAME" ]; then
            echo "Error: Prospect name required"
            echo "Usage: $0 add-prospect <name> [--location=<location>] [--type=<type>]"
            exit 1
        fi
        check_sales_automation
        echo "Adding prospect: $PROSPECT_NAME"
        if [ -n "$LOCATION" ] && [ -n "$TYPE" ]; then
            cd sales-automation && npm run add-prospect-enhanced "$PROSPECT_NAME" --location="$LOCATION" --type="$TYPE"
        elif [ -n "$LOCATION" ]; then
            cd sales-automation && npm run add-prospect-enhanced "$PROSPECT_NAME" --location="$LOCATION"
        elif [ -n "$TYPE" ]; then
            cd sales-automation && npm run add-prospect-enhanced "$PROSPECT_NAME" --type="$TYPE"
        else
            cd sales-automation && npm run add-prospect-enhanced "$PROSPECT_NAME"
        fi
        ;;
    "status")
        check_sales_automation
        echo "Checking prospect research status..."
        cd sales-automation && npm run prospect-status
        ;;
    "retry")
        if [ -z "$PROSPECT_NAME" ]; then
            echo "Error: Prospect name required"
            echo "Usage: $0 retry <prospect-name>"
            exit 1
        fi
        check_sales_automation
        echo "Retrying prospect research for: $PROSPECT_NAME"
        cd sales-automation && npm run prospect:retry "$PROSPECT_NAME"
        ;;
    "generate-pitches")
        check_sales_automation
        echo "Generating AI-powered pitches..."
        if [ "$ALL_FLAG" = "--all" ]; then
            cd sales-automation && npm run pitches:all
        else
            cd sales-automation && npm run generate-pitches
        fi
        ;;
    "update-analytics")
        check_sales_automation
        echo "Updating sales analytics..."
        cd sales-automation && npm run update-analytics
        ;;
    "sync-kanban")
        check_sales_automation
        echo "Syncing sales kanban board..."
        cd sales-automation && npm run sync-kanban
        ;;
    "test-analytics")
        check_sales_automation
        echo "Testing analytics system..."
        cd sales-automation && npm run test-analytics
        ;;
    "mastra-prospect")
        if [ -z "$PROSPECT_NAME" ]; then
            echo "Error: Prospect name required"
            echo "Usage: $0 mastra-prospect <name> [--location=<location>] [--type=<type>]"
            exit 1
        fi
        check_sales_automation
        echo "Adding prospect using Mastra agent: $PROSPECT_NAME"
        if [ -n "$LOCATION" ] && [ -n "$TYPE" ]; then
            cd sales-automation && npm run mastra:prospect "$PROSPECT_NAME" --location="$LOCATION" --type="$TYPE"
        elif [ -n "$LOCATION" ]; then
            cd sales-automation && npm run mastra:prospect "$PROSPECT_NAME" --location="$LOCATION"
        else
            cd sales-automation && npm run mastra:prospect "$PROSPECT_NAME"
        fi
        ;;
    "mastra-pitch")
        if [ -z "$PROSPECT_NAME" ]; then
            echo "Error: Prospect name required"
            echo "Usage: $0 mastra-pitch <prospect-name>"
            exit 1
        fi
        check_sales_automation
        echo "Generating pitch using Mastra agent for: $PROSPECT_NAME"
        cd sales-automation && npm run mastra:pitch "$PROSPECT_NAME"
        ;;
    "setup")
        check_sales_automation
        echo "Setting up sales automation system..."
        cd sales-automation && npm run setup
        ;;
    "build")
        check_sales_automation
        echo "Building sales automation project..."
        cd sales-automation && npm run build
        ;;
    "test")
        check_sales_automation
        echo "Running sales automation tests..."
        cd sales-automation && npm run test
        ;;
    "start-agents")
        check_sales_automation
        echo "Starting sales agents..."
        cd sales-automation && npm run agents:start
        ;;
    "stop-agents")
        check_sales_automation
        echo "Stopping sales agents..."
        cd sales-automation && npm run agents:stop
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo ""
        show_help
        exit 1
        ;;
esac