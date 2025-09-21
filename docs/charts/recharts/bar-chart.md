# Bar Chart - Recharts

## Description
Bar charts are excellent for comparing discrete categories, showing rankings, or displaying distribution of data across different groups. Ideal for categorical comparisons and part-to-whole relationships.

## Working Example

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { stage: 'Prospects', value: 150, color: '#8884d8' },
  { stage: 'Qualified', value: 89, color: '#83a6ed' },
  { stage: 'Contacted', value: 67, color: '#8dd1e1' },
  { stage: 'Meeting', value: 45, color: '#82ca9d' },
  { stage: 'Closed', value: 23, color: '#a4de6c' },
];

export function SalesFunnelBar() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stage" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Key Props

| Prop | Description | Options |
|------|-------------|---------|
| `dataKey` | Key from data to display | Any key from your data |
| `fill` | Bar fill color | Any valid CSS color |
| `barSize` | Fixed bar width | Number |
| `maxBarSize` | Maximum bar width | Number |
| `stackId` | Stack bars with same ID | String |
| `layout` | Chart orientation | `"horizontal"`, `"vertical"` |
| `radius` | Rounded corners | Number or array |

## Use Cases

- **Sales Funnel**: Visualize conversion stages
- **Category Comparison**: Compare performance across categories
- **Rankings**: Show top performers or products
- **Distribution**: Display frequency or count data
- **Progress Tracking**: Show completion rates or quotas
- **Budget Analysis**: Compare actual vs planned spending

## Documentation Link
📚 [Official Recharts Bar Chart Documentation](https://recharts.org/en-US/api/BarChart)

## Tips
- Use `Cell` component to apply different colors to each bar
- Stack bars using `stackId` for grouped comparisons
- Add `radius={[10, 10, 0, 0]}` for rounded top corners
- Consider horizontal layout for long category names