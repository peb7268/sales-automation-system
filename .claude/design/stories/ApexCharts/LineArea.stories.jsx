import React from 'react';
import ReactApexChart from 'react-apexcharts';

export default {
  title: 'ApexCharts/Line & Area',
  component: ReactApexChart,
  parameters: {
    docs: {
      description: {
        component: 'Modern line and area charts with gradients, animations, and zoom capabilities.'
      }
    }
  }
};

export const LineChart = () => {
  const options = {
    series: [{
      name: 'Revenue',
      data: [31, 40, 28, 51, 42, 82, 56]
    }, {
      name: 'Profit',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],
    chart: {
      height: 350,
      type: 'line',
      zoom: { enabled: true }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    title: { text: 'Revenue & Profit Trends', align: 'left' },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yaxis: { title: { text: 'Value ($k)' } },
    colors: ['#008FFB', '#00E396']
  };

  return (
    <ReactApexChart options={options} series={options.series} type="line" height={350} />
  );
};

export const AreaChart = () => {
  const options = {
    series: [{
      name: 'Sales',
      data: [44, 55, 31, 47, 31, 43, 26, 41, 31, 47, 33, 43]
    }, {
      name: 'Revenue',
      data: [55, 69, 45, 61, 43, 54, 37, 52, 44, 61, 43, 56]
    }],
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: true }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    title: { text: 'Monthly Performance', align: 'left' },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    colors: ['#546E7A', '#26A69A']
  };

  return (
    <ReactApexChart options={options} series={options.series} type="area" height={350} />
  );
};

export const SplineArea = () => {
  const generateDayWiseTimeSeries = (baseval, count, yrange) => {
    let i = 0;
    const series = [];
    while (i < count) {
      const x = baseval;
      const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      series.push([x, y]);
      baseval += 86400000;
      i++;
    }
    return series;
  };

  const options = {
    series: [{
      name: 'Network',
      data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
        min: 10,
        max: 60
      })
    }],
    chart: {
      height: 350,
      type: 'area',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 2000
        }
      },
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    title: { text: 'Dynamic Data Stream', align: 'left' },
    markers: { size: 0 },
    xaxis: { type: 'datetime', range: 2678400000 },
    yaxis: { max: 100 },
    legend: { show: false }
  };

  return (
    <ReactApexChart options={options} series={options.series} type="area" height={350} />
  );
};

LineChart.storyName = 'Line Chart';
AreaChart.storyName = 'Area Chart with Gradient';
SplineArea.storyName = 'Spline Area Chart';