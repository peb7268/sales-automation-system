# Radar Chart - Chart.js

## Description
Radar charts (also called spider or web charts) display multivariate data on axes starting from the same point. Perfect for comparing multiple variables, showing strengths and weaknesses, and visualizing performance across different dimensions.

## Working Example

```tsx
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export function TeamPerformanceRadar() {
  const data = {
    labels: [
      'Communication',
      'Technical Skills',
      'Problem Solving',
      'Teamwork',
      'Leadership',
      'Time Management',
      'Creativity',
      'Adaptability'
    ],
    datasets: [
      {
        label: 'Team A',
        data: [85, 92, 78, 88, 75, 82, 70, 90],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Team B',
        data: [75, 88, 92, 78, 85, 77, 88, 82],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
        pointRadius: 4,
        pointHoverRadius: 6
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
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Team Performance Comparison',
        font: {
          size: 18,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.r}/100`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          callback: function(value: any) {
            return value + '%';
          }
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <Radar data={data} options={options} />
    </div>
  );
}

// Product feature comparison
export function ProductComparisonRadar() {
  const data = {
    labels: ['Price', 'Quality', 'Features', 'Support', 'Performance', 'Reliability'],
    datasets: [
      {
        label: 'Our Product',
        data: [70, 95, 88, 92, 90, 94],
        backgroundColor: 'rgba(75, 192, 192, 0.3)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 3,
        pointRadius: 5
      },
      {
        label: 'Competitor A',
        data: [85, 78, 92, 70, 85, 80],
        backgroundColor: 'rgba(255, 206, 86, 0.3)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 3,
        pointRadius: 5
      },
      {
        label: 'Competitor B',
        data: [90, 82, 75, 85, 78, 88],
        backgroundColor: 'rgba(153, 102, 255, 0.3)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 3,
        pointRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: 'Product Comparison Matrix'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}

// Skills assessment radar
export function SkillsAssessmentRadar() {
  const data = {
    labels: [
      'JavaScript',
      'React',
      'Node.js',
      'TypeScript',
      'GraphQL',
      'Docker',
      'AWS',
      'CI/CD'
    ],
    datasets: [
      {
        label: 'Current Level',
        data: [90, 85, 75, 80, 60, 70, 65, 75],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2
      },
      {
        label: 'Target Level',
        data: [95, 90, 85, 90, 80, 85, 80, 85],
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Skills Assessment & Goals'
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20
        },
        pointLabels: {
          font: {
            size: 14
          },
          callback: function(value: string, index: number) {
            // Add emoji indicators
            const skills = ['📜', '⚛️', '🟢', '🔷', '🔮', '🐳', '☁️', '🔄'];
            return skills[index] + ' ' + value;
          }
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `backgroundColor` | Fill color | Color with transparency |
| `borderColor` | Line color | Color string |
| `borderWidth` | Line thickness | Number in pixels |
| `borderDash` | Dashed line | Array [dash, gap] |
| `pointRadius` | Point size | Number in pixels |
| `pointStyle` | Point shape | `'circle'`, `'cross'`, `'rect'`, `'star'` |
| `fill` | Fill area | Boolean or string |
| `tension` | Line curve | 0 to 1 (0 for straight lines) |

### Scale Options (r scale)
| Property | Description | Options |
|----------|-------------|---------|
| `suggestedMin` | Minimum value | Number |
| `suggestedMax` | Maximum value | Number |
| `angleLines` | Radial lines | `{display, color, lineWidth}` |
| `grid` | Grid lines | `{color, circular, lineWidth}` |
| `pointLabels` | Axis labels | `{font, padding, callback}` |
| `ticks` | Scale ticks | `{stepSize, callback, display}` |

## Use Cases

- **Performance Reviews**: Multi-dimensional employee assessment
- **Product Comparison**: Feature-by-feature analysis
- **Skills Assessment**: Competency mapping
- **SWOT Analysis**: Strengths and weaknesses visualization
- **Market Analysis**: Multi-factor comparison
- **Risk Assessment**: Multiple risk dimensions
- **Quality Metrics**: Multi-attribute quality scores

## Documentation Links
📚 [Chart.js Radar Chart Documentation](https://www.chartjs.org/docs/latest/charts/radar.html)
📚 [React-ChartJS-2 Radar Example](https://react-chartjs-2.js.org/examples/radar-chart)
📚 [Radial Linear Scale](https://www.chartjs.org/docs/latest/axes/radial/linear.html)

## Advanced Features

```tsx
// Animated radar with dynamic data
export function DynamicRadar() {
  const [dataValues, setDataValues] = useState([65, 75, 70, 80, 60, 85]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDataValues(prev =>
        prev.map(val => Math.max(0, Math.min(100, val + (Math.random() - 0.5) * 10)))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ['Metric A', 'Metric B', 'Metric C', 'Metric D', 'Metric E', 'Metric F'],
    datasets: [
      {
        label: 'Live Performance',
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1000
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}
```

## Tips
- Keep 5-10 variables for optimal readability
- Use transparency in fills for overlapping datasets
- Apply consistent scale ranges for fair comparison
- Use `borderDash` for target or projected values
- Consider circular grid for certain use cases
- Add icons/emojis to point labels for clarity
- Use different point styles to distinguish datasets
- Ensure color contrast for accessibility