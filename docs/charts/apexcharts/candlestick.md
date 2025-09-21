# Candlestick & OHLC Charts - ApexCharts

## Description
Candlestick and OHLC (Open-High-Low-Close) charts are primarily used for financial data visualization, showing price movements over time. Also useful for any data with range and direction information.

## Working Example

```tsx
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export function CandlestickChart() {
  // Generate sample OHLC data
  const generateData = () => {
    const data = [];
    let basePrice = 100;
    const startDate = new Date('2024-01-01').getTime();

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const open = basePrice + Math.random() * 10 - 5;
      const close = open + Math.random() * 10 - 5;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;

      data.push({
        x: date,
        y: [open.toFixed(2), high.toFixed(2), low.toFixed(2), close.toFixed(2)]
      });

      basePrice = close;
    }

    return data;
  };

  const series = [{
    name: 'Price',
    data: generateData()
  }];

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      toolbar: {
        autoSelected: 'pan',
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    title: {
      text: 'Price Movement Analysis',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00E396',
          downward: '#FF4560'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yaxis: {
      title: {
        text: 'Price ($)'
      },
      tooltip: {
        enabled: true
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 5
    },
    tooltip: {
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
        const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
        const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
        const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];

        return `
          <div style="padding: 10px; background: #fff; border: 1px solid #ddd;">
            <div><b>Open:</b> $${o}</div>
            <div><b>High:</b> $${h}</div>
            <div><b>Low:</b> $${l}</div>
            <div><b>Close:</b> $${c}</div>
          </div>
        `;
      }
    }
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="candlestick" height={350} />
    </div>
  );
}

// Sales performance candlestick
export function SalesPerformanceCandlestick() {
  const series = [{
    name: 'Sales Metrics',
    data: [
      { x: 'Q1 2024', y: [45, 62, 38, 55] }, // [open, high, low, close]
      { x: 'Q2 2024', y: [55, 75, 50, 68] },
      { x: 'Q3 2024', y: [68, 82, 65, 74] },
      { x: 'Q4 2024', y: [74, 95, 70, 88] }
    ]
  }];

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 350
    },
    title: {
      text: 'Quarterly Sales Performance Range'
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00B746',
          downward: '#EF403C'
        }
      }
    },
    xaxis: {
      type: 'category'
    },
    yaxis: {
      title: {
        text: 'Sales ($k)'
      },
      labels: {
        formatter: function(value) {
          return '$' + value + 'k';
        }
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="candlestick" height={350} />;
}

// Mixed chart with volume
export function CandlestickWithVolume() {
  const candleData = [];
  const volumeData = [];
  const startDate = new Date('2024-01-01').getTime();
  let basePrice = 100;

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
    const open = basePrice + Math.random() * 10 - 5;
    const close = open + Math.random() * 10 - 5;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;

    candleData.push({
      x: date,
      y: [open.toFixed(2), high.toFixed(2), low.toFixed(2), close.toFixed(2)]
    });

    volumeData.push({
      x: date,
      y: Math.floor(Math.random() * 1000000) + 500000,
      color: close > open ? '#00E396' : '#FF4560'
    });

    basePrice = close;
  }

  const series = [
    {
      name: 'Price',
      type: 'candlestick',
      data: candleData
    },
    {
      name: 'Volume',
      type: 'column',
      data: volumeData
    }
  ];

  const options: ApexOptions = {
    chart: {
      height: 450,
      type: 'line',
      toolbar: {
        autoSelected: 'pan'
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00E396',
          downward: '#FF4560'
        }
      },
      bar: {
        columnWidth: '80%'
      }
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: [
      {
        seriesName: 'Price',
        title: {
          text: 'Price ($)'
        },
        tooltip: {
          enabled: true
        }
      },
      {
        seriesName: 'Volume',
        opposite: true,
        title: {
          text: 'Volume'
        },
        labels: {
          formatter: function(value) {
            return (value / 1000000).toFixed(1) + 'M';
          }
        }
      }
    ]
  };

  return <ReactApexChart options={options} series={series} type="line" height={450} />;
}

// Box plot (similar to candlestick for statistical data)
export function BoxPlotChart() {
  const series = [
    {
      name: 'Department A',
      type: 'boxPlot',
      data: [
        { x: 'Jan', y: [54, 66, 69, 75, 88] },
        { x: 'Feb', y: [43, 65, 69, 76, 81] },
        { x: 'Mar', y: [31, 39, 45, 51, 59] },
        { x: 'Apr', y: [39, 46, 55, 65, 71] }
      ]
    },
    {
      name: 'Department B',
      type: 'boxPlot',
      data: [
        { x: 'Jan', y: [45, 58, 62, 70, 82] },
        { x: 'Feb', y: [52, 67, 71, 78, 85] },
        { x: 'Mar', y: [38, 45, 52, 58, 67] },
        { x: 'Apr', y: [42, 52, 61, 68, 75] }
      ]
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'boxPlot',
      height: 350
    },
    title: {
      text: 'Performance Distribution by Department'
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: '#00E396',
          lower: '#008FFB'
        }
      }
    },
    xaxis: {
      type: 'category'
    },
    yaxis: {
      title: {
        text: 'Performance Score'
      }
    }
  };

  return <ReactApexChart options={options} series={series} type="boxPlot" height={350} />;
}
```

## Key Configuration

### Candlestick Options
| Property | Description | Options |
|----------|-------------|---------|
| `colors.upward` | Color for rising candles | Color string |
| `colors.downward` | Color for falling candles | Color string |
| `wick.useFillColor` | Wick uses candle color | Boolean |

### Data Format
| Property | Description |
|----------|-------------|
| `x` | Time/category |
| `y` | Array: `[open, high, low, close]` |

### Box Plot Format
| Property | Description |
|----------|-------------|
| `y` | Array: `[min, q1, median, q3, max]` |

## Use Cases

### Financial Data
- **Stock Prices**: Daily OHLC data
- **Forex Trading**: Currency pair movements
- **Cryptocurrency**: Price volatility
- **Commodity Prices**: Market trends

### Business Metrics
- **Sales Ranges**: Min/max with opening/closing
- **Performance Metrics**: Range and direction
- **Project Estimates**: Best/worst case scenarios
- **Statistical Analysis**: Quartile distributions

## Documentation Links
📚 [ApexCharts Candlestick](https://apexcharts.com/docs/chart-types/candlestick/)
📚 [ApexCharts Box Plot](https://apexcharts.com/docs/chart-types/boxplot/)
📚 [Financial Chart Examples](https://apexcharts.com/javascript-chart-demos/candlestick-charts/)

## Tips
- Enable zoom for detailed analysis
- Use volume bars for additional context
- Apply different colors for up/down movement
- Add moving averages as overlays
- Consider tooltip customization for clarity
- Use datetime x-axis for time series
- Implement pan/zoom for large datasets
- Export functionality for reports