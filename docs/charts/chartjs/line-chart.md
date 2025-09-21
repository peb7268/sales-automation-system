# Line Chart - Chart.js

## Description
Line charts in Chart.js display data points connected by lines, perfect for showing trends over time, comparing multiple datasets, and visualizing continuous data. Chart.js provides a powerful, responsive, and customizable line chart implementation.

## Working Example

```tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SalesLineChart() {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [65000, 59000, 80000, 81000, 56000, 95000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4, // Smooth curves
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Target Revenue',
        data: [70000, 70000, 75000, 75000, 80000, 85000],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5], // Dashed line
        tension: 0.4,
        pointRadius: 0, // No points on this line
        pointHoverRadius: 5
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
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Monthly Sales Performance',
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
        display: true,
        title: {
          display: true,
          text: 'Month'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}

// Area chart variation
export function AreaLineChart() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'This Week',
        data: [12, 19, 3, 5, 2, 3, 7],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true // Enable area fill
      },
      {
        label: 'Last Week',
        data: [8, 12, 5, 9, 4, 6, 5],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: true
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
        text: 'Weekly Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true // Stack areas
      }
    }
  };

  return <Line data={data} options={options} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `tension` | Line curve smoothness | 0 (straight) to 1 (very curved) |
| `borderColor` | Line color | Any CSS color |
| `backgroundColor` | Fill color | Any CSS color (use rgba for transparency) |
| `borderWidth` | Line thickness | Number in pixels |
| `borderDash` | Dashed line pattern | Array [dash, gap] |
| `pointRadius` | Point size | Number in pixels |
| `pointStyle` | Point shape | `'circle'`, `'cross'`, `'rect'`, `'star'`, `'triangle'` |
| `fill` | Area fill | Boolean, `'start'`, `'end'`, `'origin'` |
| `stepped` | Stepped line | Boolean or `'before'`, `'after'`, `'middle'` |

## Use Cases

- **Time Series Data**: Sales, revenue, user growth over time
- **Trend Analysis**: Market trends, performance metrics
- **Comparative Analysis**: Multiple metrics on same chart
- **Forecasting**: Actual vs projected data
- **Real-time Monitoring**: Live data updates
- **Financial Charts**: Stock prices, portfolio performance
- **Scientific Data**: Temperature, measurements over time

## Documentation Links
📚 [Chart.js Line Chart Documentation](https://www.chartjs.org/docs/latest/charts/line.html)
📚 [React-ChartJS-2 Examples](https://react-chartjs-2.js.org/examples/line-chart)
📚 [Chart.js Configuration](https://www.chartjs.org/docs/latest/configuration/)

## Advanced Features

```tsx
// Real-time updating chart
export function RealTimeLineChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Live Data',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => ({
        labels: [...prev.labels.slice(-9), new Date().toLocaleTimeString()],
        datasets: [{
          ...prev.datasets[0],
          data: [...prev.datasets[0].data.slice(-9), Math.random() * 100]
        }]
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    scales: {
      x: {
        display: true
      },
      y: {
        beginAtZero: true
      }
    },
    animation: {
      duration: 0 // Disable animation for real-time
    }
  };

  return <Line data={chartData} options={options} />;
}
```

## Tips
- Use `tension` for smooth curves, 0.4 is usually good
- Apply `fill` for area charts
- Use `borderDash` for projected/target lines
- Format tooltips with currency/percentage
- Consider `stepped` for discrete changes
- Use multiple y-axes for different scales
- Implement zoom plugin for large datasets
- Add annotations for important thresholds