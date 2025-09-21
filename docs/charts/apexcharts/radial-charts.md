# Radial Charts (Radial Bar & Pie/Donut) - ApexCharts

## Description
ApexCharts radial charts include radial bars, pie charts, and donut charts with modern styling, gradients, and animations. Perfect for showing progress, KPIs, proportions, and circular data visualizations.

## Working Example

```tsx
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export function RadialProgressChart() {
  const series = [75, 60, 85]; // Percentages

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'radialBar'
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
          background: 'transparent',
          image: undefined
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 600,
            color: '#888',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '18px',
            fontWeight: 'bold',
            color: undefined,
            offsetY: 5,
            formatter: function(val) {
              return val + '%';
            }
          }
        },
        track: {
          background: '#f2f2f2',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#00E396', '#008FFB', '#FEB019'],
    labels: ['Sales Target', 'Customer Satisfaction', 'Team Performance'],
    legend: {
      show: true,
      floating: true,
      fontSize: '14px',
      position: 'left',
      offsetX: 50,
      offsetY: 10,
      labels: {
        useSeriesColors: true
      },
      formatter: function(seriesName, opts) {
        return seriesName + ": " + opts.w.globals.series[opts.seriesIndex] + '%';
      },
      itemMargin: {
        horizontal: 3
      }
    }
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="radialBar" height={350} />
    </div>
  );
}

// Semi-circle gauge
export function SemiCircleGauge() {
  const series = [76];

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: '97%',
          margin: 5,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 1,
            blur: 2
          }
        },
        dataLabels: {
          name: {
            show: false
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
            formatter: function(val) {
              return val + '%';
            }
          }
        },
        hollow: {
          size: '60%'
        }
      }
    },
    grid: {
      padding: {
        top: -10
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91]
      }
    },
    labels: ['Average Results']
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ReactApexChart options={options} series={series} type="radialBar" height={250} />
      <div style={{ marginTop: '-30px', fontSize: '16px', color: '#888' }}>
        Performance Score
      </div>
    </div>
  );
}

// Modern donut chart
export function ModernDonutChart() {
  const series = [44, 55, 41, 17, 15];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 380
    },
    labels: ['Direct Sales', 'Online Sales', 'Partner Sales', 'Retail', 'Other'],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: undefined,
              offsetY: -10,
              formatter: function(val) {
                return val;
              }
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: function(val) {
                return parseInt(val) + '%';
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total Sales',
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              formatter: function(w) {
                return '$' + w.globals.seriesTotals.reduce((a, b) => a + b, 0) + 'k';
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    colors: ['#00E396', '#008FFB', '#FEB019', '#FF4560', '#775DD0'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
      offsetY: 10
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return <ReactApexChart options={options} series={series} type="donut" height={380} />;
}

// Multiple radial bars (circular progress)
export function MultipleRadialBars() {
  const series = [85, 67, 50, 89];

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'radialBar'
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px'
          },
          value: {
            fontSize: '16px'
          },
          total: {
            show: true,
            label: 'Overall',
            formatter: function() {
              return '73%';
            }
          }
        },
        track: {
          strokeWidth: '100%',
          margin: 12
        }
      }
    },
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    colors: ['#FF4560', '#008FFB', '#00E396', '#FEB019'],
    stroke: {
      lineCap: 'round'
    }
  };

  return <ReactApexChart options={options} series={series} type="radialBar" height={350} />;
}
```

## Key Configuration

### Radial Bar Options
| Property | Description | Options |
|----------|-------------|---------|
| `startAngle` | Starting angle | -360 to 360 |
| `endAngle` | Ending angle | -360 to 360 |
| `hollow.size` | Inner circle size | Percentage string |
| `track.background` | Track color | Color string |
| `track.strokeWidth` | Track width | Percentage string |
| `dataLabels` | Value and label display | Name, value, total options |

### Pie/Donut Options
| Property | Description | Options |
|----------|-------------|---------|
| `donut.size` | Donut hole size | Percentage string |
| `donut.labels` | Center labels | Show name, value, total |
| `startAngle` | Rotation start | -360 to 360 |
| `endAngle` | Rotation end | -360 to 360 |
| `expandOnClick` | Expand slice on click | Boolean |
| `offsetX` | Horizontal offset | Number |
| `offsetY` | Vertical offset | Number |

## Use Cases

### Radial Bars
- **KPI Dashboards**: Progress indicators
- **Goal Tracking**: Target achievement
- **Performance Metrics**: Score displays
- **Loading States**: Progress indicators
- **Skill Levels**: Competency visualization

### Pie/Donut Charts
- **Market Share**: Segment distribution
- **Budget Allocation**: Spending breakdown
- **Sales Mix**: Product/channel distribution
- **Survey Results**: Response percentages
- **Portfolio Composition**: Asset allocation

## Documentation Links
📚 [ApexCharts Radial Bar](https://apexcharts.com/docs/chart-types/radialbar-gauge/)
📚 [ApexCharts Pie/Donut](https://apexcharts.com/docs/chart-types/pie-donut/)
📚 [Circular Gauge Examples](https://apexcharts.com/javascript-chart-demos/radialbar-charts/)

## Tips
- Use gradients for modern appearance
- Limit pie/donut to 5-7 slices
- Consider semi-circle for gauge displays
- Apply `stroke.lineCap: 'round'` for smooth edges
- Use `hollow.dropShadow` for depth
- Enable `donut.labels.total` for summary
- Implement responsive options for mobile
- Use animations for engaging displays