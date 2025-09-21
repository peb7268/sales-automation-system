# 3D Surface Plot - Plotly.js

## Description
3D surface plots visualize three-dimensional data as a continuous surface. Ideal for showing relationships between three variables, optimization landscapes, performance metrics across two parameters, or any data with two independent and one dependent variable.

## Working Example

```tsx
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function Performance3DSurface() {
  const data = useMemo(() => {
    // Generate sample data: Performance based on price and marketing spend
    const size = 25;
    const x = Array(size).fill(0).map((_, i) => i * 1000); // Price ($0-$24k)
    const y = Array(size).fill(0).map((_, i) => i * 2000); // Marketing spend ($0-$48k)

    // Create z values (performance metric)
    const z = [];
    for (let i = 0; i < size; i++) {
      z[i] = [];
      for (let j = 0; j < size; j++) {
        // Simulate performance as function of price and marketing
        const price = x[j];
        const marketing = y[i];
        const performance = Math.sin(price / 5000) * Math.cos(marketing / 10000) * 100
          + 50 + Math.random() * 10;
        z[i][j] = performance;
      }
    }

    return [{
      type: 'surface',
      x: x,
      y: y,
      z: z,
      colorscale: [
        [0, '#FF4444'],
        [0.25, '#FFA726'],
        [0.5, '#FFEB3B'],
        [0.75, '#66BB6A'],
        [1, '#2E7D32']
      ],
      contours: {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#42f462",
          project: { z: true }
        }
      },
      hovertemplate:
        'Price: $%{x:,.0f}<br>' +
        'Marketing: $%{y:,.0f}<br>' +
        'Performance: %{z:.1f}%<br>' +
        '<extra></extra>'
    }];
  }, []);

  const layout = {
    title: 'Performance Analysis: Price vs Marketing Spend',
    scene: {
      xaxis: { title: 'Product Price ($)', gridcolor: '#E0E0E0' },
      yaxis: { title: 'Marketing Spend ($)', gridcolor: '#E0E0E0' },
      zaxis: { title: 'Performance Score (%)', gridcolor: '#E0E0E0' },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      aspectmode: 'manual',
      aspectratio: { x: 1, y: 1, z: 0.7 }
    },
    width: 800,
    height: 600,
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };

  return <Plot data={data} layout={layout} />;
}

// Conversion Rate Surface
export function ConversionRateSurface() {
  const data = useMemo(() => {
    // Call duration (minutes) vs Follow-up time (hours)
    const callDuration = Array(20).fill(0).map((_, i) => i * 2); // 0-38 minutes
    const followUpTime = Array(20).fill(0).map((_, i) => i * 4); // 0-76 hours

    const z = [];
    for (let i = 0; i < 20; i++) {
      z[i] = [];
      for (let j = 0; j < 20; j++) {
        // Conversion rate peaks at optimal call duration and quick follow-up
        const optimal = 70 * Math.exp(-Math.pow(callDuration[j] - 15, 2) / 100)
          * Math.exp(-followUpTime[i] / 30);
        z[i][j] = Math.max(5, optimal + Math.random() * 5);
      }
    }

    return [{
      type: 'surface',
      x: callDuration,
      y: followUpTime,
      z: z,
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: 'Conversion Rate (%)',
        thickness: 20
      }
    }];
  }, []);

  const layout = {
    title: 'Conversion Rate Optimization Surface',
    scene: {
      xaxis: { title: 'Call Duration (minutes)' },
      yaxis: { title: 'Follow-up Time (hours)' },
      zaxis: { title: 'Conversion Rate (%)' },
      camera: {
        eye: { x: -1.5, y: -1.5, z: 1.2 }
      }
    },
    width: 800,
    height: 600
  };

  return <Plot data={data} layout={layout} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `type` | Plot type | `'surface'`, `'mesh3d'`, `'isosurface'` |
| `x`, `y`, `z` | Data arrays | 1D arrays for x/y, 2D array for z |
| `colorscale` | Color mapping | Predefined or custom gradient |
| `contours` | Contour lines | Show projections on axes |
| `showscale` | Show color bar | Boolean |
| `opacity` | Surface opacity | 0 to 1 |
| `scene.camera` | View angle | Eye position coordinates |
| `hovertemplate` | Tooltip format | Custom HTML template |

## Use Cases

- **Optimization Analysis**: Find optimal parameter combinations
- **Performance Landscapes**: Visualize performance across two variables
- **Risk Assessment**: Show risk levels across different scenarios
- **Pricing Strategy**: Analyze profit across price and volume
- **Resource Allocation**: Optimal distribution of resources
- **Quality Control**: Defect rates across temperature and pressure
- **Marketing ROI**: Returns across spend and timing

## Documentation Links
📚 [Plotly 3D Surface Plots](https://plotly.com/javascript/3d-surface-plots/)
📚 [3D Axes Configuration](https://plotly.com/javascript/3d-axes/)
📚 [Camera Controls](https://plotly.com/javascript/3d-camera-controls/)

## Tips
- Use `contours` to add projection lines for better readability
- Adjust `camera.eye` for the best viewing angle
- Consider `mesh3d` for irregular grid data
- Use meaningful `colorscale` (sequential for continuous data)
- Add `opacity < 1` to see through to back surface
- Enable rotation with `config: {displayModeBar: true}`
- Consider adding multiple surfaces for comparison