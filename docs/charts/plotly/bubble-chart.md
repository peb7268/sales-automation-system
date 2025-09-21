# Bubble Chart - Plotly.js

## Description
Bubble charts display three dimensions of data using x position, y position, and bubble size (optional fourth dimension with color). Perfect for showing relationships between multiple variables, clustering patterns, and outlier detection.

## Working Example

```tsx
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function ProspectQualificationBubble() {
  const data = useMemo(() => {
    // Generate prospect data
    const prospects = Array(50).fill(0).map((_, i) => ({
      name: `Company ${i + 1}`,
      engagementScore: Math.random() * 100,
      qualificationScore: Math.random() * 100,
      dealSize: Math.random() * 500000 + 10000,
      daysInPipeline: Math.floor(Math.random() * 90),
      industry: ['Tech', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'][Math.floor(Math.random() * 5)]
    }));

    const industries = ['Tech', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

    return industries.map((industry, idx) => {
      const industryProspects = prospects.filter(p => p.industry === industry);
      return {
        x: industryProspects.map(p => p.engagementScore),
        y: industryProspects.map(p => p.qualificationScore),
        text: industryProspects.map(p =>
          `${p.name}<br>Deal Size: $${p.dealSize.toLocaleString()}<br>Days in Pipeline: ${p.daysInPipeline}`
        ),
        mode: 'markers',
        marker: {
          size: industryProspects.map(p => Math.sqrt(p.dealSize) / 20),
          color: colors[idx],
          opacity: 0.7,
          line: {
            color: colors[idx],
            width: 1
          }
        },
        name: industry,
        hovertemplate: '%{text}<br>Engagement: %{x:.1f}<br>Qualification: %{y:.1f}<extra></extra>'
      };
    });
  }, []);

  const layout = {
    title: 'Prospect Analysis: Engagement vs Qualification',
    xaxis: {
      title: 'Engagement Score',
      range: [0, 100],
      gridcolor: '#E0E0E0'
    },
    yaxis: {
      title: 'Qualification Score',
      range: [0, 100],
      gridcolor: '#E0E0E0'
    },
    hovermode: 'closest',
    showlegend: true,
    width: 800,
    height: 600,
    paper_bgcolor: '#f8f9fa',
    plot_bgcolor: '#ffffff'
  };

  return <Plot data={data} layout={layout} />;
}

// Animated bubble chart showing progression over time
export function SalesProgressionBubble() {
  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const products = ['Product A', 'Product B', 'Product C', 'Product D'];

    // Create frames for animation
    const frames = months.map((month, monthIdx) => {
      const frameData = products.map((product, prodIdx) => {
        const baseRevenue = (prodIdx + 1) * 50000;
        const baseUnits = (prodIdx + 1) * 100;
        const growth = 1 + (monthIdx * 0.1) + (Math.random() * 0.2);

        return {
          x: [baseUnits * growth + Math.random() * 50], // Units sold
          y: [baseRevenue * growth + Math.random() * 10000], // Revenue
          mode: 'markers',
          marker: {
            size: [20 + monthIdx * 5 + prodIdx * 3],
            color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][prodIdx]
          },
          name: product,
          text: `${product}<br>Month: ${month}`
        };
      });

      return {
        name: month,
        data: frameData
      };
    });

    // Initial data
    const initialData = products.map((product, idx) => ({
      x: [(idx + 1) * 100],
      y: [(idx + 1) * 50000],
      mode: 'markers',
      marker: {
        size: [20 + idx * 3],
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][idx],
        opacity: 0.8
      },
      name: product,
      text: product
    }));

    return initialData;
  }, []);

  const layout = {
    title: 'Product Performance Over Time',
    xaxis: {
      title: 'Units Sold',
      gridcolor: '#E0E0E0'
    },
    yaxis: {
      title: 'Revenue ($)',
      gridcolor: '#E0E0E0'
    },
    hovermode: 'closest',
    width: 800,
    height: 600,
    updatemenus: [{
      x: 0,
      y: 0,
      yanchor: 'top',
      xanchor: 'left',
      showactive: false,
      direction: 'left',
      type: 'buttons',
      pad: { t: 87, r: 10 },
      buttons: [{
        method: 'animate',
        args: [null, {
          mode: 'immediate',
          fromcurrent: true,
          transition: { duration: 300 },
          frame: { duration: 500 }
        }],
        label: 'Play'
      }, {
        method: 'animate',
        args: [[null], {
          mode: 'immediate',
          transition: { duration: 0 },
          frame: { duration: 0 }
        }],
        label: 'Pause'
      }]
    }]
  };

  return <Plot data={data} layout={layout} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `mode` | Display mode | `'markers'`, `'lines'`, `'markers+lines'` |
| `marker.size` | Bubble size | Number or array of numbers |
| `marker.color` | Bubble color | Color string or array |
| `marker.opacity` | Transparency | 0 to 1 |
| `marker.sizemode` | Size scaling | `'diameter'` or `'area'` |
| `marker.sizeref` | Size reference | Number for scaling |
| `marker.line` | Border properties | `{color, width}` |
| `text` | Hover text | String or array |
| `hovertemplate` | Custom tooltip | HTML template string |

## Use Cases

- **Portfolio Analysis**: Risk vs return with investment size
- **Customer Segmentation**: Value vs engagement vs tenure
- **Product Comparison**: Price vs quality vs popularity
- **Market Analysis**: Market share vs growth vs profitability
- **Employee Performance**: Productivity vs quality vs experience
- **Campaign Effectiveness**: Reach vs engagement vs conversion
- **Competitive Landscape**: Feature comparison across competitors

## Documentation Links
📚 [Plotly Bubble Charts](https://plotly.com/javascript/bubble-charts/)
📚 [Marker Styling](https://plotly.com/javascript/marker-style/)
📚 [Animations](https://plotly.com/javascript/animations/)

## Tips
- Use `sizeref` to control bubble scaling
- Apply `opacity` for overlapping bubbles
- Color-code by category for better insights
- Add `text` array for detailed hover information
- Consider log scale for wide value ranges
- Use animation frames for time series data
- Implement zoom/pan for dense bubble plots