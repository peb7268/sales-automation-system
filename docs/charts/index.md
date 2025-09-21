# Chart Library Design Catalog

A comprehensive collection of chart visualizations across 6 major JavaScript charting libraries. Each chart type includes working examples, documentation, and implementation details.

## 📊 Chart Libraries Overview

### [Recharts](./recharts/)
React-specific charting library built on D3.js with composable components and declarative API.

### [D3.js](./d3/)
Low-level, powerful data visualization library for creating custom, interactive visualizations.

### [Plotly.js](./plotly/)
Scientific computing library with 3D capabilities, geographic maps, and statistical charts.

### [Three.js](./threejs/)
3D graphics library for creating animated, interactive 3D visualizations in the browser.

### [Chart.js](./chartjs/)
Simple, flexible JavaScript charting library with responsive, animated charts using Canvas.

### [ApexCharts](./apexcharts/)
Modern charting library with extensive customization options and built-in interactivity.

---

## 📈 Recharts

### Line Chart
**Description**: Display trends over time with smooth or segmented lines. Supports multiple series, animations, and gradients.
**Use Cases**: Time series data, trend analysis, performance metrics
**Documentation**: [line-chart.md](./recharts/line-chart.md)
**Live Example**: [line-chart.html](./recharts/line-chart.html)

### Bar Chart
**Description**: Compare categories using vertical or horizontal bars. Supports stacking, grouping, and custom colors.
**Use Cases**: Category comparison, rankings, distribution analysis
**Documentation**: [bar-chart.md](./recharts/bar-chart.md)
**Live Example**: [bar-chart.html](./recharts/bar-chart.html)

### Pie Chart
**Description**: Show proportions and percentages in circular format. Includes donut variants and interactive legends.
**Use Cases**: Market share, budget allocation, composition analysis
**Documentation**: [pie-chart.md](./recharts/pie-chart.md)
**Live Example**: [pie-chart.html](./recharts/pie-chart.html)

### Area Chart
**Description**: Emphasize volume and cumulative totals with filled areas under lines. Supports gradients and stacking.
**Use Cases**: Volume trends, cumulative metrics, range visualization
**Documentation**: [area-chart.md](./recharts/area-chart.md)
**Live Example**: [area-chart.html](./recharts/area-chart.html)

### Radial Bar Chart
**Description**: Display metrics in circular/radial format including radar charts for multi-dimensional data.
**Use Cases**: Skills assessment, performance scoring, KPI dashboards
**Documentation**: [radial-bar-chart.md](./recharts/radial-bar-chart.md)
**Live Example**: [radial-bar-chart.html](./recharts/radial-bar-chart.html)

### Composed Chart
**Description**: Combine multiple chart types (line, bar, area) in a single visualization with shared axes.
**Use Cases**: Complex comparisons, multi-metric analysis, correlation display
**Documentation**: [composed-chart.md](./recharts/composed-chart.md)
**Live Example**: [composed-chart.html](./recharts/composed-chart.html)

---

## 🎨 D3.js

### Sankey Diagram
**Description**: Visualize flow and relationships between nodes with weighted paths showing quantity or volume.
**Use Cases**: Sales pipelines, energy flow, process workflows, budget allocation
**Documentation**: [sankey-diagram.md](./d3/sankey-diagram.md)
**Live Example**: [sankey-diagram.html](./d3/sankey-diagram.html)

### Force-Directed Graph
**Description**: Interactive network visualization with physics simulation showing relationships and connections.
**Use Cases**: Network analysis, social graphs, system architecture, organizational charts
**Documentation**: [force-directed-graph.md](./d3/force-directed-graph.md)
**Live Example**: [force-directed-graph.html](./d3/force-directed-graph.html)

### Radial Tree
**Description**: Hierarchical data displayed in circular/radial layout with branches extending from center.
**Use Cases**: Organizational structure, file systems, taxonomy, decision trees
**Documentation**: [radial-tree.md](./d3/radial-tree.md)
**Live Example**: [radial-tree.html](./d3/radial-tree.html)

### Hierarchy Charts
**Description**: Multiple hierarchical visualizations including treemaps, sunbursts, and partition layouts.
**Use Cases**: Budget breakdown, file size visualization, category hierarchies
**Documentation**: [hierarchy-charts.md](./d3/hierarchy-charts.md)
**Live Example**: [hierarchy-charts.html](./d3/hierarchy-charts.html)

### Custom Visualizations
**Description**: Unique, tailored visualizations using D3's low-level API for specific data needs.
**Use Cases**: Specialized metrics, creative data art, unique business requirements
**Documentation**: [custom-visualizations.md](./d3/custom-visualizations.md)
**Live Example**: [custom-visualizations.html](./d3/custom-visualizations.html)

---

## 🌍 Plotly.js

### Geographic Heatmap
**Description**: Display data on world or regional maps with color-coded regions and choropleth mapping.
**Use Cases**: Sales by region, demographic data, market presence, geographic metrics
**Documentation**: [geographic-heatmap.md](./plotly/geographic-heatmap.md)
**Live Example**: [geographic-heatmap.html](./plotly/geographic-heatmap.html)

### 3D Surface Plot
**Description**: Three-dimensional surface visualization for continuous data across two variables.
**Use Cases**: Scientific data, optimization landscapes, multivariate analysis
**Documentation**: [3d-surface.md](./plotly/3d-surface.md)
**Live Example**: [3d-surface.html](./plotly/3d-surface.html)

### Bubble Chart
**Description**: Scatter plot with third dimension shown as bubble size, supporting multiple series.
**Use Cases**: Multi-dimensional comparisons, risk-reward analysis, portfolio visualization
**Documentation**: [bubble-chart.md](./plotly/bubble-chart.md)
**Live Example**: [bubble-chart.html](./plotly/bubble-chart.html)

### Waterfall Chart
**Description**: Show cumulative effect of sequential positive/negative values on an initial value.
**Use Cases**: Profit/loss analysis, budget changes, cash flow, bridge charts
**Documentation**: [waterfall-chart.md](./plotly/waterfall-chart.md)
**Live Example**: [waterfall-chart.html](./plotly/waterfall-chart.html)

### Sunburst Chart
**Description**: Hierarchical data in concentric circles showing part-to-whole relationships.
**Use Cases**: File directories, budget hierarchies, multi-level categories
**Documentation**: [sunburst-chart.md](./plotly/sunburst-chart.md)
**Live Example**: [sunburst-chart.html](./plotly/sunburst-chart.html)

### Parallel Coordinates
**Description**: Visualize multi-dimensional data with parallel axes showing relationships across variables.
**Use Cases**: Feature comparison, pattern detection, multi-criteria analysis
**Documentation**: [parallel-coordinates.md](./plotly/parallel-coordinates.md)
**Live Example**: [parallel-coordinates.html](./plotly/parallel-coordinates.html)

---

## 🎮 Three.js

### 3D Pipeline
**Description**: Three-dimensional funnel/pipeline visualization with interactive rotation and zoom.
**Use Cases**: Sales funnels, conversion visualization, process stages, customer journey
**Documentation**: [3d-pipeline.md](./threejs/3d-pipeline.md)
**Live Example**: [3d-pipeline.html](./threejs/3d-pipeline.html)

### 3D Clustering
**Description**: Visualize data clusters in 3D space with interactive navigation and color coding.
**Use Cases**: Customer segmentation, data classification, pattern recognition
**Documentation**: [3d-clustering.md](./threejs/3d-clustering.md)
**Live Example**: [3d-clustering.html](./threejs/3d-clustering.html)

### Animated Meshes
**Description**: Dynamic 3D visualizations with animated geometries and real-time updates.
**Use Cases**: Real-time dashboards, performance monitoring, data streaming
**Documentation**: [animated-meshes.md](./threejs/animated-meshes.md)
**Live Example**: [animated-meshes.html](./threejs/animated-meshes.html)

### Interactive 3D
**Description**: Fully interactive 3D scenes with click events, hover effects, and user controls.
**Use Cases**: Data exploration, interactive reports, immersive dashboards
**Documentation**: [interactive-3d.md](./threejs/interactive-3d.md)
**Live Example**: [interactive-3d.html](./threejs/interactive-3d.html)

---

## 📉 Chart.js

### Line Chart
**Description**: Simple, clean line charts with smooth animations and responsive design.
**Use Cases**: Trends, time series, continuous data, multi-series comparison
**Documentation**: [line-chart.md](./chartjs/line-chart.md)
**Live Example**: [line-chart.html](./chartjs/line-chart.html)

### Bar Chart
**Description**: Vertical and horizontal bar charts with stacking and grouping capabilities.
**Use Cases**: Comparisons, rankings, categorical data, progress tracking
**Documentation**: [bar-chart.md](./chartjs/bar-chart.md)
**Live Example**: [bar-chart.html](./chartjs/bar-chart.html)

### Doughnut & Pie
**Description**: Circular charts showing proportions with center labels and animations.
**Use Cases**: Percentages, distribution, composition, part-to-whole relationships
**Documentation**: [doughnut-pie.md](./chartjs/doughnut-pie.md)
**Live Example**: [doughnut-pie.html](./chartjs/doughnut-pie.html)

### Radar Chart
**Description**: Multi-axis charts displaying multiple variables in a spider web pattern.
**Use Cases**: Skills assessment, feature comparison, performance metrics
**Documentation**: [radar-chart.md](./chartjs/radar-chart.md)
**Live Example**: [radar-chart.html](./chartjs/radar-chart.html)

### Bubble & Scatter
**Description**: Point-based charts with optional size dimension for bubble visualization.
**Use Cases**: Correlation analysis, clustering, distribution patterns
**Documentation**: [bubble-scatter.md](./chartjs/bubble-scatter.md)
**Live Example**: [bubble-scatter.html](./chartjs/bubble-scatter.html)

### Mixed Charts
**Description**: Combine different chart types (line, bar, scatter) with multiple axes.
**Use Cases**: Complex datasets, multi-metric dashboards, comprehensive analysis
**Documentation**: [mixed-charts.md](./chartjs/mixed-charts.md)
**Live Example**: [mixed-charts.html](./chartjs/mixed-charts.html)

---

## 🔥 ApexCharts

### Line & Area
**Description**: Modern line and area charts with gradients, animations, and zoom capabilities.
**Use Cases**: Trends, forecasts, time series, range visualization
**Documentation**: [line-area.md](./apexcharts/line-area.md)
**Live Example**: [line-area.html](./apexcharts/line-area.html)

### Column & Bar
**Description**: Feature-rich bar charts with patterns, gradients, and extensive customization.
**Use Cases**: Comparisons, distributions, rankings, stacked metrics
**Documentation**: [column-bar.md](./apexcharts/column-bar.md)
**Live Example**: [column-bar.html](./apexcharts/column-bar.html)

### Heatmap
**Description**: Matrix visualization using color intensity to represent values across two dimensions.
**Use Cases**: Correlation matrices, activity patterns, performance grids
**Documentation**: [heatmap.md](./apexcharts/heatmap.md)
**Live Example**: [heatmap.html](./apexcharts/heatmap.html)

### Radial Charts
**Description**: Circular progress indicators, gauges, and donut charts with modern styling.
**Use Cases**: KPIs, progress tracking, goal visualization, performance scores
**Documentation**: [radial-charts.md](./apexcharts/radial-charts.md)
**Live Example**: [radial-charts.html](./apexcharts/radial-charts.html)

### Sparklines
**Description**: Compact, inline charts without axes for dashboard tiles and tables.
**Use Cases**: Dashboard cards, data tables, inline trends, compact metrics
**Documentation**: [sparklines.md](./apexcharts/sparklines.md)
**Live Example**: [sparklines.html](./apexcharts/sparklines.html)

### Candlestick & OHLC
**Description**: Financial charts showing open, high, low, close values with box plots.
**Use Cases**: Stock prices, financial analysis, range data, statistical distribution
**Documentation**: [candlestick.md](./apexcharts/candlestick.md)
**Live Example**: [candlestick.html](./apexcharts/candlestick.html)

---

## 🚀 Quick Start Guide

### Viewing Examples
1. Open any `.html` file directly in your browser to see the live chart
2. Each HTML file is standalone with CDN links included

### Implementation
1. Review the `.md` documentation file for implementation details
2. Copy code examples from the documentation
3. Refer to the HTML files for complete working examples

### Choosing a Library

| Library | Best For | Key Strength |
|---------|----------|--------------|
| **Recharts** | React applications | Composable components, declarative API |
| **D3.js** | Custom visualizations | Maximum flexibility and control |
| **Plotly.js** | Scientific/3D charts | 3D graphics, geographic maps |
| **Three.js** | 3D visualizations | Immersive, animated 3D scenes |
| **Chart.js** | Simple charts | Easy to implement, lightweight |
| **ApexCharts** | Modern dashboards | Rich features, built-in interactivity |

---

## 📚 Additional Resources

- **Integration Examples**: See component implementations in the dashboard
- **Performance Tips**: Consider data size and update frequency when choosing libraries
- **Responsive Design**: All charts support responsive sizing
- **Accessibility**: Most libraries provide ARIA labels and keyboard navigation

---

*Last Updated: September 2024*