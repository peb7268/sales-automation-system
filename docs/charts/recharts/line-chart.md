# Line Chart - Recharts

## Description
Line charts are ideal for showing trends over time, comparing multiple data series, and visualizing continuous data. Perfect for displaying metrics like sales performance, user growth, or any time-series data.

## Working Example

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 2000, profit: 9800 },
  { name: 'Apr', sales: 2780, profit: 3908 },
  { name: 'May', sales: 1890, profit: 4800 },
  { name: 'Jun', sales: 2390, profit: 3800 },
];

export function SalesLineChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#82ca9d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## Key Props

| Prop | Description | Options |
|------|-------------|---------|
| `type` | Line interpolation type | `"monotone"`, `"linear"`, `"step"`, `"basis"` |
| `dataKey` | Key from data object to plot | Any key from your data |
| `stroke` | Line color | Any valid CSS color |
| `strokeWidth` | Line thickness | Number (default: 1) |
| `dot` | Show/customize dots | Boolean or object |
| `activeDot` | Active dot on hover | Boolean or object |
| `strokeDasharray` | Dashed line pattern | String (e.g., "5 5") |

## Use Cases

- **Time Series Analysis**: Track metrics over days, months, or years
- **Trend Visualization**: Show growth or decline patterns
- **Multi-Series Comparison**: Compare multiple metrics on the same chart
- **Performance Monitoring**: Display KPIs and performance metrics
- **Financial Data**: Stock prices, revenue trends, cost analysis

## Documentation Link
📚 [Official Recharts Line Chart Documentation](https://recharts.org/en-US/api/LineChart)

## Tips
- Use `ResponsiveContainer` for responsive charts
- Add `activeDot` for better interactivity
- Consider `strokeDasharray` for secondary/projected data
- Use `type="monotone"` for smooth curves