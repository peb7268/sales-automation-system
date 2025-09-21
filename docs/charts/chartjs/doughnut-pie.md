# Doughnut & Pie Charts - Chart.js

## Description
Doughnut and pie charts display data as proportional segments of a circle. Perfect for showing part-to-whole relationships, percentages, and composition breakdowns. Doughnut charts have a hollow center, making them ideal for displaying additional information.

## Working Example

```tsx
import { Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SalesDoughnutChart() {
  const data = {
    labels: ['Direct Sales', 'Online Sales', 'Partner Sales', 'Retail', 'Wholesale'],
    datasets: [
      {
        label: 'Revenue by Channel',
        data: [300000, 250000, 180000, 150000, 120000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Revenue Distribution by Sales Channel',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value);
            return `${label}: ${formattedValue} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

// Pie chart with custom center text (for doughnut)
export function MetricsDoughnutWithCenter() {
  const data = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  // Plugin to draw text in center
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart: any) {
      const { ctx, chartArea: { width, height } } = chart;
      ctx.restore();

      // Calculate total
      const total = chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);

      // Draw percentage
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      ctx.fillText(`${total}%`, width / 2, height / 2 - 10);

      // Draw label
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText('Total Progress', width / 2, height / 2 + 20);

      ctx.save();
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Makes it a doughnut
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '400px' }}>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

// Nested doughnut chart
export function NestedDoughnutChart() {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Outer - 2024',
        data: [250000, 320000, 280000, 350000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderWidth: 2
      },
      {
        label: 'Inner - 2023',
        data: [200000, 280000, 250000, 300000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(54, 162, 235, 0.4)',
          'rgba(255, 206, 86, 0.4)',
          'rgba(75, 192, 192, 0.4)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Quarterly Revenue Comparison'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(context.parsed);
            return `${label} - ${context.label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `cutout` | Center cutout size | Percentage string (e.g., '50%') |
| `radius` | Outer radius | Percentage string (e.g., '90%') |
| `rotation` | Starting angle | Number in degrees |
| `circumference` | Arc circumference | Number in degrees (360 for full) |
| `backgroundColor` | Segment colors | Array of color strings |
| `borderWidth` | Border thickness | Number in pixels |
| `borderColor` | Border color | Color string or array |
| `hoverOffset` | Offset on hover | Number in pixels |
| `spacing` | Space between segments | Number in pixels |

## Use Cases

- **Market Share**: Display relative market positions
- **Budget Breakdown**: Show spending distribution
- **Survey Results**: Visualize response percentages
- **Portfolio Composition**: Asset allocation
- **Sales Distribution**: Channel or product mix
- **Task Status**: Project completion breakdown
- **Demographics**: Population segments

## Documentation Links
📚 [Chart.js Doughnut & Pie Documentation](https://www.chartjs.org/docs/latest/charts/doughnut.html)
📚 [React-ChartJS-2 Doughnut Example](https://react-chartjs-2.js.org/examples/doughnut-chart)
📚 [Chart.js Plugins](https://www.chartjs.org/docs/latest/developers/plugins.html)

## Advanced Features

```tsx
// Half doughnut (gauge chart)
export function GaugeChart({ value, maxValue = 100 }) {
  const percentage = (value / maxValue) * 100;

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [
          percentage > 75 ? 'rgba(75, 192, 192, 0.8)' :
          percentage > 50 ? 'rgba(255, 206, 86, 0.8)' :
          'rgba(255, 99, 132, 0.8)',
          'rgba(200, 200, 200, 0.2)'
        ],
        borderWidth: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90, // Start from top
    circumference: 180, // Half circle
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '200px', width: '400px' }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '70%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{value}%</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Performance</div>
      </div>
    </div>
  );
}
```

## Tips
- Limit pie/doughnut to 5-7 segments for clarity
- Use `cutout: '70%'` for modern doughnut style
- Sort data by value for better visual hierarchy
- Add `hoverOffset` for interactive feedback
- Use consistent color schemes across charts
- Consider using patterns for accessibility
- Add center text to doughnuts for key metrics
- Use semi-circles for gauge-style charts