# Force-Directed Graph - D3.js

## Description
Force-directed graphs show relationships and connections between entities using physics simulation. Nodes repel each other while links create attractive forces, resulting in organic network layouts. Perfect for visualizing relationships, dependencies, and network structures.

## Working Example

```tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

const data = {
  nodes: [
    { id: 'Sales Team', group: 1 },
    { id: 'Marketing', group: 2 },
    { id: 'Product', group: 3 },
    { id: 'Customer Success', group: 1 },
    { id: 'Engineering', group: 3 },
    { id: 'Lead Gen', group: 2 },
    { id: 'Prospects', group: 4 },
    { id: 'Customers', group: 4 },
  ],
  links: [
    { source: 'Marketing', target: 'Lead Gen', value: 3 },
    { source: 'Lead Gen', target: 'Prospects', value: 2 },
    { source: 'Sales Team', target: 'Prospects', value: 4 },
    { source: 'Sales Team', target: 'Customers', value: 3 },
    { source: 'Product', target: 'Engineering', value: 5 },
    { source: 'Product', target: 'Customers', value: 2 },
    { source: 'Customer Success', target: 'Customers', value: 4 },
    { source: 'Marketing', target: 'Sales Team', value: 3 },
  ]
};

export function TeamNetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Add links
    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    // Add nodes
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 20)
      .attr('fill', (d: any) => color(d.group))
      .call(drag(simulation) as any);

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d: any) => d.id)
      .attr('font-size', 12)
      .attr('dx', 25)
      .attr('dy', 4);

    // Add tooltip
    node.append('title')
      .text((d: any) => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, []);

  return <svg ref={svgRef} />;
}
```

## Key Forces

| Force | Description | Key Parameters |
|-------|-------------|----------------|
| `forceLink` | Connects linked nodes | `distance`, `strength`, `iterations` |
| `forceManyBody` | Nodes attract/repel | `strength` (negative = repel) |
| `forceCenter` | Pull toward center | `x`, `y` coordinates |
| `forceCollide` | Prevent overlap | `radius`, `strength`, `iterations` |
| `forceX/Y` | Pull toward position | `x`/`y`, `strength` |
| `forceRadial` | Circular arrangement | `radius`, `x`, `y`, `strength` |

## Use Cases

- **Team Relationships**: Visualize collaboration patterns
- **System Dependencies**: Show component relationships
- **Social Networks**: Display connections between people
- **Knowledge Graphs**: Map concept relationships
- **Customer Journey**: Show touchpoint connections
- **Influence Mapping**: Display impact relationships

## Documentation Links
📚 [D3 Force Documentation](https://github.com/d3/d3-force)
📚 [Force-Directed Graph Examples](https://observablehq.com/@d3/force-directed-graph)

## Tips
- Adjust force strength for better layouts
- Use color coding for node categories
- Implement drag interaction for exploration
- Add zoom/pan for large networks
- Consider using `forceCollide` to prevent overlaps
- Optimize performance with `simulation.stop()` when not needed