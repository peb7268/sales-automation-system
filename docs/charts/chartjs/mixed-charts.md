# Mixed Charts - Chart.js

## Description
Mixed charts combine multiple chart types in a single visualization, allowing for complex data relationships to be displayed simultaneously. Perfect for showing different metrics with varying scales, combining trends with distributions, or displaying forecasts alongside actuals.

## Working Example

```tsx
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SalesDashboardMixed() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        type: 'bar' as const,
        label: 'Revenue',
        data: [420, 380, 450, 490, 520, 480, 510, 550, 580, 620, 640, 680],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        yAxisID: 'y',
        order: 2
      },
      {
        type: 'bar' as const,
        label: 'Costs',
        data: [280, 250, 290, 310, 320, 300, 315, 330, 340, 360, 370, 380],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        yAxisID: 'y',
        order: 2
      },
      {
        type: 'line' as const,
        label: 'Profit Margin',
        data: [33, 34, 36, 37, 38, 37.5, 38.2, 40, 41.4, 42, 42.2, 44],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
        order: 1
      },
      {
        type: 'line' as const,
        label: 'Forecast',
        data: [null, null, null, null, null, null, null, null, null, 620, 640, 680],
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        yAxisID: 'y',
        order: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Financial Performance Dashboard',
        font: {
          size: 20,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (context.dataset.yAxisID === 'y') {
              return `${label}: $${context.parsed.y}k`;
            } else {
              return `${label}: ${context.parsed.y}%`;
            }
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Amount ($k)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Margin (%)'
        },
        grid: {
          drawOnChartArea: false
        },
        min: 0,
        max: 50
      }
    }
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <Chart type='bar' data={data} options={options} />
    </div>
  );
}

// Stacked area with line overlay
export function StackedAreaWithTrend() {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        type: 'line' as const,
        label: 'Email',
        data: [30, 35, 32, 38, 40, 42],
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        borderColor: 'rgb(255, 99, 132)',
        fill: true,
        stack: 'Stack 0'
      },
      {
        type: 'line' as const,
        label: 'Social',
        data: [20, 25, 28, 22, 30, 35],
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgb(54, 162, 235)',
        fill: true,
        stack: 'Stack 0'
      },
      {
        type: 'line' as const,
        label: 'Direct',
        data: [15, 18, 20, 25, 22, 28],
        backgroundColor: 'rgba(255, 206, 86, 0.3)',
        borderColor: 'rgb(255, 206, 86)',
        fill: true,
        stack: 'Stack 0'
      },
      {
        type: 'line' as const,
        label: 'Total Conversions',
        data: [65, 78, 80, 85, 92, 105],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(75, 192, 192)'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Conversion Sources Analysis'
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Conversions'
        }
      }
    }
  };

  return <Chart type='line' data={data} options={options} />;
}

// Combo chart with multiple types
export function ComplexMixedChart() {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        type: 'bar' as const,
        label: 'Actual Sales',
        data: [450, 520, 480, 590],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        yAxisID: 'y'
      },
      {
        type: 'bar' as const,
        label: 'Target Sales',
        data: [500, 500, 550, 600],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        yAxisID: 'y'
      },
      {
        type: 'line' as const,
        label: 'Growth Rate',
        data: [15, 18, 12, 23],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 3,
        fill: false,
        yAxisID: 'y1',
        pointStyle: 'star',
        pointRadius: 8
      },
      {
        type: 'scatter' as const,
        label: 'Outliers',
        data: [
          { x: 'Q1', y: 480 },
          { x: 'Q3', y: 450 }
        ],
        backgroundColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 10,
        yAxisID: 'y'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Quarterly Performance Analysis'
      }
    },
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
        title: {
          display: true,
          text: 'Growth (%)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return <Chart type='bar' data={data} options={options} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `type` | Chart type per dataset | `'bar'`, `'line'`, `'scatter'`, `'bubble'` |
| `yAxisID` | Assign to y-axis | `'y'`, `'y1'`, custom ID |
| `order` | Drawing order | Number (lower drawn first) |
| `stack` | Stack group | String identifier |
| `fill` | Fill area under line | Boolean, `'origin'`, `'start'`, `'end'` |

## Common Mixed Chart Patterns

### Bar + Line
- Revenue (bars) with profit margin (line)
- Volume (bars) with average (line)
- Actual (bars) vs target (line)

### Stacked Area + Line
- Component breakdown with total trend
- Category contributions with overall performance

### Multiple Lines + Scatter
- Trends with outlier identification
- Forecasts with confidence intervals

### Bar + Area + Line
- Complex financial dashboards
- Multi-metric performance views

## Use Cases

- **Financial Dashboards**: Revenue, costs, and margins
- **Sales Analytics**: Volume, value, and conversion rates
- **Performance Tracking**: Actuals, targets, and trends
- **Marketing Analysis**: Channel performance and ROI
- **Operational Metrics**: Capacity, utilization, and efficiency
- **Forecasting**: Historical data with projections
- **Comparative Analysis**: Multiple metrics on different scales

## Documentation Links
📚 [Chart.js Mixed Charts](https://www.chartjs.org/docs/latest/charts/mixed.html)
📚 [Multiple Axes](https://www.chartjs.org/docs/latest/samples/scales/multi-axis.html)
📚 [React-ChartJS-2 Mixed Examples](https://react-chartjs-2.js.org/)

## Tips
- Use `order` property to control layering
- Assign different `yAxisID` for different scales
- Use transparency to show overlapping data
- Apply `borderDash` for projected/estimated data
- Consider color consistency across chart types
- Limit to 3-4 chart types for clarity
- Use common x-axis for alignment
- Test responsive behavior with multiple axes