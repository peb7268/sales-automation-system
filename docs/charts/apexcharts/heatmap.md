# Heatmap Chart - ApexCharts

## Description
Heatmap charts visualize data using color intensity to represent values in a matrix format. Perfect for showing correlations, patterns across two dimensions, time-based activity, and density distributions.

## Working Example

```tsx
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export function SalesHeatmap() {
  // Generate series data for days of week vs hours
  const generateData = (count: number, yrange: { min: number, max: number }) => {
    const series = [];
    for (let i = 0; i < count; i++) {
      series.push({
        x: `W${i + 1}`,
        y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
      });
    }
    return series;
  };

  const series = [
    { name: 'Mon', data: generateData(12, { min: 0, max: 90 }) },
    { name: 'Tue', data: generateData(12, { min: 0, max: 90 }) },
    { name: 'Wed', data: generateData(12, { min: 0, max: 90 }) },
    { name: 'Thu', data: generateData(12, { min: 0, max: 90 }) },
    { name: 'Fri', data: generateData(12, { min: 0, max: 90 }) },
    { name: 'Sat', data: generateData(12, { min: 0, max: 90 }) },
    { name: 'Sun', data: generateData(12, { min: 0, max: 90 }) }
  ];

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'heatmap',
      toolbar: {
        show: true
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ["#008FFB"],
    title: {
      text: 'Sales Activity Heatmap',
      style: {
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    xaxis: {
      title: {
        text: 'Week'
      }
    },
    yaxis: {
      title: {
        text: 'Day of Week'
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: 0, to: 30, name: 'Low', color: '#00A100' },
            { from: 31, to: 60, name: 'Medium', color: '#FFC000' },
            { from: 61, to: 90, name: 'High', color: '#FF0000' }
          ]
        }
      }
    }
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="heatmap" height={350} />
    </div>
  );
}

// Color gradient heatmap
export function GradientHeatmap() {
  const series = [
    {
      name: 'Q1',
      data: [
        { x: 'Product A', y: 54 },
        { x: 'Product B', y: 66 },
        { x: 'Product C', y: 81 },
        { x: 'Product D', y: 45 },
        { x: 'Product E', y: 32 }
      ]
    },
    {
      name: 'Q2',
      data: [
        { x: 'Product A', y: 43 },
        { x: 'Product B', y: 91 },
        { x: 'Product C', y: 75 },
        { x: 'Product D', y: 68 },
        { x: 'Product E', y: 55 }
      ]
    },
    {
      name: 'Q3',
      data: [
        { x: 'Product A', y: 78 },
        { x: 'Product B', y: 57 },
        { x: 'Product C', y: 65 },
        { x: 'Product D', y: 82 },
        { x: 'Product E', y: 71 }
      ]
    },
    {
      name: 'Q4',
      data: [
        { x: 'Product A', y: 89 },
        { x: 'Product B', y: 74 },
        { x: 'Product C', y: 88 },
        { x: 'Product D', y: 95 },
        { x: 'Product E', y: 86 }
      ]
    }
  ];

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'heatmap'
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          inverse: false,
          min: 0,
          max: 100
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff']
      }
    },
    stroke: {
      width: 1
    },
    title: {
      text: 'Quarterly Product Performance'
    },
    xaxis: {
      type: 'category',
      title: {
        text: 'Products'
      }
    },
    yaxis: {
      title: {
        text: 'Quarters'
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value + '%';
        }
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="heatmap" height={350} />;
}

// Time-based activity heatmap (GitHub style)
export function ActivityHeatmap() {
  // Generate year of daily activity data
  const generateYearData = () => {
    const series = [];
    const startDate = new Date('2024-01-01');

    for (let week = 0; week < 52; week++) {
      const weekData = {
        name: `Week ${week + 1}`,
        data: []
      };

      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);

        weekData.data.push({
          x: currentDate.toISOString().split('T')[0],
          y: Math.floor(Math.random() * 100)
        });
      }

      series.push(weekData);
    }

    return series;
  };

  const series = generateYearData();

  const options: ApexOptions = {
    chart: {
      height: 200,
      type: 'heatmap',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 20, color: '#E3F2FD' },
            { from: 21, to: 40, color: '#90CAF9' },
            { from: 41, to: 60, color: '#42A5F5' },
            { from: 61, to: 80, color: '#1E88E5' },
            { from: 81, to: 100, color: '#0D47A1' }
          ]
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    title: {
      text: 'Activity Overview - 2024'
    },
    tooltip: {
      custom: function({ dataPointIndex, seriesIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return `
          <div style="padding: 10px;">
            <strong>${data.x}</strong><br/>
            Activity: ${data.y}
          </div>
        `;
      }
    }
  };

  return <ReactApexChart options={options} series={series.slice(0, 12)} type="heatmap" height={200} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `plotOptions.heatmap.shadeIntensity` | Color intensity | 0 to 1 |
| `plotOptions.heatmap.radius` | Cell border radius | Number |
| `plotOptions.heatmap.useFillColorAsStroke` | Use fill as stroke | Boolean |
| `plotOptions.heatmap.colorScale` | Color mapping | Ranges array or min/max |
| `dataLabels.enabled` | Show values in cells | Boolean |
| `stroke.width` | Cell border width | Number |
| `colors` | Base colors | Array of color strings |

### Color Scale Options
| Property | Description |
|----------|-------------|
| `ranges` | Array of `{from, to, name, color}` |
| `min` | Minimum value for gradient |
| `max` | Maximum value for gradient |
| `inverse` | Reverse color scale |

## Use Cases

- **Activity Tracking**: User activity patterns
- **Performance Matrix**: Team/product performance grid
- **Time Analysis**: Hours vs days, days vs weeks
- **Correlation Matrix**: Variable relationships
- **Geographic Data**: Regional performance
- **Risk Assessment**: Risk heat maps
- **Resource Utilization**: Capacity planning

## Documentation Links
📚 [ApexCharts Heatmap](https://apexcharts.com/docs/chart-types/heatmap/)
📚 [Heatmap Examples](https://apexcharts.com/javascript-chart-demos/heatmap-charts/)
📚 [Color Scales](https://apexcharts.com/docs/colors/)

## Advanced Features

```tsx
// Correlation matrix heatmap
export function CorrelationMatrix() {
  const variables = ['Sales', 'Marketing', 'Support', 'Development', 'Operations'];

  const series = variables.map((variable, i) => ({
    name: variable,
    data: variables.map((_, j) => ({
      x: variables[j],
      y: i === j ? 100 : Math.floor(Math.random() * 100)
    }))
  }));

  const options: ApexOptions = {
    chart: {
      type: 'heatmap',
      height: 400
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          min: -100,
          max: 100
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val + '%';
      }
    },
    title: {
      text: 'Department Correlation Matrix'
    },
    colors: ['#FF4560'],
    stroke: {
      colors: ['#fff'],
      width: 2
    }
  };

  return <ReactApexChart options={options} series={series} type="heatmap" height={400} />;
}
```

## Tips
- Use contrasting colors for better readability
- Limit categories for clarity
- Enable `dataLabels` for exact values
- Use `tooltip.custom` for detailed information
- Consider responsive design for mobile
- Use `stroke` to separate cells clearly
- Apply `borderRadius` for modern look
- Implement click handlers for interactivity