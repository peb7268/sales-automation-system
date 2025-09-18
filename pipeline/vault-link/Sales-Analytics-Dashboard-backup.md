---
type: analytics-dashboard
title: Sales Analytics Dashboard
created: 2025-07-30T23:40:00.000Z
updated: 2025-07-31T16:38:00.977Z
tags:
  - sales
  - analytics
  - dashboard
  - performance
  - mhm
annual_target: 50000
monthly_target: 4167
quarterly_target: 12500
total_prospects: 2
qualified_prospects: 1
pipeline_value: 417
monthly_progress: 10.01
---
# 📊 Sales Analytics Dashboard

## 🎯 Executive Summary

**Annual Target:** $50,000 | **Progress:** $0 (0%)  
**Monthly Target:** $4,167 | **This Month:** $0 (0%)  
**Active Prospects:** `$= dv.pages('"Projects/Sales/Prospects/*/index"').length` | **Qualified:** `$= dv.pages('"Projects/Sales/Prospects/*/index"').where(p => p.qualification_score >= 75).length`

---

## 📈 Performance Overview

### Revenue Tracking

```chart
type: line
labels: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
series:
  - title: 2025 Target
    data: [4167, 8334, 12501, 16668, 20835, 25002, 29169, 33336, 37503, 41670, 45837, 50000]
  - title: 2025 Actual  
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
tension: 0.2
width: 80%
beginAtZero: true
bestFit: false
bestFitTitle: Trend
bestFitNumber: 0
```

### Pipeline Value Distribution

```chart
type: doughnut
labels: [Cold, Contacted, Interested, Qualified, Closed Won, Closed Lost, Frozen]
series:
  - title: Pipeline Value ($)
    data: [0, 0, 0, 0, 0, 0, 0]
tension: 0.2
width: 60%
labelColors: false
```

---

## 🏃 Daily & Weekly Performance

### Prospect Identification Trends

```dataview
TABLE WITHOUT ID
    dateformat(created, "MM-dd") as "Date",
    length(rows) as "New Prospects",
    round(avg(rows.qualification_score)) as "Avg Score"
FROM "Projects/Sales/Prospects/*/index"
WHERE created >= date(today) - dur(30 days)
GROUP BY dateformat(created, "yyyy-MM-dd")
SORT created DESC
LIMIT 15
```

### Weekly Activity Summary

```chart
type: bar
labels: [Week 1, Week 2, Week 3, Week 4]
series:
  - title: Prospects Added
    data: [0, 0, 0, 0]
  - title: Contacts Made
    data: [0, 0, 0, 0]
  - title: Meetings Scheduled
    data: [0, 0, 0, 0]
tension: 0.2
width: 80%
beginAtZero: true
```

---

## 🎯 Pipeline Conversion Analysis

### Stage Conversion Rates

```dataview
TABLE WITHOUT ID
    pipeline_stage as "Stage",
    length(rows) as "Count",
    round(avg(rows.qualification_score)) + "/100" as "Avg Score"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY pipeline_stage
SORT length(rows) DESC
```

### Conversion Funnel Visualization

```chart
type: bar
labels: [Cold, Contacted, Interested, Qualified, Closed Won]
series:
  - title: Conversion Funnel
    data: [100, 65, 35, 20, 8]
  - title: Current Pipeline
    data: [0, 0, 0, 0, 0]
tension: 0.2
width: 80%
beginAtZero: true
```

---

## 📊 Qualification Score Analysis

### Score Distribution

```chart
type: histogram
labels: [0-20, 21-40, 41-60, 61-75, 76-85, 86-95, 96-100]
series:
  - title: Prospects by Score Range
    data: [0, 0, 0, 0, 0, 0, 0]
tension: 0.2
width: 80%
beginAtZero: true
```

### Top Performing Prospects

```dataview
TABLE WITHOUT ID
    "🔥 " + company as "Company",
    qualification_score as "Score",
    pipeline_stage as "Stage",
    industry as "Industry",
    dateformat(updated, "MM-dd") as "Updated"
FROM "Projects/Sales/Prospects/*/index"
WHERE qualification_score >= 80
SORT qualification_score DESC
LIMIT 10
```

---

## 🌍 Geographic Performance

### Performance by Location

```dataview
TABLE WITHOUT ID
    location as "Location",
    length(rows) as "Prospects",
    round(avg(rows.qualification_score)) as "Avg Score",
    sum(rows.estimated_revenue) as "Est. Revenue"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY location
SORT length(rows) DESC
LIMIT 10
```

### Geographic Distribution

```chart
type: doughnut  
labels: [Denver, Boulder, Colorado Springs, Fort Collins, Other CO, Out of State]
series:
  - title: Prospects by Location
    data: [0, 0, 0, 0, 0, 0]
tension: 0.2
width: 60%
labelColors: true
```

---

## 🏭 Industry Analysis

### Industry Performance

```dataview
TABLE WITHOUT ID
    industry as "Industry",
    length(rows) as "Prospects", 
    round(avg(rows.qualification_score)) as "Avg Score",
    round(avg(rows.estimated_revenue) / 1000) + "K" as "Avg Revenue"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY industry
SORT length(rows) DESC
```

### Industry Success Rates

```chart
type: bar
labels: [Restaurants, Retail, Professional Services, Healthcare, Real Estate, Other]
series:
  - title: Prospects
    data: [0, 0, 0, 0, 0, 0]
  - title: Qualified (75+)
    data: [0, 0, 0, 0, 0, 0]  
  - title: Conversion Rate %
    data: [0, 0, 0, 0, 0, 0]
tension: 0.2
width: 80%
beginAtZero: true
```

---

## 🤖 Agent Performance Analytics

### AI Agent Activity Summary

```dataview
TABLE WITHOUT ID
    agent_responsible as "Agent",
    length(rows) as "Activities",
    round(avg(rows.qualification_score)) as "Avg Score"
FROM "Projects/Sales/Activities"
WHERE date >= date(today) - dur(30 days)
GROUP BY agent_responsible
SORT length(rows) DESC
```

### Agent Success Metrics

```chart
type: radar
labels: [Prospecting, Pitch Creation, Voice AI, Email Agent, Orchestrator]
series:
  - title: Activity Volume
    data: [0, 0, 0, 0, 0]
  - title: Success Rate %
    data: [0, 0, 0, 0, 0]
tension: 0.2
width: 70%
```

---

## ⏱️ Time-Based Analytics

### Activity Trends (Last 30 Days)

```dataview
TABLE WITHOUT ID
    dateformat(date, "MM-dd") as "Date",
    length(rows) as "Activities",
    activity_type as "Primary Type"
FROM "Projects/Sales/Activities"  
WHERE date >= date(today) - dur(30 days)
GROUP BY dateformat(date, "yyyy-MM-dd")
SORT date DESC
LIMIT 15
```

### Response Time Analysis

```chart
type: line
labels: [Week 1, Week 2, Week 3, Week 4]
series:
  - title: Avg Response Time (hours)
    data: [24, 18, 12, 8]
  - title: Target (<24h)
    data: [24, 24, 24, 24]
tension: 0.2
width: 80%
beginAtZero: true
```

---

## 🎯 Goal Tracking & Projections

### Monthly Revenue Targets

| Month | Target | Actual | Variance | On Track? |
|-------|---------|---------|----------|-----------|
| January | $4,167 | $0 | -$4,167 | ❌ |
| February | $4,167 | $0 | -$4,167 | ⏸️ |
| March | $4,167 | $0 | -$4,167 | ⏸️ |
| Q1 Total | $12,500 | $0 | -$12,500 | ❌ |

### Realistic Ramp-Up Projections

```chart
type: line
labels: [Jul, Aug, Sep, Oct, Nov, Dec]
series:
  - title: Conservative ($30K)
    data: [1000, 2500, 4000, 6000, 8500, 12000]
  - title: Optimistic ($50K)  
    data: [2000, 5000, 8000, 12000, 17000, 25000]
  - title: Stretch ($75K)
    data: [3000, 7500, 12000, 18000, 25000, 37500]
tension: 0.2
width: 80%
beginAtZero: true
```

---

## 🚨 Performance Alerts & KPIs

### Critical Metrics Dashboard

| KPI | Current | Target | Status |
|-----|---------|--------|---------|
| **Daily Prospects** | 0 | 10+ | 🔴 Below Target |
| **Response Rate** | 0% | 15% | 🔴 No Data |
| **Qualification Rate** | 0% | 5% | 🔴 No Data |
| **Pipeline Value** | $0 | $15K | 🔴 Below Target |
| **Avg Deal Size** | $0 | $3K | 🔴 No Data |

### System Health Indicators

```dataview
TABLE WITHOUT ID
    "📊 " + file.name as "Metric",
    "🟢 Active" as "Status",
    dateformat(file.mtime, "MM-dd HH:mm") as "Last Updated"
FROM "Projects/Sales"
WHERE contains(file.name, "Dashboard") OR contains(file.name, "Kanban")
SORT file.mtime DESC
```

---

## 📈 Trend Analysis & Insights

### Weekly Performance Summary

```dataview
TABLE WITHOUT ID
    dateformat(created, "YYYY-'W'WW") as "Week",
    length(rows) as "New Prospects",
    round(avg(rows.qualification_score)) as "Avg Score",
    sum(rows.estimated_revenue) as "Pipeline Added"
FROM "Projects/Sales/Prospects/*/index"
WHERE created >= date(today) - dur(8 weeks)
GROUP BY dateformat(created, "YYYY-WW")
SORT created DESC
```

### Seasonal Trends Projection

```chart
type: line
labels: [Q1, Q2, Q3, Q4]
series:
  - title: Historical Pattern
    data: [20, 35, 45, 60]
  - title: 2025 Projection
    data: [15, 30, 40, 55]
  - title: Stretch Goal
    data: [25, 45, 60, 80]
tension: 0.2
width: 80%
beginAtZero: true
```

---

## 🔧 Data Export & Automation

### Quick Actions

```button
name Refresh Dashboard Data
type command
action Templater: Refresh Analytics
customColor #007bff
customTextColor #fff
```

```button
name Export Monthly Report
type command  
action QuickAdd: Monthly Sales Report
customColor #28a745
customTextColor #fff
```

```button
name Generate Insights
type link
action obsidian://open?vault=Main&file=Projects%2FSales%2FSales-Insights-Generator
customColor #17a2b8
customTextColor #fff
```

### Automated Reporting Schedule

- **Daily:** Pipeline health check (automated via sync-kanban)
- **Weekly:** Performance summary and trend analysis
- **Monthly:** Complete analytics report with projections
- **Quarterly:** Strategic review and target adjustments

---

## 📊 Advanced Analytics Queries

### Pipeline Velocity Analysis

```dataview
TABLE WITHOUT ID
    pipeline_stage as "Stage",
    round(avg(rows.qualification_score)) as "Avg Days in Stage",
    length(rows) as "Volume"
FROM "Projects/Sales/Prospects/*/index" 
GROUP BY pipeline_stage
SORT pipeline_stage
```

### Qualification Score Improvement Tracking

```dataview
TABLE WITHOUT ID
    company as "Company",
    qualification_score as "Current Score",
    pipeline_stage as "Stage",
    round(datediff(today, updated, "day")) as "Days Since Update"
FROM "Projects/Sales/Prospects/*/index"
WHERE qualification_score < 60 AND pipeline_stage != "closed_lost"
SORT qualification_score ASC
LIMIT 10
```

### ROI Analysis by Activity Type

```dataview
TABLE WITHOUT ID
    activity_type as "Activity",
    length(rows) as "Volume",
    sum(length(rows.notes)) as "Total Notes"
FROM "Projects/Sales/Activities"
WHERE outcome = "positive"
GROUP BY activity_type
SORT length(rows) DESC
```

---

## 🎯 Strategic Insights & Recommendations

### Current Performance Analysis
*This section will be automatically updated based on data trends*

### Optimization Opportunities
*AI-generated recommendations based on pipeline analysis*

### Next Quarter Focus Areas
*Strategic priorities based on current performance*

---

*Dashboard last updated: {{date:YYYY-MM-DD HH:mm}} - All data refreshed automatically via Dataview queries*

**Key Integration Points:**
- **Prospect Data:** Auto-populated from `Projects/Sales/Prospects/`
- **Activity Tracking:** Real-time updates from `Projects/Sales/Activities/`  
- **Kanban Integration:** Visual pipeline data from Sales-Pipeline-Kanban.md
- **Daily Workflow:** Connected to daily notes and task management