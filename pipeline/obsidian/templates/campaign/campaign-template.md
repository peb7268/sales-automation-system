---
type: campaign
campaign_name: "{{campaign_name}}"
campaign_type: "{{campaign_type}}"
status: "{{status}}"
created: "{{created_date}}"
updated: "{{updated_date}}"
start_date: "{{start_date}}"
end_date: "{{end_date}}"
tags: [campaign, sales, "{{campaign_type}}", "{{status}}"]

# Geographic Targeting
target_city: "{{target_city}}"
target_state: "{{target_state}}"
target_radius: {{target_radius}}
target_timezone: "{{target_timezone}}"

# Targeting Criteria
target_industries: [{{target_industries}}]
min_employees: {{min_employees}}
max_employees: {{max_employees}}
min_revenue: {{min_revenue}}
max_revenue: {{max_revenue}}
qualification_threshold: {{qualification_threshold}}

# Performance Metrics
prospects_identified: {{prospects_identified}}
contact_attempts: {{contact_attempts}}
conversations_initiated: {{conversations_initiated}}
positive_responses: {{positive_responses}}
qualified_leads: {{qualified_leads}}
response_rate: {{response_rate}}
qualification_rate: {{qualification_rate}}
pipeline_value: {{pipeline_value}}

# Goals & Targets
daily_target: {{daily_target}}
weekly_target: {{weekly_target}}
monthly_pipeline_target: {{monthly_pipeline_target}}
target_response_rate: {{target_response_rate}}
target_qualification_rate: {{target_qualification_rate}}

# A/B Testing
ab_testing_enabled: {{ab_testing_enabled}}
active_variants: {{active_variants}}
traffic_split: "{{traffic_split}}"
min_sample_size: {{min_sample_size}}
confidence_level: {{confidence_level}}

# Campaign Settings
auto_qualify: {{auto_qualify}}
auto_advance_stages: {{auto_advance_stages}}
enable_competitor_analysis: {{enable_competitor_analysis}}
max_contact_attempts: {{max_contact_attempts}}
cooldown_period: {{cooldown_period}}
---

# {{campaign_name}}

> **Status**: {{status}}  
> **Type**: {{campaign_type}}  
> **Duration**: {{start_date}} → {{end_date}}  
> **Target**: {{target_city}}, {{target_state}} ({{target_radius}} miles)

## 🎯 Campaign Overview

{{campaign_description}}

### Campaign Objectives
- Generate {{daily_target}} qualified prospects per day
- Achieve {{target_response_rate}}% response rate
- Maintain {{target_qualification_rate}}% qualification rate
- Build ${{monthly_pipeline_target}} monthly pipeline value

## 📍 Geographic Targeting

- **Primary Market**: {{target_city}}, {{target_state}}
- **Radius**: {{target_radius}} miles
- **Time Zone**: {{target_timezone}}
- **Excluded Areas**: {{excluded_areas}}

### Market Analysis
- **Population**: {{market_population}}
- **Business Density**: {{business_density}}
- **Competition Level**: {{competition_level}}
- **Market Opportunity**: {{market_opportunity}}

## 🏢 Target Audience

### Industry Focus
{{#each target_industries}}
- {{this}}
{{/each}}

### Business Size Criteria
- **Employees**: {{min_employees}} - {{max_employees}}
- **Revenue Range**: ${{min_revenue}} - ${{max_revenue}}
- **Business Categories**: {{business_categories}}

### Qualification Requirements
- **Minimum Score**: {{qualification_threshold}}/100
- **Required Criteria**: {{required_criteria}}
- **Exclusion Rules**: {{exclusion_rules}}

## 📢 Messaging Strategy

### Hook Message (30 seconds)
**Primary**:
{{primary_hook}}

**Alternatives**:
- {{hook_alt_1}}
- {{hook_alt_2}}
- {{hook_alt_3}}

### Value Proposition (60 seconds)
**Primary**:
{{primary_value_prop}}

**ROI Projection**:
- **Payback Period**: {{payback_period}} months
- **Projected Growth**: {{projected_growth}}
- **Industry Benchmarks**: {{industry_benchmarks}}

**Alternatives**:
- {{value_prop_alt_1}}
- {{value_prop_alt_2}}

### Closing Pitch (120 seconds)
**Primary**:
{{primary_closing}}

**Call to Action**:
{{call_to_action}}

**Free Analysis Offer**:
{{free_analysis_offer}}

**Alternatives**:
- {{closing_alt_1}}
- {{closing_alt_2}}

## 🧪 A/B Testing Configuration

{{#if ab_testing_enabled}}
### Active Variants

| Variant | Type | Traffic % | Impressions | Response Rate | Status |
|---------|------|-----------|-------------|---------------|--------|
| {{variant_1_name}} (Control) | {{variant_1_type}} | {{variant_1_traffic}}% | {{variant_1_impressions}} | {{variant_1_response_rate}}% | {{variant_1_status}} |
| {{variant_2_name}} | {{variant_2_type}} | {{variant_2_traffic}}% | {{variant_2_impressions}} | {{variant_2_response_rate}}% | {{variant_2_status}} |

### Test Parameters
- **Minimum Sample Size**: {{min_sample_size}} per variant
- **Confidence Level**: {{confidence_level}}%
- **Test Duration**: {{test_duration}} days
- **Success Metric**: {{success_metric}}
{{else}}
A/B testing is disabled for this campaign.
{{/if}}

## 📊 Performance Dashboard

### Volume Metrics
```chart
type: bar
labels: [Identified, Contacted, Responded, Qualified]
series:
  - title: Current Campaign
    data: [{{prospects_identified}}, {{contact_attempts}}, {{positive_responses}}, {{qualified_leads}}]
  - title: Target
    data: [{{target_identified}}, {{target_contacted}}, {{target_responded}}, {{target_qualified}}]
```

### Conversion Funnel
- **Prospects Identified**: {{prospects_identified}}
- **Contact Attempts**: {{contact_attempts}} ({{contact_rate}}%)
- **Conversations Initiated**: {{conversations_initiated}} ({{conversation_rate}}%)
- **Positive Responses**: {{positive_responses}} ({{response_rate}}%)
- **Qualified Leads**: {{qualified_leads}} ({{qualification_rate}}%)

### Financial Metrics
- **Pipeline Value**: ${{pipeline_value}}
- **Average Deal Size**: ${{average_deal_size}}
- **Cost per Qualified Lead**: ${{cost_per_qualified_lead}}
- **ROI**: {{roi}}%

### Timing Metrics
- **Avg Time to First Contact**: {{avg_time_to_contact}} hours
- **Avg Time to Qualification**: {{avg_time_to_qualification}} days
- **Avg Response Time**: {{avg_response_time}} hours

## 📈 Performance Trends

### Daily Activity
```chart
type: line
labels: [{{daily_labels}}]
series:
  - title: Prospects Identified
    data: [{{daily_prospects}}]
  - title: Qualified Leads
    data: [{{daily_qualified}}]
```

### Weekly Progress
| Week | Prospects | Qualified | Response Rate | Pipeline Value |
|------|-----------|-----------|---------------|----------------|
| W1   | {{w1_prospects}} | {{w1_qualified}} | {{w1_response_rate}}% | ${{w1_pipeline}} |
| W2   | {{w2_prospects}} | {{w2_qualified}} | {{w2_response_rate}}% | ${{w2_pipeline}} |
| W3   | {{w3_prospects}} | {{w3_qualified}} | {{w3_response_rate}}% | ${{w3_pipeline}} |
| W4   | {{w4_prospects}} | {{w4_qualified}} | {{w4_response_rate}}% | ${{w4_pipeline}} |

## 🎯 Generated Prospects

### Top Performing Industries
```dataview
TABLE industry, count(rows) as "Count", avg(qualification_score) as "Avg Score"
FROM #prospect 
WHERE contains(tags, "{{campaign_name}}")
GROUP BY industry
SORT count(rows) DESC
```

### Recent Qualified Prospects
```dataview
TABLE company, qualification_score, pipeline_stage, created
FROM #prospect 
WHERE contains(tags, "{{campaign_name}}") AND qualification_score >= {{qualification_threshold}}
SORT created DESC
LIMIT 10
```

## ⚙️ Campaign Settings

### Automation Configuration
- **Auto-Qualification**: {{auto_qualify}}
- **Auto-Stage Advancement**: {{auto_advance_stages}}
- **Competitor Analysis**: {{enable_competitor_analysis}}
- **Max Contact Attempts**: {{max_contact_attempts}}
- **Cooldown Period**: {{cooldown_period}} days

### Agent Assignment
- **Prospecting Agent**: {{prospecting_agent}}
- **Pitch Creator Agent**: {{pitch_creator_agent}}
- **Voice AI Agent**: {{voice_ai_agent}}
- **Email Agent**: {{email_agent}}
- **Orchestrator**: {{orchestrator_agent}}

## 📝 Campaign Notes

### Key Insights
- {{insight_1}}
- {{insight_2}}
- {{insight_3}}

### Optimization Opportunities
- {{optimization_1}}
- {{optimization_2}}
- {{optimization_3}}

### Challenges Encountered
- {{challenge_1}}
- {{challenge_2}}
- {{challenge_3}}

## 🔄 Related Campaigns

### Previous Campaigns
- [[{{previous_campaign_1}}]]
- [[{{previous_campaign_2}}]]

### Spin-off Campaigns
- [[{{spinoff_campaign_1}}]]
- [[{{spinoff_campaign_2}}]]

## 📋 Action Items

- [ ] {{action_item_1}}
- [ ] {{action_item_2}}
- [ ] {{action_item_3}}
- [ ] {{action_item_4}}
- [ ] {{action_item_5}}

## 📊 Campaign Analytics

### Success Factors
1. **Top Performing Messages**: {{top_messages}}
2. **Best Contact Times**: {{best_times}}
3. **Highest Converting Industries**: {{top_industries}}
4. **Optimal Follow-up Timing**: {{optimal_followup}}

### Lessons Learned
1. {{lesson_1}}
2. {{lesson_2}}
3. {{lesson_3}}

### Recommendations for Future Campaigns
1. {{recommendation_1}}
2. {{recommendation_2}}
3. {{recommendation_3}}

---
**Campaign Manager**: {{campaign_manager}}  
**Created**: {{created_date}}  
**Last Updated**: {{updated_date}}  
**Template Version**: 1.0