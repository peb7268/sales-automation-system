# JSON-Based Task Management System

## 🎯 Overview

The MHM sales automation pipeline now uses a **centralized JSON-based task management system** that processes all data locally and outputs to Obsidian markdown format. This system replaces external task management dependencies with a unified, local-first approach.

## ✅ **Key Features**

- **✅ JSON Configuration**: All tasks defined in JSON files
- **✅ Local Processing**: Everything runs locally in this project
- **✅ JSON Data Pipeline**: Process data as JSON → Transform → Insert into Obsidian
- **✅ Obsidian Integration**: All dashboards remain in Obsidian markdown
- **✅ No External Dependencies**: No TaskMaster or other external systems
- **✅ Scheduled & Triggered Tasks**: Both cron-based and event-driven tasks

## 🏗️ **Architecture**

### Data Flow
```
JSON Task Definitions → Task Manager → Agent Execution → JSON Output → Obsidian Processor → Markdown Files
```

### Directory Structure
```
config/tasks/
├── pipeline-tasks.json      # All task definitions
├── automation-rules.json    # Stage transitions and triggers
└── schedules.json           # Cron schedules and timing

data/output/json/            # Raw JSON output before processing
src/orchestration/
├── task-manager.ts          # Core task management system
└── agent-orchestrator.ts    # Enhanced orchestration with JSON tasks

src/processors/
└── json-to-obsidian.ts      # JSON → Obsidian conversion
```

## 📋 **Task Categories**

### 🔍 **Prospecting Tasks**
- **daily_prospect_generation**: Identify and qualify new prospects (9 AM weekdays)
- **prospect_research_enhancement**: Deep research on new prospects (triggered)

### 📧 **Outreach Tasks**  
- **pitch_generation**: Create AI-generated sales pitches (triggered)
- **cold_email_sequence**: Automated email sequences (disabled by default)

### 🔄 **Pipeline Tasks**
- **stage_transition_automation**: Auto-advance prospects (every 6 hours)
- **stagnant_prospect_identification**: Flag inactive prospects (10 AM daily)

### 📊 **Analytics Tasks**
- **daily_analytics_update**: Update dashboard (8 AM, 2 PM, 8 PM)
- **kanban_sync**: Sync Kanban board (triggered on updates)
- **performance_reporting**: Weekly/monthly reports (Monday 9 AM)

### 🧹 **Maintenance Tasks**
- **data_cleanup**: Archive old data (1st of month, 2 AM)

## 🖥️ **CLI Commands**

### System Management
```bash
# Start the JSON task management system
npm run tasks:start

# Check system status  
npm run tasks:status

# Show detailed status
npm run task-manager status --verbose

# Stop the system
npm run task-manager stop
```

### Task Management
```bash
# List all available tasks
npm run tasks:list

# List with detailed information
npm run task-manager list --verbose

# Manually trigger a task
npm run task-manager trigger daily_prospect_generation

# Trigger with data
npm run task-manager trigger pitch_generation --data '{"prospect_id":"123"}'
```

### Help
```bash
# Show CLI help
npm run task-manager
```

## 📊 **Data Processing Pipeline**

### 1. **Task Execution**
- Tasks are executed by appropriate agents
- Results are captured as structured data
- All processing happens locally

### 2. **JSON Output**
- All task results are first saved as JSON files
- Stored in `data/output/json/` directory  
- Includes metadata about execution and configuration

### 3. **Obsidian Processing**
- JSON data is transformed to markdown format
- Frontmatter is generated with structured data
- Files are written to appropriate Obsidian locations

### 4. **Destination Mapping**
```json
{
  "obsidian_prospects": "Projects/Sales/Prospects/*/index.md",
  "obsidian_pitches": "Projects/Sales/Prospects/*/pitch.md", 
  "obsidian_activities": "Projects/Sales/Activities/*.md",
  "obsidian_dashboard": "Projects/Sales/Sales-Analytics-Dashboard.md",
  "obsidian_kanban": "Projects/Sales/Sales-Pipeline-Kanban.md",
  "obsidian_reports": "Projects/Sales/Reports/*.md"
}
```

## ⚙️ **Configuration**

### Task Definition Format
```json
{
  "id": "daily_prospect_generation",
  "name": "Generate Daily Prospects", 
  "description": "Identify and qualify new prospects",
  "type": "scheduled",
  "schedule": "0 9 * * 1-5",
  "agent": "prospecting_agent",
  "enabled": true,
  "config": {
    "target_count": 10,
    "qualification_threshold": 50
  },
  "output": {
    "format": "json",
    "schema": "prospect",
    "destination": "obsidian_prospects"
  },
  "dependencies": [],
  "retry_config": {
    "max_attempts": 3,
    "backoff_seconds": 300
  }
}
```

### Task Types
- **scheduled**: Runs on cron schedule
- **triggered**: Runs on events
- **manual**: Runs only when manually triggered

### Agent Types
- **prospecting_agent**: Finds and qualifies prospects
- **pitch_creator_agent**: Generates sales pitches
- **analytics_generator**: Creates dashboard updates
- **kanban_manager**: Syncs Kanban board
- **pipeline_manager**: Handles stage transitions

## 🔄 **Event System**

### Task Events
- **task_completed**: Task finished successfully
- **task_failed**: Task execution failed
- **prospect_updated**: Prospect data changed
- **new_prospect_created**: New prospect added
- **prospect_qualified**: Prospect reached qualification threshold

### Event Handlers
- JSON output is automatically processed to Obsidian
- Failed tasks can be retried based on configuration
- Events trigger dependent tasks automatically

## 🔍 **Monitoring & Logging**

### Status Monitoring
```bash
# System status
npm run tasks:status

# Detailed status with task history
npm run task-manager status --verbose
```

### JSON Output Tracking
- All task outputs saved as JSON files with timestamps
- Raw data preserved for debugging and analysis
- Metadata includes execution context and configuration

### Logging
- Comprehensive logging via Winston
- Task execution tracked with start/end times
- Error handling with detailed error messages

## 🛠️ **Development**

### Adding New Tasks
1. Define task in `config/tasks/pipeline-tasks.json`
2. Implement agent logic (if new agent needed)
3. Add JSON output schema validation
4. Test with CLI commands

### Adding New Agents
1. Create agent class with JSON output
2. Register in task definitions
3. Add to AgentOrchestrator initialization
4. Test execution pipeline

### Extending Processors
1. Add new destination type in `json-to-obsidian.ts`
2. Implement markdown transformation logic
3. Update configuration schemas
4. Test end-to-end processing

## 🚀 **Benefits**

### ✅ **Local-First Architecture**
- No external dependencies or services
- All processing happens in this project
- Complete control over data and execution

### ✅ **JSON Data Pipeline**
- Structured data output before markdown conversion
- Easy debugging and data analysis
- Consistent format across all agents

### ✅ **Obsidian Native**
- All dashboards remain in Obsidian
- Seamless integration with existing workflow
- Markdown + frontmatter for structured data

### ✅ **Flexible Configuration**
- JSON-based task definitions
- Easy to modify schedules and parameters
- Version-controlled configuration

### ✅ **Scalable Design**
- Event-driven architecture
- Task dependency management
- Retry logic and error handling

## 📈 **Migration Benefits**

The system was **already architected correctly** - no migration from TaskMaster was needed because:

1. **No TaskMaster Dependencies**: System was already independent
2. **JSON + Markdown**: Already using preferred data formats
3. **Local Processing**: All agents run locally
4. **Obsidian Integration**: Native vault integration

The enhancement adds centralized JSON task management while preserving all existing functionality.

## 🎯 **Next Steps**

1. **Start the system**: `npm run tasks:start`
2. **Monitor execution**: `npm run tasks:status --verbose`
3. **Customize tasks**: Edit JSON configuration files
4. **Add new agents**: Extend the processing pipeline
5. **Scale workflows**: Add more task types and triggers

The JSON-based task management system provides a robust foundation for scaling your sales automation needs while maintaining local control and Obsidian integration.