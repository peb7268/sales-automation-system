# Sankey Diagram - D3.js

## Description
Sankey diagrams visualize flow and relationships between nodes, showing how values flow from one set of categories to another. Perfect for showing conversion funnels, budget flows, or process workflows.

## Working Example

```tsx
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { useEffect, useRef } from 'react';

const data = {
  nodes: [
    { id: 'Prospects', value: 1000 },
    { id: 'Qualified', value: 600 },
    { id: 'Contacted', value: 400 },
    { id: 'Meeting', value: 200 },
    { id: 'Closed Won', value: 80 },
    { id: 'Closed Lost', value: 120 },
    { id: 'No Response', value: 200 },
  ],
  links: [
    { source: 'Prospects', target: 'Qualified', value: 600 },
    { source: 'Prospects', target: 'No Response', value: 400 },
    { source: 'Qualified', target: 'Contacted', value: 400 },
    { source: 'Qualified', target: 'No Response', value: 200 },
    { source: 'Contacted', target: 'Meeting', value: 200 },
    { source: 'Contacted', target: 'Closed Lost', value: 200 },
    { source: 'Meeting', target: 'Closed Won', value: 80 },
    { source: 'Meeting', target: 'Closed Lost', value: 120 },
  ]
};

export function SalesSankeyDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const sankeyGenerator = sankey()
      .nodeId((d: any) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const { nodes, links } = sankeyGenerator(data as any);

    // Add links
    svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#000')
      .attr('stroke-opacity', 0.2)
      .attr('fill', 'none')
      .attr('stroke-width', (d: any) => Math.max(1, d.width));

    // Add nodes
    svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', '#69b3a2');

    // Add labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', (d: any) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
      .text((d: any) => d.id);
  }, []);

  return <svg ref={svgRef} />;
}
```

## Key Configuration

| Property | Description | Default |
|----------|-------------|---------|
| `nodeId` | Function to get node ID | Required |
| `nodeWidth` | Width of nodes | 24 |
| `nodePadding` | Vertical padding between nodes | 8 |
| `nodeAlign` | Node alignment method | `sankeyJustify` |
| `extent` | Diagram boundaries | [[0,0], [1,1]] |
| `iterations` | Layout optimization iterations | 32 |

## Use Cases

- **Sales Funnels**: Visualize conversion through stages
- **Budget Flow**: Track money flow between departments
- **User Journey**: Show paths through application
- **Energy Distribution**: Display resource allocation
- **Process Workflows**: Map multi-step processes
- **Traffic Analysis**: Website navigation patterns

## Documentation Links
📚 [D3 Sankey Documentation](https://github.com/d3/d3-sankey)
📚 [D3.js Official Documentation](https://d3js.org/)

## Tips
- Keep node labels concise for readability
- Use color coding for different flow types
- Add tooltips for detailed information
- Consider interactive highlighting on hover
- Optimize layout with appropriate iterations