# Sparklines - ApexCharts

## Description
Sparklines are small, simple charts without axes or labels that fit in a small area. Perfect for dashboards, tables, cards, and inline visualizations showing trends at a glance.

## Working Example

```tsx
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

// Simple line sparkline
export function LineSparkline({ data, color = '#00E396' }) {
  const series = [{
    data: data || [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
  }];

  const options: ApexOptions = {
    chart: {
      type: 'line',
      width: 100,
      height: 35,
      sparkline: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: [color],
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function() {
            return '';
          }
        }
      },
      marker: {
        show: false
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="line" height={35} width={100} />;
}

// Dashboard card with sparklines
export function DashboardCard({ title, value, change, sparklineData }) {
  const isPositive = change >= 0;

  const series = [{
    data: sparklineData
  }];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 60,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    colors: [isPositive ? '#00E396' : '#FF4560'],
    tooltip: {
      enabled: false
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      minWidth: '250px'
    }}>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          color: isPositive ? '#00E396' : '#FF4560',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <div style={{ flex: 1 }}>
          <ReactApexChart options={options} series={series} type="area" height={60} />
        </div>
      </div>
    </div>
  );
}

// Table with sparklines
export function TableWithSparklines() {
  const tableData = [
    { product: 'Product A', sales: 45234, trend: [10, 15, 8, 22, 18, 25, 30] },
    { product: 'Product B', sales: 32456, trend: [30, 25, 35, 20, 25, 30, 28] },
    { product: 'Product C', sales: 67890, trend: [5, 10, 15, 20, 25, 30, 35] },
    { product: 'Product D', sales: 23456, trend: [35, 30, 25, 20, 15, 20, 25] }
  ];

  const SparklineCell = ({ data, type = 'line' }) => {
    const series = [{ data }];

    const options: ApexOptions = {
      chart: {
        type: type,
        width: 100,
        height: 30,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 1.5
      },
      fill: {
        opacity: type === 'area' ? 0.3 : 1
      },
      colors: ['#008FFB'],
      tooltip: {
        enabled: false
      }
    };

    return <ReactApexChart options={options} series={series} type={type} height={30} width={100} />;
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
          <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
          <th style={{ padding: '10px', textAlign: 'right' }}>Sales</th>
          <th style={{ padding: '10px', textAlign: 'center' }}>7-Day Trend</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, index) => (
          <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={{ padding: '10px' }}>{row.product}</td>
            <td style={{ padding: '10px', textAlign: 'right' }}>
              ${row.sales.toLocaleString()}
            </td>
            <td style={{ padding: '10px', textAlign: 'center' }}>
              <SparklineCell data={row.trend} type="line" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Win/Loss sparkline bars
export function WinLossSparkline({ data }) {
  const series = [{
    data: data || [44, -55, 41, -37, 22, 43, -21, 33, -45, 31, 56]
  }];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      width: 150,
      height: 35,
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
        colors: {
          ranges: [{
            from: -100,
            to: -1,
            color: '#FF4560'
          }, {
            from: 0,
            to: 100,
            color: '#00E396'
          }]
        }
      }
    },
    tooltip: {
      fixed: {
        enabled: false
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="bar" height={35} width={150} />;
}

// Composite sparkline dashboard
export function SparklineDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      <DashboardCard
        title="Total Revenue"
        value="$125,430"
        change={12.5}
        sparklineData={[31, 40, 28, 51, 42, 82, 56]}
      />
      <DashboardCard
        title="New Customers"
        value="234"
        change={-5.2}
        sparklineData={[45, 35, 41, 38, 32, 28, 25]}
      />
      <DashboardCard
        title="Conversion Rate"
        value="3.45%"
        change={8.1}
        sparklineData={[15, 18, 20, 22, 25, 28, 30]}
      />
      <DashboardCard
        title="Avg Order Value"
        value="$534"
        change={15.3}
        sparklineData={[22, 25, 30, 35, 40, 45, 50]}
      />
    </div>
  );
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `sparkline.enabled` | Enable sparkline mode | `true` |
| `chart.width` | Chart width | Number |
| `chart.height` | Chart height | Number |
| `tooltip.enabled` | Show/hide tooltip | Boolean |
| `stroke.curve` | Line smoothing | `'straight'`, `'smooth'` |
| `stroke.width` | Line thickness | Number |

## Sparkline Types

### Line Sparklines
- Trends over time
- Stock price movements
- Performance indicators

### Bar Sparklines
- Win/loss indicators
- Daily comparisons
- Discrete values

### Area Sparklines
- Volume trends
- Cumulative metrics
- Fill emphasis

## Use Cases

- **Dashboard Cards**: KPI indicators with trends
- **Data Tables**: Inline trend visualization
- **List Items**: Quick performance view
- **Headers/Footers**: Compact metrics display
- **Tooltips**: Additional context
- **Mobile Views**: Space-efficient charts
- **Email Reports**: Simple visualizations

## Documentation Links
📚 [ApexCharts Sparklines](https://apexcharts.com/docs/chart-types/sparklines/)
📚 [Sparkline Examples](https://apexcharts.com/javascript-chart-demos/sparklines/)
📚 [Dashboard Examples](https://apexcharts.com/javascript-chart-demos/dashboards/)

## Tips
- Keep sparklines simple and focused
- Remove axes and labels for clarity
- Use consistent sizing in groups
- Apply subtle colors
- Disable tooltips for cleaner look
- Use area fill for volume emphasis
- Consider bar charts for discrete data
- Test responsive behavior