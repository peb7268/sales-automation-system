# Parallel Coordinates - Plotly.js

## Description
Parallel coordinates visualize multi-dimensional data by representing each data point as a line crossing multiple parallel axes. Perfect for comparing many variables simultaneously, finding patterns, identifying outliers, and exploring relationships in high-dimensional datasets.

## Working Example

```tsx
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function ProspectAnalysisParallelCoordinates() {
  const data = useMemo(() => {
    // Generate sample prospect data
    const numProspects = 100;
    const industries = ['Tech', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];

    const prospects = Array(numProspects).fill(0).map((_, i) => ({
      companySize: Math.floor(Math.random() * 1000) + 50,
      revenue: Math.random() * 10000000,
      engagementScore: Math.random() * 100,
      qualificationScore: Math.random() * 100,
      responseTime: Math.random() * 72, // hours
      dealSize: Math.random() * 500000 + 10000,
      industry: industries[Math.floor(Math.random() * industries.length)],
      conversionProbability: Math.random() * 100
    }));

    const industryColorMap = {
      'Tech': 1,
      'Finance': 2,
      'Healthcare': 3,
      'Retail': 4,
      'Manufacturing': 5
    };

    return [{
      type: 'parcoords',
      line: {
        color: prospects.map(p => p.conversionProbability),
        colorscale: [
          [0, '#FF4444'],
          [0.5, '#FFAA00'],
          [1, '#44FF44']
        ],
        showscale: true,
        cmin: 0,
        cmax: 100,
        colorbar: {
          title: 'Conversion<br>Probability (%)',
          thickness: 20,
          len: 0.5
        }
      },
      dimensions: [{
        label: 'Company Size',
        values: prospects.map(p => p.companySize),
        range: [0, 1000]
      }, {
        label: 'Revenue ($M)',
        values: prospects.map(p => p.revenue / 1000000),
        range: [0, 10],
        tickvals: [0, 2.5, 5, 7.5, 10],
        ticktext: ['0', '2.5M', '5M', '7.5M', '10M']
      }, {
        label: 'Engagement',
        values: prospects.map(p => p.engagementScore),
        range: [0, 100]
      }, {
        label: 'Qualification',
        values: prospects.map(p => p.qualificationScore),
        range: [0, 100]
      }, {
        label: 'Response (hrs)',
        values: prospects.map(p => p.responseTime),
        range: [0, 72]
      }, {
        label: 'Deal Size ($K)',
        values: prospects.map(p => p.dealSize / 1000),
        range: [0, 500],
        tickvals: [0, 100, 200, 300, 400, 500],
        ticktext: ['0', '100K', '200K', '300K', '400K', '500K']
      }, {
        label: 'Industry',
        values: prospects.map(p => industryColorMap[p.industry]),
        range: [1, 5],
        tickvals: [1, 2, 3, 4, 5],
        ticktext: ['Tech', 'Fin', 'Health', 'Retail', 'Mfg']
      }]
    }];
  }, []);

  const layout = {
    title: 'Multi-Dimensional Prospect Analysis',
    width: 1000,
    height: 600,
    margin: { l: 100, r: 100, t: 50, b: 50 }
  };

  return <Plot data={data} layout={layout} />;
}

// Sales team performance comparison
export function SalesTeamPerformanceParallel() {
  const data = useMemo(() => {
    // Generate sales team member data
    const teamMembers = Array(30).fill(0).map((_, i) => ({
      name: `Sales Rep ${i + 1}`,
      experience: Math.floor(Math.random() * 10) + 1, // years
      callsPerDay: Math.floor(Math.random() * 50) + 10,
      emailsPerDay: Math.floor(Math.random() * 100) + 20,
      meetingsPerWeek: Math.floor(Math.random() * 15) + 2,
      conversionRate: Math.random() * 30 + 5, // percentage
      avgDealSize: Math.random() * 100000 + 20000,
      customerSatisfaction: Math.random() * 2 + 3, // 3-5 scale
      quota Attainment: Math.random() * 50 + 75 // percentage
    }));

    // Color by quota attainment
    const colors = teamMembers.map(m => {
      if (m.quotaAttainment >= 100) return 3; // Exceeding
      if (m.quotaAttainment >= 90) return 2;  // Meeting
      return 1; // Below
    });

    return [{
      type: 'parcoords',
      line: {
        color: colors,
        colorscale: [
          [0, '#FF4444'],
          [0.5, '#FFAA00'],
          [1, '#44FF44']
        ],
        cmin: 1,
        cmax: 3,
        showscale: true,
        colorbar: {
          title: 'Quota Status',
          thickness: 20,
          tickvals: [1, 2, 3],
          ticktext: ['Below', 'Meeting', 'Exceeding']
        }
      },
      dimensions: [{
        label: 'Experience (yrs)',
        values: teamMembers.map(m => m.experience),
        range: [0, 10]
      }, {
        label: 'Calls/Day',
        values: teamMembers.map(m => m.callsPerDay),
        range: [0, 60]
      }, {
        label: 'Emails/Day',
        values: teamMembers.map(m => m.emailsPerDay),
        range: [0, 120]
      }, {
        label: 'Meetings/Week',
        values: teamMembers.map(m => m.meetingsPerWeek),
        range: [0, 20]
      }, {
        label: 'Conversion %',
        values: teamMembers.map(m => m.conversionRate),
        range: [0, 40]
      }, {
        label: 'Avg Deal ($K)',
        values: teamMembers.map(m => m.avgDealSize / 1000),
        range: [0, 120]
      }, {
        label: 'CSAT',
        values: teamMembers.map(m => m.customerSatisfaction),
        range: [3, 5],
        tickvals: [3, 3.5, 4, 4.5, 5]
      }, {
        label: 'Quota %',
        values: teamMembers.map(m => m.quotaAttainment),
        range: [75, 125],
        constraintrange: [90, 110] // Highlight target range
      }]
    }];
  }, []);

  const layout = {
    title: 'Sales Team Performance Metrics',
    width: 1100,
    height: 600,
    margin: { l: 80, r: 80, t: 50, b: 50 }
  };

  return <Plot data={data} layout={layout} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `type` | Chart type | `'parcoords'` |
| `line.color` | Line colors | Array of values or single color |
| `line.colorscale` | Color gradient | Predefined or custom array |
| `dimensions` | Array of axes | Each with label, values, range |
| `dimensions[].range` | Axis range | [min, max] |
| `dimensions[].constraintrange` | Highlight range | [min, max] for filtering |
| `dimensions[].tickvals` | Custom tick values | Array of numbers |
| `dimensions[].ticktext` | Custom tick labels | Array of strings |
| `dimensions[].multiselect` | Multiple selection | Boolean |

## Use Cases

- **Multi-Criteria Analysis**: Compare products/services across many attributes
- **Customer Segmentation**: Visualize customer profiles across dimensions
- **Performance Metrics**: Compare team members across KPIs
- **Quality Control**: Analyze products across quality parameters
- **Risk Assessment**: Evaluate risks across multiple factors
- **Portfolio Analysis**: Compare investments across metrics
- **Feature Comparison**: Analyze features across products/competitors

## Documentation Links
📚 [Plotly Parallel Coordinates](https://plotly.com/javascript/parallel-coordinates-plot/)
📚 [Parallel Categories](https://plotly.com/javascript/parallel-categories-diagram/)
📚 [Interactive Features](https://plotly.com/javascript/reference/parcoords/)

## Tips
- Order dimensions strategically to reveal patterns
- Use color to encode an important variable
- Apply `constraintrange` to highlight optimal ranges
- Keep 5-10 dimensions for readability
- Use consistent scales where appropriate
- Enable brushing for interactive filtering
- Consider log scales for wide-ranging values
- Add descriptive labels and units