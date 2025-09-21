# Radial Bar Chart - Recharts

## Description
Radial bar charts display data in a circular format, perfect for showing progress, KPIs, or comparing metrics in a compact, visually appealing way. Great for dashboards and space-efficient visualizations.

## Working Example

```tsx
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Calls Made', value: 85, fill: '#8884d8' },
  { name: 'Qualified', value: 67, fill: '#83a6ed' },
  { name: 'Meetings', value: 45, fill: '#8dd1e1' },
  { name: 'Closed', value: 23, fill: '#82ca9d' },
];

const style = {
  top: '50%',
  right: 0,
  transform: 'translate(0, -50%)',
  lineHeight: '24px',
};

export function PerformanceRadialBar() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="10%"
        outerRadius="90%"
        barSize={10}
        data={data}
      >
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="value"
        />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          wrapperStyle={style}
        />
        <Tooltip />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
```

## Key Props

| Prop | Description | Options |
|------|-------------|---------|
| `cx` | Center x coordinate | Number or percentage |
| `cy` | Center y coordinate | Number or percentage |
| `innerRadius` | Inner radius | Number or percentage |
| `outerRadius` | Outer radius | Number or percentage |
| `barSize` | Bar thickness | Number |
| `startAngle` | Starting angle | Number (default: 90) |
| `endAngle` | Ending angle | Number (default: -270) |
| `minAngle` | Minimum angle per bar | Number |
| `background` | Show background | Boolean or object |
| `clockWise` | Direction of bars | Boolean |

## Use Cases

- **KPI Dashboards**: Display key performance indicators
- **Progress Tracking**: Show completion percentages
- **Goal Achievement**: Visualize targets vs actual
- **Multi-Metric Comparison**: Compare related metrics
- **Space-Efficient Display**: Compact metric visualization
- **Activity Rings**: Fitness or activity tracking

## Documentation Link
📚 [Official Recharts Radial Bar Chart Documentation](https://recharts.org/en-US/api/RadialBarChart)

## Tips
- Use `background` prop for visual context
- Adjust `minAngle` to prevent very thin bars
- Consider `clockWise={false}` for counter-clockwise display
- Combine with percentage labels for clarity
- Use consistent color schemes for related metrics