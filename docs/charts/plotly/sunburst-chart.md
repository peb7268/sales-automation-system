# Sunburst Chart - Plotly.js

## Description
Sunburst charts display hierarchical data as concentric rings, with each ring representing a level in the hierarchy. Perfect for showing part-to-whole relationships, organizational structures, file systems, or multi-level categorical breakdowns.

## Working Example

```tsx
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function SalesCampaignSunburst() {
  const data = useMemo(() => {
    // Hierarchical campaign data
    const labels = [
      'Total Campaigns',
      // Level 1: Campaign Types
      'Email', 'Phone', 'Social', 'Events',
      // Level 2: Email campaigns
      'Newsletter', 'Product Launch', 'Re-engagement',
      // Level 2: Phone campaigns
      'Cold Calls', 'Follow-ups', 'Demos',
      // Level 2: Social campaigns
      'LinkedIn', 'Twitter', 'Facebook',
      // Level 2: Events
      'Webinars', 'Trade Shows', 'Workshops'
    ];

    const parents = [
      '',
      // Level 1 parents
      'Total Campaigns', 'Total Campaigns', 'Total Campaigns', 'Total Campaigns',
      // Level 2 parents
      'Email', 'Email', 'Email',
      'Phone', 'Phone', 'Phone',
      'Social', 'Social', 'Social',
      'Events', 'Events', 'Events'
    ];

    const values = [
      0, // Root (sum of children)
      // Level 1 values (will be sum of their children)
      0, 0, 0, 0,
      // Level 2 values (actual values)
      450, 320, 180,  // Email campaigns
      280, 350, 420,  // Phone campaigns
      220, 180, 150,  // Social campaigns
      380, 450, 290   // Events
    ];

    const colors = [
      '', // Root
      // Level 1 colors
      '#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4',
      // Level 2 - inherit from parent with slight variation
      '#4ECDC4', '#5DD4CC', '#6EDCD4',
      '#FF6B6B', '#FF7B7B', '#FF8B8B',
      '#45B7D1', '#55C7E1', '#65D7F1',
      '#96CEB4', '#A6DEC4', '#B6EED4'
    ];

    return [{
      type: 'sunburst',
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: 'total',
      marker: {
        colors: colors,
        line: { color: 'white', width: 2 }
      },
      textinfo: 'label+percent parent',
      hovertemplate: '<b>%{label}</b><br>Leads: %{value}<br>%{percentParent} of parent<br>%{percentRoot} of total<extra></extra>',
      textfont: { size: 12 },
      insidetextorientation: 'radial'
    }];
  }, []);

  const layout = {
    title: 'Campaign Performance Breakdown',
    width: 700,
    height: 700,
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };

  return <Plot data={data} layout={layout} />;
}

// Product sales hierarchy
export function ProductSalesSunburst() {
  const data = useMemo(() => {
    // Product hierarchy: Category > Subcategory > Product
    const structure = {
      'Software': {
        'Productivity': { 'TaskMaster': 45000, 'TimePro': 38000, 'DocFlow': 32000 },
        'Security': { 'SecureVault': 52000, 'NetGuard': 41000, 'DataShield': 35000 },
        'Analytics': { 'DataViz': 48000, 'MetricsPro': 39000, 'InsightAI': 44000 }
      },
      'Services': {
        'Consulting': { 'Strategy': 62000, 'Implementation': 55000, 'Training': 38000 },
        'Support': { 'Premium': 45000, 'Standard': 35000, 'Basic': 28000 },
        'Development': { 'Custom': 72000, 'Integration': 48000, 'Migration': 42000 }
      },
      'Hardware': {
        'Devices': { 'Scanner Pro': 28000, 'Terminal X': 32000, 'Hub Connect': 25000 },
        'Accessories': { 'Cables': 12000, 'Mounts': 8000, 'Cases': 15000 }
      }
    };

    const labels = ['Total Sales'];
    const parents = [''];
    const values = [0];
    const colors = ['#ffffff'];

    // Build hierarchy
    Object.entries(structure).forEach(([category, subcategories], catIdx) => {
      labels.push(category);
      parents.push('Total Sales');
      values.push(0);
      const catColor = ['#FF6B6B', '#4ECDC4', '#45B7D1'][catIdx];
      colors.push(catColor);

      Object.entries(subcategories).forEach(([subcategory, products]) => {
        labels.push(subcategory);
        parents.push(category);
        values.push(0);
        colors.push(catColor);

        Object.entries(products).forEach(([product, value]) => {
          labels.push(product);
          parents.push(subcategory);
          values.push(value);
          colors.push(catColor);
        });
      });
    });

    return [{
      type: 'sunburst',
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: 'total',
      marker: {
        colors: colors,
        line: { color: 'white', width: 2 },
        colorscale: 'Viridis',
        showscale: false
      },
      textinfo: 'label+value',
      textfont: { size: 11 },
      hovertemplate: '<b>%{label}</b><br>Revenue: $%{value:,.0f}<br>%{percentParent} of %{parent}<extra></extra>',
      insidetextorientation: 'tangential'
    }];
  }, []);

  const layout = {
    title: 'Product Revenue Hierarchy',
    width: 700,
    height: 700,
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };

  return <Plot data={data} layout={layout} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `type` | Chart type | `'sunburst'` |
| `labels` | Text labels for segments | Array of strings |
| `parents` | Parent relationship | Array (empty string for root) |
| `values` | Segment values | Array of numbers |
| `branchvalues` | How to compute branches | `'total'` or `'remainder'` |
| `textinfo` | Text display | `'label'`, `'value'`, `'percent'`, combinations |
| `marker.colors` | Segment colors | Array of color strings |
| `insidetextorientation` | Text orientation | `'radial'`, `'tangential'`, `'horizontal'` |
| `maxdepth` | Maximum visible depth | Number (-1 for all) |

## Use Cases

- **Sales Hierarchies**: Product categories → subcategories → products
- **Organizational Structure**: Company → departments → teams → individuals
- **File Systems**: Visualize folder structures and file sizes
- **Budget Breakdown**: Total budget → departments → projects → items
- **Customer Segments**: Market → segment → subsegment → accounts
- **Website Analytics**: Site → section → page → actions
- **Time Allocation**: Year → quarter → month → project

## Documentation Links
📚 [Plotly Sunburst Charts](https://plotly.com/javascript/sunburst-charts/)
📚 [Hierarchical Data](https://plotly.com/javascript/plotly-fundamentals/#hierarchical-data)
📚 [Sunburst Reference](https://plotly.com/javascript/reference/sunburst/)

## Tips
- Use `branchvalues: 'total'` when parent values are sums of children
- Apply consistent color schemes per level or branch
- Keep labels concise for better readability
- Use `maxdepth` to control initial display depth
- Consider `treemap` for space-efficient alternative
- Enable click events to zoom into sections
- Format values in `hovertemplate` for better tooltips