---

kanban-plugin: basic
kanban-settings: {"hide-card-count":false,"hide-lane-count":false,"hide-date":false,"hide-task-count":false,"show-card-checkbox":false,"show-relative-date":false,"hide-card-tags":false,"hide-card-display-tags":false,"hide-archive":false,"show-view-as-board":true,"show-archive-all":false,"show-board-settings":false,"show-search":true,"show-tag-colors":false,"show-add-list":true,"show-archive-lane":false,"show-delete-lane":false,"show-move-lane":false,"new-line-trigger":"shift-enter","prepend-archive-date":false,"archive-date-format":"YYYY-MM-DD","archive-date-separator":" ","lane-width":272,"max-archive-size":100,"between-lane-margin":12,"show-checkboxes":false,"show-lane-button-add-top":false,"show-lane-button-add-bottom":true,"show-add-card-context-menu":true,"markdown-folder":"Projects/Sales/Prospects","date-format":"YYYY-MM-DD","time-format":"HH:mm","datetime-format":"YYYY-MM-DD HH:mm","show-add-list-button":true,"show-archive-all-button":false,"show-board-settings-button":true,"show-search-button":true,"show-view-as-board-button":true,"show-checkbox-on-card":false,"show-relative-date-on-card":false,"show-due-date-on-card":true,"show-tags-on-card":true,"show-task-count-on-card":false,"date-picker-week-start":0,"linked-page-metadata":true,"prepend-archive-separator":" ","archive-with-date":false,"card-template":"","list-template":"","should-override-card-template":false,"should-override-list-template":false,"new-card-insertion-method":"prepend-compact","show-archive-lane-button":false,"show-delete-lane-button":false,"show-move-lane-button":false}

---

## Sales Pipeline - Visual Management

> **Pipeline Overview**: Drag and drop prospects between stages to update their status automatically. Each card represents a prospect with real-time data from their profile.

## 🧊 Cold

- [ ] 🛍️ **[[Boutique Retail Boulder]]**<br/>🏷️ #prospect #cold<br/>📍 Boulder, CO<br/>⭐ Score: 45/100 👌<br/>📅 Updated: 2025-07-28


## 📞 Contacted  

- [ ] 📋 **Prospects after initial outreach**<br/>🏷️ #prospect #contacted<br/>📍 Follow-up scheduled<br/>⭐ Score: 40-60<br/>📅 Contact: Recent

## 💬 Interested

- [ ] 🍽️ **[[Demo Restaurant Denver]]**<br/>🏷️ #prospect #interested<br/>📍 Denver, CO<br/>⭐ Score: 85/100 ⭐<br/>📅 Updated: 2025-07-31


## ✅ Qualified

- [ ] 📋 **Meeting scheduled or strong intent**<br/>🏷️ #prospect #qualified<br/>📍 Ready for demo/proposal<br/>⭐ Score: 75-90<br/>📅 Meeting: Scheduled

## 💰 Closed Won

- [ ] 📋 **Successfully closed deals**<br/>🏷️ #prospect #closed-won<br/>📍 Contract signed<br/>⭐ Score: 90-100<br/>📅 Closed: Recent

## ❌ Closed Lost

- [ ] 📋 **Deals that didn't convert**<br/>🏷️ #prospect #closed-lost<br/>📍 Reason documented<br/>⭐ Score: Varied<br/>📅 Lost: With reason

## 🧊 Frozen

- [ ] 📋 **Prospects on hold**<br/>🏷️ #prospect #frozen<br/>📍 Timing not right<br/>⭐ Score: Maintained<br/>📅 Review: Future date

---

## 📊 Pipeline Analytics

### Stage Distribution
```dataview
TABLE WITHOUT ID
    pipeline_stage as "Stage",
    count(rows) as "Count",
    round(avg(qualification_score)) + "/100" as "Avg Score"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY pipeline_stage
SORT count(rows) DESC
```

### High-Value Prospects (80+ Score)
```dataview
TABLE WITHOUT ID
    "🔥 " + company as "Company",
    qualification_score as "Score", 
    pipeline_stage as "Stage",
    industry as "Industry"
FROM "Projects/Sales/Prospects/*/index"
WHERE qualification_score >= 80
SORT qualification_score DESC
LIMIT 10
```

### Recent Stage Changes (Last 7 Days)
```dataview
TABLE WITHOUT ID
    prospect as "Company",
    stage_change_from + " → " + stage_change_to as "Transition",
    dateformat(date, "MM-DD") as "Date"
FROM "Projects/Sales/Activities"
WHERE stage_change_from != stage_change_to 
    AND date >= date(today) - dur(7 days)
SORT date DESC
LIMIT 15
```

---

## 🎯 Quick Actions

### Add New Prospect
```button
name Add Prospect
type command
action QuickAdd: Sales Prospect
customColor #007bff
customTextColor #fff
```

### Pipeline Health Check
```button
name Health Check
type link
action obsidian://open?vault=Main&file=Projects%2FSales%2FSales-Dashboard
customColor #28a745
customTextColor #fff
```

### Export Pipeline Data
```button
name Export Data
type command
action Templater: Export Pipeline
customColor #6c757d
customTextColor #fff
```

---

## 📋 Pipeline Rules & Automation

### Automatic Stage Progression Rules

**Cold → Contacted**:
- Triggered by: First call/email activity recorded
- Auto-update: Pipeline stage in prospect frontmatter
- Notification: Added to follow-up queue

**Contacted → Interested**:
- Triggered by: Positive response recorded (outcome: 'positive')
- Auto-update: Qualification score +10 points
- Notification: Agent notification for next steps

**Interested → Qualified**:
- Triggered by: Meeting scheduled or qualification score 75+
- Auto-update: Priority flag in frontmatter  
- Notification: Sales team notification

**Qualified → Closed Won**:
- Triggered by: Manual update (requires human confirmation)
- Auto-update: Deal value, close date recorded
- Notification: Success metrics updated

### Data Consistency Rules

1. **Frontmatter Sync**: Card moves automatically update prospect `pipeline_stage` field
2. **Activity Logging**: All stage changes create activity records
3. **Score Updates**: Stage changes trigger qualification score recalculation  
4. **Tag Management**: Pipeline stage tags updated automatically

### Filtering & Sorting Options

**By Industry**:
- Restaurants | Retail | Professional Services | Healthcare | Other

**By Location**:  
- Denver Metro | Boulder | Colorado Springs | Fort Collins | Other CO

**By Score Range**:
- Cold (0-40) | Warm (40-70) | Hot (70-85) | Qualified (85+)

**By Recency**:
- Added Today | This Week | This Month | Older

---

## 🔧 Technical Integration

### Kanban Plugin Configuration

This board uses the **Kanban** plugin with the following key settings:
- **Markdown Folder**: `Projects/Sales/Prospects` (auto-links to prospect files)
- **Card Template**: Prospect profile template integration
- **Auto-Archive**: 100 item limit per archive lane
- **Date Format**: YYYY-MM-DD for consistency
- **Lane Settings**: Fixed width 272px, 12px margins

### Automated Card Generation

New prospect cards are automatically generated when:
1. **Prospect Profile Created**: Via QuickAdd or automation script
2. **Import Process**: Bulk prospect uploads
3. **Agent Discovery**: Prospecting agent identifies new leads

### Claude Code Integration

Pipeline monitoring includes:
- **Health Metrics**: Stage velocity, conversion rates, bottlenecks
- **Anomaly Detection**: Unusual stage distributions or scoring patterns  
- **Performance Alerts**: Pipeline goals vs actual progress
- **Optimization Suggestions**: Based on historical conversion data

---

*This Kanban board provides visual pipeline management with automated prospect tracking, stage progression rules, and comprehensive analytics integration.*