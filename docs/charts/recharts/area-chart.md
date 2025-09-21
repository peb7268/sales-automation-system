# Area Chart - Recharts

## Description
Area charts are ideal for showing cumulative totals over time, emphasizing the magnitude of change, and comparing multiple data series with stacked areas. Perfect for showing volume and trends simultaneously.

## Working Example

```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4000, costs: 2400, profit: 1600 },
  { month: 'Feb', revenue: 3000, costs: 1398, profit: 1602 },
  { month: 'Mar', revenue: 2000, costs: 800, profit: 1200 },
  { month: 'Apr', revenue: 2780, costs: 1200, profit: 1580 },
  { month: 'May', revenue: 1890, costs: 900, profit: 990 },
  { month: 'Jun', revenue: 2390, costs: 1100, profit: 1290 },
];

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke="#82ca9d"
          fillOpacity={1}
          fill="url(#colorProfit)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

## Key Props

| Prop | Description | Options |
|------|-------------|---------|
| `type` | Line interpolation type | `"monotone"`, `"linear"`, `"step"` |
| `dataKey` | Data key to plot | String |
| `stroke` | Line color | Any CSS color |
| `fill` | Area fill color | Color or gradient URL |
| `fillOpacity` | Area opacity | 0 to 1 |
| `stackId` | Stack areas | String (same ID stacks) |
| `baseValue` | Base value for area | Number or `"dataMin"`, `"dataMax"` |
| `dot` | Show data points | Boolean or object |

## Use Cases

- **Revenue Tracking**: Show revenue growth over time
- **Cumulative Metrics**: Display running totals
- **Stacked Comparisons**: Compare parts of a whole over time
- **Volume Analysis**: Trading volume, traffic volume
- **Resource Usage**: CPU, memory, bandwidth usage
- **Forecast Ranges**: Show confidence intervals

## Documentation Link
📚 [Official Recharts Area Chart Documentation](https://recharts.org/en-US/api/AreaChart)

## Tips
- Use gradients with `defs` for visual depth
- Stack areas with `stackId` for cumulative views
- Set `fillOpacity` < 1 for overlapping areas
- Combine with lines for hybrid visualizations
- Use `baseValue` to start from non-zero values