import React from 'react';

export default {
  title: 'Plotly.js/Interactive Examples',
  parameters: {
    docs: {
      description: {
        component: 'Plotly.js scientific and 3D visualizations. Full interactive capabilities including zoom, pan, and 3D rotation.'
      }
    }
  }
};

const IframeWrapper = ({ src, title }) => (
  <div style={{ width: '100%', height: '600px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
    <iframe
      src={src}
      title={title}
      width="100%"
      height="100%"
      style={{ border: 'none' }}
    />
  </div>
);

export const GeographicHeatmap = () => (
  <IframeWrapper src="/plotly/geographic-heatmap.html" title="Geographic Heatmap" />
);

export const Surface3D = () => (
  <IframeWrapper src="/plotly/3d-surface.html" title="3D Surface Plot" />
);

export const BubbleChart = () => (
  <IframeWrapper src="/plotly/bubble-chart.html" title="Bubble Chart" />
);

export const WaterfallChart = () => (
  <IframeWrapper src="/plotly/waterfall-chart.html" title="Waterfall Chart" />
);

export const SunburstChart = () => (
  <IframeWrapper src="/plotly/sunburst-chart.html" title="Sunburst Chart" />
);

export const ParallelCoordinates = () => (
  <IframeWrapper src="/plotly/parallel-coordinates.html" title="Parallel Coordinates" />
);

GeographicHeatmap.storyName = 'Geographic Heatmap - World Maps';
Surface3D.storyName = '3D Surface Plot - Scientific';
BubbleChart.storyName = 'Bubble Chart - Multi-dimensional';
WaterfallChart.storyName = 'Waterfall - Financial Analysis';
SunburstChart.storyName = 'Sunburst - Hierarchical Data';
ParallelCoordinates.storyName = 'Parallel Coordinates - Multi-variate';

GeographicHeatmap.parameters = {
  docs: {
    description: {
      story: 'Display data on world or regional maps with color-coded regions. Perfect for sales by region and market presence visualization.'
    }
  }
};

Surface3D.parameters = {
  docs: {
    description: {
      story: 'Three-dimensional surface visualization for continuous data. Ideal for scientific data and optimization landscapes.'
    }
  }
};

BubbleChart.parameters = {
  docs: {
    description: {
      story: 'Scatter plot with third dimension shown as bubble size. Great for multi-dimensional comparisons and portfolio visualization.'
    }
  }
};

WaterfallChart.parameters = {
  docs: {
    description: {
      story: 'Show cumulative effect of sequential positive/negative values. Essential for profit/loss analysis and cash flow visualization.'
    }
  }
};

SunburstChart.parameters = {
  docs: {
    description: {
      story: 'Hierarchical data in concentric circles. Perfect for file directories and multi-level category visualization.'
    }
  }
};

ParallelCoordinates.parameters = {
  docs: {
    description: {
      story: 'Visualize multi-dimensional data with parallel axes. Excellent for feature comparison and pattern detection.'
    }
  }
};