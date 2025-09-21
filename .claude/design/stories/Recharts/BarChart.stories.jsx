import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default {
  title: 'Recharts/Bar Chart',
  component: BarChart,
  parameters: {
    docs: {
      description: {
        component: 'Compare categories using vertical or horizontal bars. Supports stacking, grouping, and custom colors.'
      }
    }
  }
};

const productData = [
  { product: 'Product A', sales: 4500, target: 5000 },
  { product: 'Product B', sales: 3200, target: 3000 },
  { product: 'Product C', sales: 5100, target: 4500 },
  { product: 'Product D', sales: 2800, target: 3500 },
  { product: 'Product E', sales: 3900, target: 3800 },
  { product: 'Product F', sales: 4700, target: 4000 }
];

const monthlyData = [
  { month: 'Jan', desktop: 186, mobile: 80, tablet: 40 },
  { month: 'Feb', desktop: 205, mobile: 90, tablet: 45 },
  { month: 'Mar', desktop: 237, mobile: 105, tablet: 55 },
  { month: 'Apr', desktop: 273, mobile: 110, tablet: 60 },
  { month: 'May', desktop: 209, mobile: 95, tablet: 48 },
  { month: 'Jun', desktop: 214, mobile: 100, tablet: 50 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const SimpleBarChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="product" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="sales" fill="#8884d8" />
      <Bar dataKey="target" fill="#82ca9d" />
    </BarChart>
  </ResponsiveContainer>
);

export const ColorfulBarChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="product" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="sales">
        {productData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        <LabelList dataKey="sales" position="top" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const StackedBarChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="desktop" stackId="a" fill="#8884d8" />
      <Bar dataKey="mobile" stackId="a" fill="#82ca9d" />
      <Bar dataKey="tablet" stackId="a" fill="#ffc658" />
    </BarChart>
  </ResponsiveContainer>
);

SimpleBarChart.storyName = 'Simple Bar Chart';
ColorfulBarChart.storyName = 'Colorful Bar Chart with Labels';
StackedBarChart.storyName = 'Stacked Bar Chart';