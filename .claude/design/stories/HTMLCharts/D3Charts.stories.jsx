import React from 'react';

export default {
  title: 'D3.js/Interactive Examples',
  parameters: {
    docs: {
      description: {
        component: 'D3.js visualizations displayed via iframe. These are fully interactive HTML implementations.'
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

export const SankeyDiagram = () => (
  <IframeWrapper src="/d3/sankey-diagram.html" title="Sankey Diagram" />
);

export const ForceDirectedGraph = () => (
  <IframeWrapper src="/d3/force-directed-graph.html" title="Force-Directed Graph" />
);

export const RadialTree = () => (
  <IframeWrapper src="/d3/radial-tree.html" title="Radial Tree" />
);

export const HierarchyCharts = () => (
  <IframeWrapper src="/d3/hierarchy-charts.html" title="Hierarchy Charts" />
);

export const CustomVisualizations = () => (
  <IframeWrapper src="/d3/custom-visualizations.html" title="Custom Visualizations" />
);

SankeyDiagram.storyName = 'Sankey Diagram - Flow Visualization';
ForceDirectedGraph.storyName = 'Force-Directed Graph - Network';
RadialTree.storyName = 'Radial Tree - Hierarchical';
HierarchyCharts.storyName = 'Treemap & Sunburst';
CustomVisualizations.storyName = 'Custom D3 Visualizations';

SankeyDiagram.parameters = {
  docs: {
    description: {
      story: 'Visualize flow and relationships between nodes with weighted paths. Perfect for sales pipelines, energy flow, and budget allocation.'
    }
  }
};

ForceDirectedGraph.parameters = {
  docs: {
    description: {
      story: 'Interactive network visualization with physics simulation. Ideal for network analysis, social graphs, and organizational charts.'
    }
  }
};

RadialTree.parameters = {
  docs: {
    description: {
      story: 'Hierarchical data displayed in circular layout. Great for organizational structure, file systems, and taxonomy visualization.'
    }
  }
};

HierarchyCharts.parameters = {
  docs: {
    description: {
      story: 'Multiple hierarchical visualizations including treemaps and sunbursts for budget breakdown and category hierarchies.'
    }
  }
};

CustomVisualizations.parameters = {
  docs: {
    description: {
      story: 'Unique, tailored visualizations using D3\'s low-level API for specific data needs and creative presentations.'
    }
  }
};