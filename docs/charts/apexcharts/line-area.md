# Line & Area Charts - ApexCharts

## Description
ApexCharts provides highly interactive line and area charts with smooth animations, zoom capabilities, and extensive customization options. Perfect for time series data, trends, and continuous data visualization.

## Working Example

```tsx
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export function SalesLineChart() {
  const series = [
    {
      name: 'Revenue',
      data: [31000, 40000, 28000, 51000, 42000, 109000, 100000]
    },
    {
      name: 'Profit',
      data: [11000, 32000, 45000, 32000, 34000, 52000, 41000]
    }
  ];

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom',
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    title: {
      text: 'Revenue & Profit Trends',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      title: {
        text: 'Month'
      }
    },
    yaxis: {
      title: {
        text: 'Amount ($)'
      },
      labels: {
        formatter: function(value) {
          return '$' + value.toLocaleString();
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(value) {
          return '$' + value.toLocaleString();
        }
      }
    },
    colors: ['#00E396', '#FEB019'],
    fill: {
      opacity: 1
    }
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
}

// Area chart with gradient
export function GradientAreaChart() {
  const series = [{
    name: 'Sales',
    data: [45, 52, 38, 45, 19, 23, 35, 42, 55, 45, 60, 55]
  }];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      sparkline: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#7E36AF',
            opacity: 1
          },
          {
            offset: 60,
            color: '#164666',
            opacity: 1
          },
          {
            offset: 100,
            color: '#3ABEF9',
            opacity: 1
          }
        ]
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    colors: ['#7E36AF'],
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 5
    },
    markers: {
      size: 5,
      colors: ['#7E36AF'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="area" height={350} />;
}

// Multi-series area chart with time series
export function TimeSeriesArea() {
  const series = [
    {
      name: 'Product A',
      data: generateTimeSeries('2024-01-01', 30, { min: 30, max: 90 })
    },
    {
      name: 'Product B',
      data: generateTimeSeries('2024-01-01', 30, { min: 20, max: 60 })
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      stacked: false,
      height: 350,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return val.toFixed(0);
        }
      },
      title: {
        text: 'Sales'
      }
    },
    xaxis: {
      type: 'datetime'
    },
    tooltip: {
      shared: true,
      x: {
        format: 'dd MMM yyyy'
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="area" height={350} />;
}

// Helper function for time series data
function generateTimeSeries(startDate: string, count: number, yrange: { min: number, max: number }) {
  const series = [];
  let date = new Date(startDate).getTime();

  for (let i = 0; i < count; i++) {
    series.push({
      x: date,
      y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
    });
    date += 86400000; // Add one day
  }

  return series;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `stroke.curve` | Line smoothing | `'straight'`, `'smooth'`, `'stepline'` |
| `stroke.width` | Line thickness | Number or array |
| `stroke.dashArray` | Dashed lines | Number or array |
| `fill.type` | Fill type | `'solid'`, `'gradient'`, `'pattern'`, `'image'` |
| `fill.opacity` | Fill transparency | 0 to 1 |
| `markers` | Data point markers | Size, colors, hover effects |
| `dataLabels` | Show values on chart | Boolean, position, formatter |
| `zoom` | Enable zooming | Type: `'x'`, `'y'`, `'xy'` |
| `animations` | Chart animations | Speed, easing, gradual reveal |

## Use Cases

- **Financial Analysis**: Stock prices, revenue trends
- **Performance Monitoring**: KPI tracking over time
- **Sales Analytics**: Revenue and profit trends
- **Website Analytics**: Traffic and engagement metrics
- **Weather Data**: Temperature and precipitation
- **IoT Monitoring**: Sensor data visualization
- **Forecasting**: Historical data with projections

## Documentation Links
📚 [ApexCharts Line Chart](https://apexcharts.com/docs/chart-types/line-chart/)
📚 [ApexCharts Area Chart](https://apexcharts.com/docs/chart-types/area-chart/)
📚 [React ApexCharts](https://apexcharts.com/docs/react-charts/)

## Advanced Features

```tsx
// Real-time updating chart
export function RealTimeLineChart() {
  const [series, setSeries] = useState([{
    data: Array(10).fill(0).map(() => Math.floor(Math.random() * 100))
  }]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries(prev => [{
        data: [...prev[0].data.slice(1), Math.floor(Math.random() * 100)]
      }]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const options: ApexOptions = {
    chart: {
      id: 'realtime',
      height: 350,
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      categories: Array(10).fill(0).map((_, i) => `T-${9-i}`)
    },
    yaxis: {
      max: 100
    }
  };

  return <ReactApexChart options={options} series={series} type="line" height={350} />;
}
```

## Tips
- Use `zoom` for large datasets
- Apply gradients for visual appeal
- Enable `dataLabels` selectively
- Use `annotations` for important thresholds
- Implement responsive options for mobile
- Consider `sparkline` for compact views
- Use `stroke.dashArray` for projections
- Export charts with toolbar options