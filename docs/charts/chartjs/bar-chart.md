# Bar Chart - Chart.js

## Description
Bar charts in Chart.js display data using rectangular bars with heights or lengths proportional to the values. Excellent for comparing discrete categories, showing distributions, and visualizing rankings.

## Working Example

```tsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function SalesBarChart() {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Product A',
        data: [120000, 190000, 150000, 220000],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      },
      {
        label: 'Product B',
        data: [90000, 120000, 180000, 150000],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      },
      {
        label: 'Product C',
        data: [60000, 80000, 100000, 140000],
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Quarterly Product Sales',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + (value / 1000) + 'k';
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

// Stacked bar chart
export function StackedBarChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Direct Sales',
        data: [45, 52, 48, 58, 63, 71],
        backgroundColor: 'rgb(255, 99, 132)',
        stack: 'Stack 0'
      },
      {
        label: 'Online Sales',
        data: [28, 35, 40, 38, 45, 50],
        backgroundColor: 'rgb(54, 162, 235)',
        stack: 'Stack 0'
      },
      {
        label: 'Partner Sales',
        data: [15, 18, 22, 25, 28, 32],
        backgroundColor: 'rgb(255, 206, 86)',
        stack: 'Stack 0'
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
        text: 'Sales Channel Distribution'
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true
      }
    }
  };

  return <Bar data={data} options={options} />;
}

// Horizontal bar chart
export function HorizontalBarChart() {
  const data = {
    labels: ['Sales Team A', 'Sales Team B', 'Sales Team C', 'Sales Team D', 'Sales Team E'],
    datasets: [
      {
        label: 'Performance Score',
        data: [95, 87, 92, 78, 88],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    indexAxis: 'y' as const, // Makes it horizontal
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Team Performance Scores'
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return <Bar data={data} options={options} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `backgroundColor` | Bar fill color | Color string or array |
| `borderColor` | Bar border color | Color string or array |
| `borderWidth` | Border thickness | Number in pixels |
| `borderRadius` | Rounded corners | Number or object |
| `borderSkipped` | Skip border side | `false`, `'start'`, `'end'`, `'bottom'`, `'left'`, `'top'`, `'right'` |
| `barThickness` | Fixed bar width | Number or `'flex'` |
| `maxBarThickness` | Maximum bar width | Number |
| `categoryPercentage` | Category width | 0 to 1 (default 0.8) |
| `barPercentage` | Bar width in category | 0 to 1 (default 0.9) |
| `stack` | Stack group | String identifier |

## Use Cases

- **Sales Comparison**: Compare sales across products, regions, or time periods
- **Category Analysis**: Show distribution across categories
- **Performance Metrics**: Display KPIs and targets
- **Survey Results**: Visualize response distributions
- **Budget Analysis**: Compare budgets vs actuals
- **Rankings**: Show top performers or products
- **Progress Tracking**: Display completion rates

## Documentation Links
📚 [Chart.js Bar Chart Documentation](https://www.chartjs.org/docs/latest/charts/bar.html)
📚 [React-ChartJS-2 Bar Examples](https://react-chartjs-2.js.org/examples/vertical-bar-chart)
📚 [Stacked Bar Charts](https://www.chartjs.org/docs/latest/samples/bar/stacked.html)

## Advanced Features

```tsx
// Mixed chart type (bar + line)
export function MixedBarLineChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        type: 'bar' as const,
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        yAxisID: 'y'
      },
      {
        type: 'line' as const,
        label: 'Profit Margin',
        data: [28, 35, 40, 45, 38, 42],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sales ($k)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Margin (%)'
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
}
```

## Tips
- Use `borderRadius` for modern rounded bars
- Apply different colors per bar for categorical data
- Stack bars to show part-to-whole relationships
- Use horizontal bars for long category names
- Combine with line charts for dual metrics
- Add data labels with chartjs-plugin-datalabels
- Consider grouped bars for side-by-side comparison
- Use gradient backgrounds for visual appeal