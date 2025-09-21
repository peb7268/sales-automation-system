import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default {
  title: 'Recharts/Line Chart',
  component: LineChart,
  parameters: {
    docs: {
      description: {
        component: 'Display trends over time with smooth or segmented lines. Supports multiple series, animations, and gradients.'
      }
    }
  }
};

const salesData = [
  { month: 'Jan', sales: 4000, profit: 2400, customers: 2400 },
  { month: 'Feb', sales: 3000, profit: 1398, customers: 2210 },
  { month: 'Mar', sales: 2000, profit: 9800, customers: 2290 },
  { month: 'Apr', sales: 2780, profit: 3908, customers: 2000 },
  { month: 'May', sales: 1890, profit: 4800, customers: 2181 },
  { month: 'Jun', sales: 2390, profit: 3800, customers: 2500 },
  { month: 'Jul', sales: 3490, profit: 4300, customers: 2100 },
  { month: 'Aug', sales: 4000, profit: 2400, customers: 2400 },
  { month: 'Sep', sales: 3000, profit: 1398, customers: 2210 },
  { month: 'Oct', sales: 2000, profit: 9800, customers: 2290 },
  { month: 'Nov', sales: 2780, profit: 3908, customers: 2000 },
  { month: 'Dec', sales: 3890, profit: 4800, customers: 2181 }
];

export const SimpleLineChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
      <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export const MultiLineChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
      <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} />
      <Line type="monotone" dataKey="customers" stroke="#ffc658" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export const AreaChartWithGradient = () => (
  <ResponsiveContainer width="100%" height={400}>
    <AreaChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <defs>
        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
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
      <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
      <Area type="monotone" dataKey="profit" stroke="#82ca9d" fillOpacity={1} fill="url(#colorProfit)" />
    </AreaChart>
  </ResponsiveContainer>
);

SimpleLineChart.storyName = 'Simple Line Chart';
MultiLineChart.storyName = 'Multi-Series Line Chart';
AreaChartWithGradient.storyName = 'Area Chart with Gradient';