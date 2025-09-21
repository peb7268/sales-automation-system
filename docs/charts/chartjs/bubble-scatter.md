# Bubble & Scatter Charts - Chart.js

## Description
Scatter charts plot points using Cartesian coordinates to display relationships between variables. Bubble charts extend scatter charts by adding a third dimension through bubble size. Perfect for correlation analysis, clustering, and multi-dimensional data visualization.

## Working Example

```tsx
import { Scatter, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export function SalesBubbleChart() {
  const data = {
    datasets: [
      {
        label: 'North Region',
        data: [
          { x: 20, y: 30, r: 15 }, // x: days to close, y: profit margin, r: deal size
          { x: 40, y: 25, r: 10 },
          { x: 15, y: 35, r: 25 },
          { x: 30, y: 28, r: 8 },
          { x: 25, y: 32, r: 12 }
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: 'South Region',
        data: [
          { x: 35, y: 20, r: 20 },
          { x: 25, y: 35, r: 15 },
          { x: 45, y: 15, r: 10 },
          { x: 20, y: 25, r: 18 },
          { x: 30, y: 30, r: 12 }
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'East Region',
        data: [
          { x: 18, y: 40, r: 22 },
          { x: 28, y: 18, r: 8 },
          { x: 35, y: 32, r: 15 },
          { x: 22, y: 28, r: 11 },
          { x: 40, y: 22, r: 14 }
        ],
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Sales Performance Analysis',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const data = context.parsed;
            return [
              `${label}`,
              `Days to Close: ${data.x}`,
              `Profit Margin: ${data.y}%`,
              `Deal Size: $${data._custom * 10000}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days to Close'
        },
        min: 0,
        max: 50
      },
      y: {
        title: {
          display: true,
          text: 'Profit Margin (%)'
        },
        min: 0,
        max: 50
      }
    }
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <Bubble data={data} options={options} />
    </div>
  );
}

// Scatter plot with trend line
export function CorrelationScatterChart() {
  // Generate sample data with correlation
  const generateData = (count: number) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100;
      // Add correlation with some noise
      const y = x * 0.8 + (Math.random() - 0.5) * 30 + 10;
      data.push({ x, y });
    }
    return data;
  };

  // Calculate trend line
  const calculateTrendLine = (data: any[]) => {
    const n = data.length;
    const sumX = data.reduce((acc, point) => acc + point.x, 0);
    const sumY = data.reduce((acc, point) => acc + point.y, 0);
    const sumXY = data.reduce((acc, point) => acc + point.x * point.y, 0);
    const sumX2 = data.reduce((acc, point) => acc + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return [
      { x: 0, y: intercept },
      { x: 100, y: slope * 100 + intercept }
    ];
  };

  const scatterData = generateData(50);
  const trendLineData = calculateTrendLine(scatterData);

  const data = {
    datasets: [
      {
        type: 'scatter' as const,
        label: 'Marketing Spend vs Revenue',
        data: scatterData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        type: 'line' as const,
        label: 'Trend Line',
        data: trendLineData,
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Marketing Spend Correlation Analysis'
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Marketing Spend ($k)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Revenue ($k)'
        }
      }
    }
  };

  return <Scatter data={data} options={options} />;
}

// Multi-series scatter plot
export function CustomerSegmentationScatter() {
  const data = {
    datasets: [
      {
        label: 'High Value',
        data: Array(20).fill(0).map(() => ({
          x: 60 + Math.random() * 40,  // High frequency
          y: 200 + Math.random() * 300  // High value
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        pointRadius: 6
      },
      {
        label: 'Regular',
        data: Array(30).fill(0).map(() => ({
          x: 20 + Math.random() * 40,  // Medium frequency
          y: 50 + Math.random() * 150   // Medium value
        })),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgb(255, 206, 86)',
        pointRadius: 5
      },
      {
        label: 'At Risk',
        data: Array(15).fill(0).map(() => ({
          x: Math.random() * 30,        // Low frequency
          y: Math.random() * 100         // Low value
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        pointRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Customer Segmentation Analysis'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            return `${label}: Frequency ${context.parsed.x.toFixed(0)}, Value $${context.parsed.y.toFixed(0)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Purchase Frequency (per year)'
        },
        min: 0,
        max: 100
      },
      y: {
        title: {
          display: true,
          text: 'Average Order Value ($)'
        },
        min: 0,
        max: 500
      }
    }
  };

  return <Scatter data={data} options={options} />;
}
```

## Key Configuration

### Scatter Chart
| Property | Description | Options |
|----------|-------------|---------|
| `data` | Array of {x, y} objects | `[{x: number, y: number}]` |
| `pointRadius` | Point size | Number in pixels |
| `pointStyle` | Point shape | `'circle'`, `'cross'`, `'rect'`, etc. |
| `pointHoverRadius` | Size on hover | Number in pixels |
| `showLine` | Connect points | Boolean |

### Bubble Chart
| Property | Description | Options |
|----------|-------------|---------|
| `data` | Array of {x, y, r} objects | `[{x, y, r: radius}]` |
| `radius` | Default bubble radius | Number |
| `hoverRadius` | Radius on hover | Number |
| `rotation` | Bubble rotation | Number in degrees |

## Use Cases

### Scatter Charts
- **Correlation Analysis**: Relationship between variables
- **Outlier Detection**: Identify anomalies
- **Clustering**: Natural groupings in data
- **Performance Mapping**: Two-dimensional performance
- **Risk Assessment**: Risk vs return analysis

### Bubble Charts
- **Three-Variable Analysis**: Add size dimension
- **Portfolio Analysis**: Risk, return, and investment size
- **Market Analysis**: Market share, growth, and profitability
- **Customer Segmentation**: Value, frequency, and recency
- **Project Management**: Time, cost, and scope

## Documentation Links
📚 [Chart.js Scatter Chart](https://www.chartjs.org/docs/latest/charts/scatter.html)
📚 [Chart.js Bubble Chart](https://www.chartjs.org/docs/latest/charts/bubble.html)
📚 [React-ChartJS-2 Examples](https://react-chartjs-2.js.org/examples/scatter-chart)

## Tips
- Use transparency for overlapping points
- Add trend lines to show correlations
- Consider logarithmic scales for wide ranges
- Use different shapes for categories
- Implement zoom plugin for large datasets
- Add quadrant lines for classification
- Use consistent bubble scaling
- Consider jitter for overlapping points