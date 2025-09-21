import React from 'react';

export default {
  title: 'Three.js/3D Visualizations',
  parameters: {
    docs: {
      description: {
        component: 'Three.js 3D graphics for immersive data visualization. Interactive 3D scenes with full camera controls.'
      }
    }
  }
};

const IframeWrapper = ({ src, title }) => (
  <div style={{ width: '100%', height: '650px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
    <iframe
      src={src}
      title={title}
      width="100%"
      height="100%"
      style={{ border: 'none' }}
    />
  </div>
);

export const Pipeline3D = () => (
  <IframeWrapper src="/threejs/3d-pipeline-standalone.html" title="3D Pipeline" />
);

export const Clustering3D = () => (
  <IframeWrapper src="/threejs/3d-clustering-standalone.html" title="3D Clustering" />
);

export const AnimatedMeshes = () => (
  <IframeWrapper src="/threejs/animated-meshes-standalone.html" title="Animated Meshes" />
);

export const Interactive3D = () => (
  <IframeWrapper src="/threejs/interactive-3d-standalone.html" title="Interactive 3D Dashboard" />
);

Pipeline3D.storyName = '3D Sales Pipeline';
Clustering3D.storyName = '3D Customer Clustering';
AnimatedMeshes.storyName = 'Animated Performance Metrics';
Interactive3D.storyName = 'Interactive 3D Dashboard';

Pipeline3D.parameters = {
  docs: {
    description: {
      story: 'Three-dimensional funnel/pipeline visualization with interactive rotation and zoom. Perfect for sales funnels and conversion visualization.'
    }
  }
};

Clustering3D.parameters = {
  docs: {
    description: {
      story: 'Visualize data clusters in 3D space with interactive navigation. Ideal for customer segmentation and pattern recognition.'
    }
  }
};

AnimatedMeshes.parameters = {
  docs: {
    description: {
      story: 'Dynamic 3D visualizations with animated geometries and real-time updates. Great for real-time dashboards and performance monitoring.'
    }
  }
};

Interactive3D.parameters = {
  docs: {
    description: {
      story: 'Fully interactive 3D scenes with click events and hover effects. Perfect for data exploration and immersive dashboards.'
    }
  }
};