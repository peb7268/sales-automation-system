---
type: activity
prospect: "{{prospect_company}}"
activity_type: "{{activity_type}}"
outcome: "{{outcome}}"
date: "{{activity_date}}"
duration: {{duration}}
agent_responsible: "{{agent_responsible}}"
created: "{{created_date}}"
updated: "{{updated_date}}"
tags: [activity, "{{activity_type}}", "{{outcome}}", "{{agent_responsible}}"]

# Impact Tracking
stage_change_from: "{{stage_change_from}}"
stage_change_to: "{{stage_change_to}}"
qualification_score_change: {{qualification_score_change}}

# Follow-up Information
follow_up_required: {{follow_up_required}}
follow_up_date: "{{follow_up_date}}"
follow_up_type: "{{follow_up_type}}"

# Automation & Review
automated: {{automated}}
human_review_required: {{human_review_required}}
human_review_completed: {{human_review_completed}}
reviewed_by: "{{reviewed_by}}"
review_date: "{{review_date}}"

# Email Specific (if applicable)
email_opened: {{email_opened}}
email_clicked: {{email_clicked}}
email_bounced: {{email_bounced}}
email_template: "{{email_template}}"
email_subject: "{{email_subject}}"
delivery_status: "{{delivery_status}}"

# Call Specific (if applicable)
call_duration: {{call_duration}}
call_answered: {{call_answered}}
voicemail_left: {{voicemail_left}}
call_quality: "{{call_quality}}"
transcript_available: {{transcript_available}}
recording_url: "{{recording_url}}"

# Meeting Specific (if applicable)
meeting_platform: "{{meeting_platform}}"
meeting_attendees: [{{meeting_attendees}}]
agenda_items: [{{agenda_items}}]
meeting_outcomes: [{{meeting_outcomes}}]

# Research Specific (if applicable)
research_sources: [{{research_sources}}]
key_findings: [{{key_findings}}]
competitor_intel: {{competitor_intel}}
digital_presence_audit: {{digital_presence_audit}}
revenue_estimates: {{revenue_estimates}}
---

# {{activity_type}} - {{prospect_company}}

> **Date**: {{activity_date}}  
> **Duration**: {{duration}} minutes  
> **Outcome**: {{outcome}}  
> **Agent**: {{agent_responsible}}

## 📋 Activity Summary

{{activity_summary}}

## 🏢 Prospect Context

- **Company**: [[{{prospect_company}}]]
- **Contact**: {{contact_name}}
- **Current Stage**: {{current_pipeline_stage}}
- **Previous Stage**: {{previous_pipeline_stage}}
- **Qualification Score**: {{current_qualification_score}}/100

{{#if stage_change_from}}
### Pipeline Stage Change
**{{stage_change_from}}** → **{{stage_change_to}}**

**Reason**: {{stage_change_reason}}
{{/if}}

{{#if qualification_score_change}}
### Qualification Score Impact
**Change**: {{qualification_score_change}} points  
**New Score**: {{new_qualification_score}}/100
{{/if}}

## 📞 Activity Details

{{#if activity_type == "call"}}
### Call Information
- **Duration**: {{call_duration}} seconds ({{call_duration_minutes}} minutes)
- **Answered**: {{call_answered}}
- **Voicemail Left**: {{voicemail_left}}
- **Call Quality**: {{call_quality}}
- **Recording**: {{#if recording_url}}[Available]({{recording_url}}){{else}}Not available{{/if}}

{{#if transcript_available}}
### Call Transcript
{{call_transcript}}
{{/if}}

{{/if}}

{{#if activity_type == "email"}}
### Email Information
- **Subject**: {{email_subject}}
- **Template**: {{email_template}}
- **Delivery Status**: {{delivery_status}}
- **Opened**: {{email_opened}}
- **Clicked**: {{email_clicked}}
- **Bounced**: {{email_bounced}}

{{#if email_content}}
### Email Content Sent
{{email_content}}
{{/if}}

{{/if}}

{{#if activity_type == "meeting"}}
### Meeting Information
- **Platform**: {{meeting_platform}}
- **Duration**: {{duration}} minutes
- **Attendees**: {{meeting_attendees_list}}

#### Agenda Items
{{#each agenda_items}}
- {{this}}
{{/each}}

#### Meeting Outcomes
{{#each meeting_outcomes}}
- {{this}}
{{/each}}

{{/if}}

{{#if activity_type == "research"}}
### Research Information
- **Sources Used**: {{research_sources_count}}
- **Key Findings**: {{key_findings_count}}
- **Competitor Intel**: {{competitor_intel}}
- **Digital Audit**: {{digital_presence_audit}}
- **Revenue Analysis**: {{revenue_estimates}}

#### Research Sources
{{#each research_sources}}
- [{{this}}]({{this}})
{{/each}}

#### Key Findings
{{#each key_findings}}
- {{this}}
{{/each}}

{{/if}}

## 💬 Key Discussion Points

{{#each key_discussion_points}}
- {{this}}
{{/each}}

## 🎯 Prospect Response & Feedback

{{prospect_response}}

### Buying Signals Detected
{{#each buying_signals}}
- **{{this.signal}}** (Strength: {{this.strength}})
{{/each}}

### Pain Points Identified
{{#each pain_points}}
- {{this}}
{{/each}}

### Opportunities Discovered
{{#each opportunities}}
- {{this}}
{{/each}}

### Objections Raised
{{#each objections}}
- **Objection**: {{this.objection}}
- **Response**: {{this.response}}
- **Resolution**: {{this.resolution}}
{{/each}}

## 📝 Detailed Notes

{{detailed_notes}}

### What Went Well
{{#each went_well}}
- {{this}}
{{/each}}

### Areas for Improvement
{{#each improvements}}
- {{this}}
{{/each}}

### Insights Gained
{{#each insights}}
- {{this}}
{{/each}}

## ✅ Next Steps

{{#if follow_up_required}}
### Immediate Follow-up Required
- **Date**: {{follow_up_date}}
- **Type**: {{follow_up_type}}
- **Priority**: {{follow_up_priority}}

{{/if}}

### Action Items
{{#each action_items}}
- [ ] {{this.task}} (Due: {{this.due_date}})
{{/each}}

### Recommended Actions
{{#each recommended_actions}}
- {{this}}
{{/each}}

## 🤖 Automation & AI Analysis

{{#if automated}}
### Automated Activity
- **Triggered By**: {{triggered_by}}
- **Automation Rules**: {{automation_rules}}
- **Success Criteria**: {{automation_success_criteria}}
{{else}}
### Manual Activity
- **Initiated By**: {{initiated_by}}
- **Manual Override Reason**: {{manual_override_reason}}
{{/if}}

{{#if human_review_required}}
### Human Review
{{#if human_review_completed}}
- **Reviewed By**: {{reviewed_by}}
- **Review Date**: {{review_date}}
- **Review Notes**: {{review_notes}}
- **Approved**: {{review_approved}}
{{else}}
- **Review Required**: Yes
- **Review Priority**: {{review_priority}}
- **Review Assigned To**: {{review_assigned_to}}
{{/if}}
{{/if}}

### AI Analysis
- **Sentiment Score**: {{sentiment_score}}/100
- **Engagement Level**: {{engagement_level}}
- **Qualification Impact**: {{qualification_impact}}
- **Recommended Next Activity**: {{recommended_next_activity}}

## 📊 Performance Impact

### Activity Metrics
- **Response Time**: {{response_time}} hours
- **Engagement Quality**: {{engagement_quality}}/10
- **Outcome Confidence**: {{outcome_confidence}}%
- **Follow-up Likelihood**: {{followup_likelihood}}%

### Campaign Impact
- **Campaign**: [[{{related_campaign}}]]
- **Campaign Stage**: {{campaign_stage}}
- **Contribution to Goals**: {{campaign_contribution}}

## 🔗 Related Activities

### Previous Activities with this Prospect
```dataview
TABLE activity_type, outcome, date, agent_responsible
FROM #activity 
WHERE prospect = "{{prospect_company}}" AND date < date("{{activity_date}}")
SORT date DESC
LIMIT 5
```

### Triggered Activities
{{#each triggered_activities}}
- [[{{this}}]]
{{/each}}

### Related Campaign Activities
```dataview
TABLE prospect, activity_type, outcome, date
FROM #activity 
WHERE contains(tags, "{{related_campaign}}") AND date >= date("{{activity_date}}") - dur(7 days)
SORT date DESC
LIMIT 10
```

## 📈 Success Metrics

### Activity Success Indicators
- **Primary Objective Met**: {{primary_objective_met}}
- **Secondary Objectives**: {{secondary_objectives_met}}/{{total_secondary_objectives}}
- **Unexpected Outcomes**: {{unexpected_outcomes}}

### Learning Outcomes
1. **Key Lesson**: {{key_lesson}}
2. **Process Improvement**: {{process_improvement}}
3. **Message Optimization**: {{message_optimization}}

## 🔄 Activity Timeline

| Time | Event | Notes |
|------|-------|-------|
| {{start_time}} | Activity Started | {{start_notes}} |
| {{key_moment_1_time}} | {{key_moment_1}} | {{key_moment_1_notes}} |
| {{key_moment_2_time}} | {{key_moment_2}} | {{key_moment_2_notes}} |
| {{end_time}} | Activity Ended | {{end_notes}} |

---
**Activity ID**: {{activity_id}}  
**Created**: {{created_date}}  
**Last Updated**: {{updated_date}}  
**Template Version**: 1.0