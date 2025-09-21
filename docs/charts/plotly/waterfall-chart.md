# Waterfall Chart - Plotly.js

## Description
Waterfall charts show how an initial value is affected by a series of positive and negative changes. Perfect for financial analysis, showing profit/loss breakdown, budget variances, or any sequential value changes.

## Working Example

```tsx
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function RevenueWaterfallChart() {
  const data = useMemo(() => {
    // Revenue breakdown data
    const categories = [
      'Q1 Starting', 'New Customers', 'Upsells', 'Renewals',
      'Churn', 'Downgrades', 'Q1 Ending',
      'New Customers', 'Upsells', 'Renewals',
      'Churn', 'Discounts', 'Q2 Ending'
    ];

    const values = [
      500000, 120000, 45000, 80000,
      -35000, -15000, null,
      150000, 60000, 95000,
      -40000, -20000, null
    ];

    // Calculate cumulative values and determine measure types
    let cumulative = 500000;
    const measures = [];
    const calculatedValues = [];
    const textValues = [];

    categories.forEach((cat, i) => {
      if (i === 0) {
        measures.push('absolute');
        calculatedValues.push(values[i]);
        textValues.push(`$${(values[i] / 1000).toFixed(0)}k`);
      } else if (cat.includes('Ending')) {
        measures.push('total');
        calculatedValues.push(cumulative);
        textValues.push(`$${(cumulative / 1000).toFixed(0)}k`);
      } else {
        measures.push('relative');
        calculatedValues.push(values[i]);
        cumulative += values[i];
        const sign = values[i] > 0 ? '+' : '';
        textValues.push(`${sign}$${(values[i] / 1000).toFixed(0)}k`);
      }
    });

    return [{
      type: 'waterfall',
      name: 'Revenue Flow',
      orientation: 'v',
      measure: measures,
      x: categories,
      y: calculatedValues,
      text: textValues,
      textposition: 'outside',
      connector: {
        line: {
          color: 'rgb(63, 63, 63)',
          width: 2,
          dash: 'dot'
        }
      },
      increasing: { marker: { color: '#2E7D32' } },
      decreasing: { marker: { color: '#C62828' } },
      totals: { marker: { color: '#1976D2' } }
    }];
  }, []);

  const layout = {
    title: 'Quarterly Revenue Waterfall Analysis',
    xaxis: {
      type: 'category',
      automargin: true
    },
    yaxis: {
      title: 'Revenue ($)',
      gridcolor: '#E0E0E0',
      tickformat: '$,.0f'
    },
    showlegend: false,
    width: 900,
    height: 500,
    margin: { t: 60, b: 100 }
  };

  return <Plot data={data} layout={layout} />;
}

// Sales pipeline waterfall
export function SalesPipelineWaterfall() {
  const data = useMemo(() => {
    const stages = [
      'Total Leads',
      'Unqualified',
      'Qualified Leads',
      'No Response',
      'Active Opportunities',
      'Lost to Competition',
      'Budget Issues',
      'Closed Won'
    ];

    const values = [1000, -350, null, -200, null, -180, -120, null];

    // Calculate running totals
    let running = 1000;
    const measures = [];
    const calculatedValues = [];
    const colors = [];

    stages.forEach((stage, i) => {
      if (i === 0) {
        measures.push('absolute');
        calculatedValues.push(values[i]);
        colors.push('#4CAF50');
      } else if (values[i] === null) {
        measures.push('total');
        calculatedValues.push(running);
        colors.push('#2196F3');
      } else {
        measures.push('relative');
        calculatedValues.push(values[i]);
        running += values[i];
        colors.push(values[i] < 0 ? '#F44336' : '#4CAF50');
      }
    });

    return [{
      type: 'waterfall',
      orientation: 'v',
      measure: measures,
      x: stages,
      y: calculatedValues,
      text: calculatedValues.map(v => Math.abs(v).toString()),
      textposition: 'inside',
      textfont: {
        color: 'white',
        size: 14
      },
      connector: {
        line: {
          color: '#9E9E9E',
          width: 1.5
        }
      },
      increasing: { marker: { color: '#4CAF50' } },
      decreasing: { marker: { color: '#F44336' } },
      totals: { marker: { color: '#2196F3' } },
      hovertemplate: '%{x}<br>Count: %{y}<br><extra></extra>'
    }];
  }, []);

  const layout = {
    title: 'Sales Pipeline Conversion Waterfall',
    xaxis: {
      type: 'category',
      tickangle: -45,
      automargin: true
    },
    yaxis: {
      title: 'Number of Prospects',
      gridcolor: '#E0E0E0'
    },
    showlegend: false,
    width: 900,
    height: 500,
    margin: { b: 120 }
  };

  return <Plot data={data} layout={layout} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `type` | Chart type | `'waterfall'` |
| `measure` | Bar type for each point | `['relative', 'absolute', 'total']` |
| `orientation` | Bar orientation | `'v'` (vertical) or `'h'` (horizontal) |
| `x`, `y` | Data arrays | Categories and values |
| `increasing` | Style for positive | `{marker: {color}}` |
| `decreasing` | Style for negative | `{marker: {color}}` |
| `totals` | Style for totals | `{marker: {color}}` |
| `connector` | Line between bars | `{line: {color, width, dash}}` |
| `text` | Bar labels | Array of strings |
| `textposition` | Label position | `'inside'`, `'outside'`, `'auto'` |

## Use Cases

- **Financial Analysis**: P&L breakdown, cash flow analysis
- **Budget Variance**: Actual vs planned budget differences
- **Sales Pipeline**: Conversion funnel with drop-offs
- **Inventory Changes**: Stock movements over time
- **Project Costs**: Cost breakdown and overruns
- **Customer Lifetime Value**: Revenue and cost components
- **Performance Attribution**: Contribution analysis

## Documentation Links
📚 [Plotly Waterfall Charts](https://plotly.com/javascript/waterfall-charts/)
📚 [Financial Charts](https://plotly.com/javascript/financial-charts/)
📚 [Chart Attributes](https://plotly.com/javascript/reference/waterfall/)

## Tips
- Use `measure` array to define bar types correctly
- Apply consistent colors: green for gains, red for losses
- Include connector lines for better flow visualization
- Add text labels for exact values
- Consider horizontal orientation for many categories
- Use `totals` measure for subtotals and final values
- Format currency values with `tickformat`