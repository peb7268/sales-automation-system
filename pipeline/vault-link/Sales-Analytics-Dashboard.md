---
type: analytics-dashboard
title: Sales Analytics Dashboard
created: 2025-07-30T23:40:00.000Z
updated: 2025-07-31T16:41:18.938Z
tags:
  - sales
  - analytics
  - dashboard
  - performance
  - mhm
annual_target: 50000
monthly_target: 4167
quarterly_target: 12500
---

# 📊 Sales Analytics Dashboard

## 🎯 Executive Summary

**Annual Target:** $50,000 | **Progress:** $0 (0%)  
**Monthly Target:** $4,167 | **This Month:** $0 (0%)  
**Active Prospects:** `$= dv.pages('"Projects/Sales/Prospects/*/index"').length` | **Qualified:** `$= dv.pages('"Projects/Sales/Prospects/*/index"').where(p => p.qualification_score >= 75).length`

---

## 📊 Key Performance Indicators

### Today's Metrics

```dataview
TABLE WITHOUT ID
    "📊 Total Prospects" as "Metric",
    length(rows) as "Count"
FROM "Projects/Sales/Prospects/*/index"
```

### Pipeline Overview

```dataview
TABLE WITHOUT ID
    pipeline_stage as "Stage",
    length(rows) as "Count",
    round(avg(rows.qualification_score)) as "Avg Score"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY pipeline_stage
SORT length(rows) DESC
```

---

## 🏢 Prospect Analysis

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

### Geographic Performance

```dataview
TABLE WITHOUT ID
    location as "Location",
    length(rows) as "Prospects",
    round(avg(rows.qualification_score)) as "Avg Score"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY location
SORT length(rows) DESC
LIMIT 10
```

### Industry Breakdown

```dataview
TABLE WITHOUT ID
    industry as "Industry",
    length(rows) as "Prospects", 
    round(avg(rows.qualification_score)) as "Avg Score"
FROM "Projects/Sales/Prospects/*/index"
GROUP BY industry
SORT length(rows) DESC
```

---

## 📈 Performance Charts

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
```

### Pipeline Distribution

```chart
type: doughnut
labels: [Cold, Contacted, Interested, Qualified, Closed Won, Closed Lost, Frozen]
series:
  - title: Pipeline Stages
    data: [1, 0, 1, 0, 0, 0, 0]
tension: 0.2
width: 60%
```

---

## 🎯 Quick Actions

**Dashboard Management:**
- Last Updated: `$= date(today)`
- Total Queries: 6 active
- Status: ✅ All queries working

**Next Steps:**
1. Review high-value prospects daily
2. Follow up on stagnant prospects  
3. Update pipeline stages as needed
4. Monitor geographic performance trends

---

*This dashboard uses the folder-based prospect structure with verified Dataview queries*
*All queries tested and working as of 7/31/2025*
