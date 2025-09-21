# Chart Design System Storybook

A comprehensive Storybook showcasing all chart types from 6 major JavaScript charting libraries.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Storybook
npm run storybook
```

Storybook will open at http://localhost:6006

## 📊 Available Libraries

### React Component Libraries
- **Recharts** - React-specific charting with composable components
- **Chart.js** (react-chartjs-2) - Simple, flexible charts using Canvas
- **ApexCharts** (react-apexcharts) - Modern charts with extensive customization

### HTML/JavaScript Libraries (via iframe)
- **D3.js** - Custom, interactive visualizations
- **Plotly.js** - Scientific and 3D charts
- **Three.js** - 3D graphics and animations

## 📁 Project Structure

```
.claude/design/
├── .storybook/
│   ├── main.js           # Storybook configuration
│   └── preview.js        # Global decorators and parameters
├── stories/
│   ├── Introduction.stories.mdx    # Welcome page
│   ├── Recharts/                   # React component stories
│   │   ├── LineChart.stories.jsx
│   │   ├── BarChart.stories.jsx
│   │   └── PieChart.stories.jsx
│   ├── ChartJS/                    # Chart.js React stories
│   │   └── LineChart.stories.jsx
│   ├── ApexCharts/                 # ApexCharts React stories
│   │   └── LineArea.stories.jsx
│   └── HTMLCharts/                 # Iframe-based HTML examples
│       ├── D3Charts.stories.jsx
│       ├── PlotlyCharts.stories.jsx
│       └── ThreeJSCharts.stories.jsx
└── package.json
```

## 🎨 Chart Categories

### By Library

#### Recharts (6 types)
- Line & Area Charts
- Bar Charts
- Pie & Donut Charts
- Radial & Radar Charts
- Composed Charts

#### D3.js (5 types)
- Sankey Diagrams
- Force-Directed Graphs
- Radial Trees
- Hierarchy Charts
- Custom Visualizations

#### Plotly.js (6 types)
- Geographic Heatmaps
- 3D Surface Plots
- Bubble Charts
- Waterfall Charts
- Sunburst Charts
- Parallel Coordinates

#### Three.js (4 types)
- 3D Pipeline
- 3D Clustering
- Animated Meshes
- Interactive 3D

#### Chart.js (6 types)
- Line Charts
- Bar Charts
- Doughnut & Pie
- Radar Charts
- Bubble & Scatter
- Mixed Charts

#### ApexCharts (6 types)
- Line & Area
- Column & Bar
- Heatmaps
- Radial Charts
- Sparklines
- Candlestick

## 🔧 Development

### Adding New Charts

1. **React Components**: Create a new `.stories.jsx` file in the appropriate library folder
2. **HTML Examples**: Add to `HTMLCharts` folder and reference via iframe
3. **Documentation**: Update the Introduction.stories.mdx with new chart info

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run storybook

# Build static Storybook
npm run build-storybook
```

## 📚 Resources

- [Chart Documentation](/docs/charts/index.md)
- [Live HTML Examples](/docs/charts/)
- [React Implementation Examples](./stories/)

## 🎯 Chart Selection Guide

| Use Case | Library | Chart Type |
|----------|---------|------------|
| React Apps | Recharts | Line, Bar, Pie |
| Custom Viz | D3.js | Force, Sankey |
| Scientific | Plotly | 3D, Geographic |
| 3D Graphics | Three.js | Pipeline, Mesh |
| Simple | Chart.js | Basic charts |
| Modern | ApexCharts | All types |

## 📝 Notes

- HTML charts are served from `/docs/charts/` via static directory
- React components are fully interactive within Storybook
- All charts support responsive sizing
- Use the controls panel to test different configurations

## 🚨 Troubleshooting

### Charts not loading
- Ensure all dependencies are installed: `npm install`
- Check that HTML files exist in `../../docs/charts/`
- Verify Storybook is running on port 6006

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors in stories
- Ensure all chart libraries are properly imported

---

*Created for the Sales Dashboard Design System*