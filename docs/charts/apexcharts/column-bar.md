# Column & Bar Charts - ApexCharts

## Description
ApexCharts provides feature-rich column and bar charts with animations, patterns, gradients, and extensive interactivity. Excellent for comparing categories, showing distributions, and displaying rankings with modern visual appeal.

## Working Example

```tsx
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export function SalesColumnChart() {
  const series = [
    {
      name: 'Q1',
      data: [44000, 55000, 57000, 56000, 61000, 58000]
    },
    {
      name: 'Q2',
      data: [76000, 85000, 101000, 98000, 87000, 105000]
    },
    {
      name: 'Q3',
      data: [35000, 41000, 36000, 26000, 45000, 48000]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'],
      title: {
        text: 'Products'
      }
    },
    yaxis: {
      title: {
        text: 'Revenue ($)'
      },
      labels: {
        formatter: function(value) {
          return '$' + (value / 1000) + 'k';
        }
      }
    },
    fill: {
      opacity: 1,
      colors: ['#008FFB', '#00E396', '#FEB019']
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return '$' + val.toLocaleString();
        }
      }
    },
    colors: ['#008FFB', '#00E396', '#FEB019'],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: false,
      offsetY: -10,
      offsetX: -5
    }
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}

// Stacked bar chart
export function StackedBarChart() {
  const series = [
    {
      name: 'Direct',
      data: [44, 55, 41, 67, 22, 43, 21]
    },
    {
      name: 'Online',
      data: [13, 23, 20, 8, 13, 27, 33]
    },
    {
      name: 'Partner',
      data: [11, 17, 15, 15, 21, 14, 15]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: true
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900
            }
          }
        }
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    fill: {
      opacity: 1
    },
    colors: ['#FF4560', '#008FFB', '#00E396'],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    }
  };

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
}

// Horizontal bar with custom colors
export function HorizontalBarChart() {
  const series = [{
    name: 'Performance Score',
    data: [
      { x: 'Team Alpha', y: 92, fillColor: '#00E396' },
      { x: 'Team Beta', y: 88, fillColor: '#008FFB' },
      { x: 'Team Gamma', y: 78, fillColor: '#FEB019' },
      { x: 'Team Delta', y: 85, fillColor: '#FF4560' },
      { x: 'Team Epsilon', y: 95, fillColor: '#775DD0' }
    ]
  }];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        borderRadius: 8,
        barHeight: '70%',
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: function(val) {
        return val + '%';
      },
      offsetX: 0,
      dropShadow: {
        enabled: false
      },
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    xaxis: {
      max: 100,
      title: {
        text: 'Score (%)'
      }
    },
    yaxis: {
      title: {
        text: 'Teams'
      }
    },
    colors: ['#00E396', '#008FFB', '#FEB019', '#FF4560', '#775DD0'],
    legend: {
      show: false
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function() {
            return 'Score:';
          }
        }
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
}

// Bar chart with patterns
export function PatternedBarChart() {
  const series = [{
    name: 'Sales',
    data: [14, 25, 21, 17, 12, 13, 11, 19]
  }];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        distributed: true
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    fill: {
      type: 'pattern',
      opacity: 1,
      pattern: {
        style: ['circles', 'slantedLines', 'verticalLines', 'horizontalLines',
                'slantedLines', 'squares', 'circles', 'verticalLines'],
        width: 6,
        height: 6,
        strokeWidth: 2
      }
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560',
            '#775DD0', '#3F51B5', '#03A9F4', '#4CAF50']
  };

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `plotOptions.bar.horizontal` | Bar orientation | Boolean |
| `plotOptions.bar.columnWidth` | Width of columns | Percentage string |
| `plotOptions.bar.barHeight` | Height of horizontal bars | Percentage string |
| `plotOptions.bar.distributed` | Different color per bar | Boolean |
| `plotOptions.bar.borderRadius` | Rounded corners | Number |
| `plotOptions.bar.endingShape` | Bar end style | `'flat'`, `'rounded'` |
| `chart.stacked` | Stack bars | Boolean |
| `fill.type` | Fill style | `'solid'`, `'gradient'`, `'pattern'` |
| `fill.pattern` | Pattern fills | Style, width, height options |

## Use Cases

- **Sales Comparison**: Compare sales across products or regions
- **Performance Metrics**: Display KPIs and targets
- **Category Analysis**: Show distributions across categories
- **Time Series**: Monthly/quarterly comparisons
- **Rankings**: Top performers or products
- **Progress Tracking**: Actual vs target comparisons
- **Survey Results**: Response distributions

## Documentation Links
📚 [ApexCharts Column Chart](https://apexcharts.com/docs/chart-types/column-chart/)
📚 [ApexCharts Bar Chart](https://apexcharts.com/docs/chart-types/bar-chart/)
📚 [Stacked Charts](https://apexcharts.com/docs/chart-types/stacked-charts/)

## Advanced Features

```tsx
// Grouped and stacked combination
export function GroupedStackedBar() {
  const series = [
    {
      name: 'Q1 - Online',
      group: 'Q1',
      data: [44, 55, 41, 67]
    },
    {
      name: 'Q1 - Offline',
      group: 'Q1',
      data: [13, 23, 20, 8]
    },
    {
      name: 'Q2 - Online',
      group: 'Q2',
      data: [48, 50, 40, 65]
    },
    {
      name: 'Q2 - Offline',
      group: 'Q2',
      data: [15, 20, 25, 12]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '75%'
      }
    },
    xaxis: {
      categories: ['Product A', 'Product B', 'Product C', 'Product D']
    },
    fill: {
      opacity: 1
    }
  };

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
}
```

## Tips
- Use `borderRadius` for modern look
- Apply `distributed: true` for individual colors
- Enable `dataLabels` for value display
- Use patterns for print-friendly charts
- Implement responsive options for mobile
- Consider gradient fills for visual appeal
- Use `100% stacked` for proportion comparison
- Export options available in toolbar