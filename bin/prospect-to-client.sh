#!/bin/bash

# Prospect to Client Conversion Script
# Automates the complete workflow from prospect research to client setup
# Usage: ./bin/prospect-to-client.sh "Business Name" --location="City, State" --industry="industry"

set -e

# Get the project root (parent of bin directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Source the project-specific .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Prospect to Client Conversion Script

USAGE:
    ./bin/prospect-to-client.sh "Business Name" [OPTIONS]

ARGUMENTS:
    Business Name    The name of the business to convert from prospect to client

OPTIONS:
    --location      Business location (e.g., "Denver, CO")
    --industry      Business industry type
    --linear-team   Linear team to assign project to (default: "Mile High Marketing")
    --help          Show this help message

EXAMPLES:
    ./bin/prospect-to-client.sh "Acme Corp" --location="Denver, CO" --industry="technology"
    ./bin/prospect-to-client.sh "Local Restaurant" --location="Boulder, CO" --industry="restaurant"

This script will:
1. Run prospect research (if not already done)
2. Create Linear project
3. Set up Obsidian client file
4. Configure FreshBooks client
5. Initialize time tracking
6. Generate initial project documentation
EOF
}

# Parse arguments
BUSINESS_NAME="$1"
LOCATION=""
INDUSTRY=""
LINEAR_TEAM="Mile High Marketing"

if [[ -z "$BUSINESS_NAME" ]] || [[ "$BUSINESS_NAME" == "--help" ]] || [[ "$BUSINESS_NAME" == "-h" ]]; then
    show_help
    exit 0
fi

shift

while [[ $# -gt 0 ]]; do
    case $1 in
        --location=*)
            LOCATION="${1#*=}"
            shift
            ;;
        --industry=*)
            INDUSTRY="${1#*=}"
            shift
            ;;
        --linear-team=*)
            LINEAR_TEAM="${1#*=}"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$BUSINESS_NAME" ]]; then
    print_error "Business name is required"
    show_help
    exit 1
fi

print_status "Starting prospect to client conversion for: $BUSINESS_NAME"
print_status "Location: ${LOCATION:-'Not specified'}"
print_status "Industry: ${INDUSTRY:-'Not specified'}"
print_status "Linear Team: $LINEAR_TEAM"

# Step 1: Ensure prospect research is complete
print_status "Step 1: Checking prospect research status..."
PROSPECT_ARGS="\"$BUSINESS_NAME\""
if [[ -n "$INDUSTRY" ]]; then
    PROSPECT_ARGS="$PROSPECT_ARGS --type=\"$INDUSTRY\""
fi
if [[ -n "$LOCATION" ]]; then
    PROSPECT_ARGS="$PROSPECT_ARGS --location=\"$LOCATION\""
fi

# Check if prospect research already exists
if npm run prospect:status -- "$BUSINESS_NAME" 2>/dev/null | grep -q "completed"; then
    print_success "Prospect research already completed"
else
    print_status "Running prospect research..."
    eval "npm run prospect:enhanced -- $PROSPECT_ARGS"
    if [[ $? -ne 0 ]]; then
        print_error "Prospect research failed"
        exit 1
    fi
    print_success "Prospect research completed"
fi

# Step 2: Create Linear project
print_status "Step 2: Creating Linear project..."
# Note: This would use the Linear MCP server or API to create the project
# For now, we'll use a placeholder command that should be implemented
if command -v linear-create-project &> /dev/null; then
    linear-create-project "$BUSINESS_NAME" --team="$LINEAR_TEAM"
else
    print_warning "Linear project creation requires manual setup"
    print_status "Please create Linear project manually:"
    echo "  - Project Name: $BUSINESS_NAME"
    echo "  - Team: $LINEAR_TEAM"
    echo "  - Description: Client project for $BUSINESS_NAME"
fi

# Step 3: Set up Obsidian client file
print_status "Step 3: Creating Obsidian client file..."
CLIENT_FILE_NAME=$(echo "$BUSINESS_NAME" | sed 's/ /-/g')
OBSIDIAN_PATH="${OBSIDIAN_PROSPECTS_PATH:-$HOME/Documents/Main/Projects/Clients}"

mkdir -p "$OBSIDIAN_PATH"

cat > "$OBSIDIAN_PATH/${CLIENT_FILE_NAME}.md" << EOF
# $BUSINESS_NAME

## Client Information
- **Business Name**: $BUSINESS_NAME
- **Location**: ${LOCATION:-'TBD'}
- **Industry**: ${INDUSTRY:-'TBD'}
- **Status**: Active Client
- **Project Shortcode**: #${CLIENT_FILE_NAME}

## Linear Integration
- **Linear Team**: $LINEAR_TEAM
- **Linear Project**: $BUSINESS_NAME
- **Project ID**: TBD (Update after Linear project creation)

## FreshBooks Integration
- **Client ID**: TBD (Update after FreshBooks setup)
- **Default Project**: $BUSINESS_NAME
- **Billing Rate**: TBD

## Time Tracking
Use project shortcode for time tracking: #${CLIENT_FILE_NAME}

## Project Notes
Created: $(date '+%Y-%m-%d')
Converted from prospect research on $(date '+%Y-%m-%d')

## Related Documentation
- [Prospect Research](../Prospects/${CLIENT_FILE_NAME}.md) (if exists)
- [Project Documentation](../../Projects/${CLIENT_FILE_NAME}/) (to be created)

---
Tags: #client #active #${INDUSTRY:-general}
EOF

print_success "Created Obsidian client file: $OBSIDIAN_PATH/${CLIENT_FILE_NAME}.md"

# Step 4: FreshBooks client setup
print_status "Step 4: Setting up FreshBooks client..."
if [[ -f "./bin/freshbooks-setup.sh" ]]; then
    ./bin/freshbooks-setup.sh "$BUSINESS_NAME" --location="$LOCATION"
else
    print_warning "FreshBooks setup requires manual configuration"
    print_status "Please set up FreshBooks client manually:"
    echo "  - Client Name: $BUSINESS_NAME"
    echo "  - Location: ${LOCATION:-'TBD'}"
    echo "  - Create default project for time tracking"
fi

# Step 5: Initialize time tracking
print_status "Step 5: Initializing time tracking..."
if [[ -f "./bin/track-time.sh" ]]; then
    ./bin/track-time.sh setup --client="$BUSINESS_NAME" --project="$BUSINESS_NAME"
else
    print_warning "Time tracking setup requires manual configuration"
fi

# Step 6: Generate project documentation structure
print_status "Step 6: Creating project documentation structure..."
PROJECT_DIR="./projects/${CLIENT_FILE_NAME}"
mkdir -p "$PROJECT_DIR/docs"
mkdir -p "$PROJECT_DIR/assets"
mkdir -p "$PROJECT_DIR/deliverables"

cat > "$PROJECT_DIR/README.md" << EOF
# $BUSINESS_NAME Project

## Project Overview
Client project for $BUSINESS_NAME

## Quick Start
- **Client**: $BUSINESS_NAME
- **Location**: ${LOCATION:-'TBD'}
- **Industry**: ${INDUSTRY:-'TBD'}
- **Started**: $(date '+%Y-%m-%d')

## Time Tracking
Use shortcode: #${CLIENT_FILE_NAME}

## Documentation
- [Client Profile](${OBSIDIAN_PATH}/${CLIENT_FILE_NAME}.md)
- [Project Documentation](./docs/)
- [Deliverables](./deliverables/)

## Links
- Linear Project: TBD
- FreshBooks Client: TBD

---
Generated: $(date '+%Y-%m-%d %H:%M:%S')
EOF

print_success "Created project directory: $PROJECT_DIR"

# Final summary
print_success "✅ Prospect to Client conversion completed!"
echo ""
print_status "Summary of actions taken:"
echo "  ✓ Prospect research verified/completed"
echo "  ○ Linear project creation (may require manual setup)"
echo "  ✓ Obsidian client file created"
echo "  ○ FreshBooks client setup (may require manual setup)"  
echo "  ○ Time tracking initialized (may require manual setup)"
echo "  ✓ Project documentation structure created"
echo ""
print_status "Next steps:"
echo "  1. Verify Linear project was created successfully"
echo "  2. Complete FreshBooks client setup if needed"
echo "  3. Test time tracking with: npm run track-time -- start #${CLIENT_FILE_NAME}"
echo "  4. Begin project work and documentation"
echo ""
print_status "Client file location: $OBSIDIAN_PATH/${CLIENT_FILE_NAME}.md"
print_status "Project directory: $PROJECT_DIR"