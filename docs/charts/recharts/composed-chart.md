# Composed Chart - Recharts

## Description
Composed charts combine multiple chart types (line, bar, area) in a single visualization. Perfect for showing relationships between different metrics with different scales or visualization needs.

## Working Example

```tsx
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Jan', calls: 120, conversion: 23, revenue: 45000 },
  { month: 'Feb', calls: 98, conversion: 28, revenue: 52000 },
  { month: 'Mar', calls: 156, conversion: 32, revenue: 61000 },
  { month: 'Apr', calls: 134, conversion: 27, revenue: 49000 },
  { month: 'May', calls: 178, conversion: 35, revenue: 68000 },
  { month: 'Jun', calls: 145, conversion: 30, revenue: 55000 },
];

export function SalesComposedChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          fill="url(#colorRevenue)"
          stroke="#82ca9d"
          name="Revenue ($)"
        />
        <Bar
          yAxisId="left"
          dataKey="calls"
          fill="#8884d8"
          name="Calls Made"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="conversion"
          stroke="#ff7300"
          strokeWidth={3}
          name="Conversion Rate (%)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

## Key Props

| Prop | Description | Options |
|------|-------------|---------|
| `data` | Data array | Array of objects |
| `margin` | Chart margins | Object with top, right, bottom, left |
| `syncId` | Sync with other charts | String |
| `layout` | Orientation | `"horizontal"`, `"vertical"` |
| `barGap` | Gap between bars | Number |
| `barCategoryGap` | Gap between categories | Number or percentage |

### Child Component Props
- **Bar**: `yAxisId`, `dataKey`, `fill`, `stackId`
- **Line**: `yAxisId`, `type`, `dataKey`, `stroke`
- **Area**: `yAxisId`, `type`, `dataKey`, `fill`, `stroke`

## Use Cases

- **Multi-Metric Analysis**: Combine volume (bars) with rates (lines)
- **Dual-Axis Visualizations**: Different scales on left/right axes
- **Trend + Distribution**: Show trends with underlying distributions
- **Financial Dashboards**: Revenue (area), costs (bars), margin (line)
- **Performance Metrics**: Combine absolute and percentage values
- **Correlation Analysis**: Show relationships between metrics

## Documentation Link
📚 [Official Recharts Composed Chart Documentation](https://recharts.org/en-US/api/ComposedChart)

## Tips
- Use `yAxisId` to assign components to different axes
- Combine up to 3 chart types for clarity
- Use gradients in areas for visual hierarchy
- Consider different colors for each metric type
- Add `syncId` to sync multiple composed charts