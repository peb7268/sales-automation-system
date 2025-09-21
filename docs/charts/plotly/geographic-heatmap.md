# Geographic Heatmap - Plotly.js

## Description
Geographic heatmaps visualize data points on a map using color intensity to represent values. Perfect for showing geographic distributions, regional performance, customer locations, or any location-based metrics.

## Working Example

```tsx
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamic import to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export function SalesGeographicHeatmap() {
  const data = useMemo(() => {
    // Sample sales data by US state
    const stateData = {
      locations: ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'],
      z: [450000, 380000, 420000, 350000, 280000, 260000, 240000, 220000, 200000, 190000],
      locationLabels: [
        'California', 'Texas', 'New York', 'Florida', 'Illinois',
        'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
      ]
    };

    return [{
      type: 'choropleth',
      locationmode: 'USA-states',
      locations: stateData.locations,
      z: stateData.z,
      text: stateData.locationLabels,
      hovertemplate: '%{text}<br>Sales: $%{z:,.0f}<extra></extra>',
      colorscale: [
        [0, '#E8F5E9'],
        [0.2, '#A5D6A7'],
        [0.4, '#66BB6A'],
        [0.6, '#43A047'],
        [0.8, '#2E7D32'],
        [1, '#1B5E20']
      ],
      colorbar: {
        title: 'Sales ($)',
        thickness: 15,
        len: 0.5,
        x: 1.02
      }
    }];
  }, []);

  const layout = {
    title: 'Sales Performance by State',
    geo: {
      scope: 'usa',
      showlakes: false,
      lakecolor: 'rgb(255,255,255)',
      bgcolor: '#f8f9fa'
    },
    width: 900,
    height: 500,
    margin: { t: 50, r: 0, b: 0, l: 0 }
  };

  return <Plot data={data} layout={layout} />;
}

// Density map for prospect locations
export function ProspectDensityMap() {
  const data = useMemo(() => {
    // Generate sample lat/lon data
    const prospectLocations = {
      lat: Array(200).fill(0).map(() => 37 + Math.random() * 8),
      lon: Array(200).fill(0).map(() => -122 + Math.random() * 15),
      intensity: Array(200).fill(0).map(() => Math.random() * 100)
    };

    return [{
      type: 'densitymapbox',
      lat: prospectLocations.lat,
      lon: prospectLocations.lon,
      z: prospectLocations.intensity,
      radius: 20,
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: 'Prospect Density',
        thickness: 15
      }
    }];
  }, []);

  const layout = {
    mapbox: {
      style: 'open-street-map',
      center: { lat: 40, lon: -100 },
      zoom: 3
    },
    height: 500,
    margin: { t: 0, r: 0, b: 0, l: 0 }
  };

  return <Plot data={data} layout={layout} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `type` | Chart type | `'choropleth'`, `'scattergeo'`, `'densitymapbox'` |
| `locationmode` | Location format | `'USA-states'`, `'country names'`, `'ISO-3'` |
| `locations` | Location identifiers | Array of location codes |
| `z` | Values to map | Numeric array |
| `colorscale` | Color gradient | Predefined or custom array |
| `geo.scope` | Map region | `'world'`, `'usa'`, `'europe'`, `'asia'`, etc. |
| `mapbox.style` | Map style | `'open-street-map'`, `'carto-positron'`, `'stamen-terrain'` |

## Use Cases

- **Sales Territory Analysis**: Visualize revenue by region
- **Customer Distribution**: Show customer density across locations
- **Market Penetration**: Display market share by geography
- **Logistics Planning**: Optimize delivery routes and warehouses
- **Demographics Analysis**: Population or demographic data visualization
- **Real Estate**: Property values and market trends
- **Campaign Performance**: Marketing campaign results by location

## Documentation Links
📚 [Plotly Choropleth Maps](https://plotly.com/javascript/choropleth-maps/)
📚 [Plotly Geo Maps](https://plotly.com/javascript/maps/)
📚 [React Plotly.js Documentation](https://plotly.com/javascript/react/)

## Tips
- Use `locationmode` appropriate for your data (states, countries, etc.)
- Customize `colorscale` to match your brand or data meaning
- Add `hovertemplate` for better tooltip formatting
- Consider `scattergeo` for point data instead of regions
- Use `mapbox` plots for street-level detail
- Implement responsive sizing with `config.responsive: true`