# Pie Chart - Recharts

## Description
Pie charts are perfect for showing proportions and percentages of a whole. Best used when you have 2-7 categories and want to show relative sizes or market share.

## Working Example

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Qualified', value: 45, color: '#10b981' },
  { name: 'Not Qualified', value: 25, color: '#ef4444' },
  { name: 'Callback', value: 15, color: '#3b82f6' },
  { name: 'Meeting', value: 10, color: '#f59e0b' },
  { name: 'Not Interested', value: 5, color: '#8b5cf6' },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CallOutcomePie() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

## Key Props

| Prop | Description | Options |
|------|-------------|---------|
| `data` | Array of data objects | Array with `value` key |
| `dataKey` | Key for pie values | String |
| `cx` | Center x coordinate | Number or percentage |
| `cy` | Center y coordinate | Number or percentage |
| `innerRadius` | Inner radius for donut | Number (0 for pie) |
| `outerRadius` | Outer radius | Number |
| `startAngle` | Starting angle | Number (default: 0) |
| `endAngle` | Ending angle | Number (default: 360) |
| `label` | Show labels | Boolean, function, or element |
| `labelLine` | Show label lines | Boolean or object |

## Use Cases

- **Market Share**: Display relative market positions
- **Budget Allocation**: Show spending distribution
- **Survey Results**: Visualize response distributions
- **Portfolio Composition**: Display asset allocation
- **Call Outcomes**: Show distribution of results
- **Sales by Category**: Compare product categories

## Documentation Link
📚 [Official Recharts Pie Chart Documentation](https://recharts.org/en-US/api/PieChart)

## Tips
- Limit to 2-7 slices for clarity
- Use contrasting colors via `Cell` component
- Add `innerRadius` to create a donut chart
- Consider custom labels for better readability
- Sort data by value for better visual hierarchy