# Radial Tree - D3.js

## Description
Radial trees display hierarchical data in a circular layout, with the root at the center and children radiating outward. Excellent for showing organizational structures, taxonomies, or decision trees in a space-efficient format.

## Working Example

```tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

const data = {
  name: "Sales Operations",
  children: [
    {
      name: "Lead Generation",
      children: [
        { name: "Inbound", value: 150 },
        { name: "Outbound", value: 200 },
        { name: "Referrals", value: 75 },
      ]
    },
    {
      name: "Qualification",
      children: [
        { name: "BANT", value: 100 },
        { name: "MEDDIC", value: 80 },
        { name: "Custom", value: 60 },
      ]
    },
    {
      name: "Closing",
      children: [
        { name: "Demo", value: 120 },
        { name: "Proposal", value: 90 },
        { name: "Negotiation", value: 70 },
        { name: "Contract", value: 50 },
      ]
    },
    {
      name: "Post-Sale",
      children: [
        { name: "Onboarding", value: 85 },
        { name: "Success", value: 110 },
        { name: "Upsell", value: 45 },
      ]
    }
  ]
};

export function SalesProcessRadialTree() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 800;
    const radius = width / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const tree = d3.tree()
      .size([2 * Math.PI, radius - 100])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    const root = d3.hierarchy(data);
    tree(root as any);

    // Create links
    const link = g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.linkRadial()
        .angle((d: any) => d.x)
        .radius((d: any) => d.y) as any);

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(root.descendants())
      .join('circle')
      .attr('transform', (d: any) => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `)
      .attr('fill', (d: any) => d.children ? '#555' : '#999')
      .attr('r', (d: any) => d.children ? 4 : 3);

    // Add labels
    const label = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('text')
      .data(root.descendants())
      .join('text')
      .attr('transform', (d: any) => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
      .attr('dy', '0.31em')
      .attr('x', (d: any) => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', (d: any) => d.x < Math.PI === !d.children ? 'start' : 'end')
      .text((d: any) => d.data.name)
      .clone(true).lower()
      .attr('stroke', 'white');

    // Add interactivity
    node.on('mouseover', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', (d: any) => d.children ? 8 : 6)
        .attr('fill', '#ff6b6b');
    }).on('mouseout', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', (d: any) => d.children ? 4 : 3)
        .attr('fill', (d: any) => d.children ? '#555' : '#999');
    });
  }, []);

  return <svg ref={svgRef} />;
}
```

## Key Configuration

| Property | Description | Options |
|----------|-------------|---------|
| `size` | Tree dimensions | [angle, radius] for radial |
| `separation` | Node spacing function | Function(a, b) |
| `nodeSize` | Fixed node size | [width, height] |
| `d3.hierarchy` | Create hierarchy | Root data object |
| `d3.linkRadial` | Radial link generator | `.angle()`, `.radius()` |

## Use Cases

- **Organization Charts**: Company structure visualization
- **Process Hierarchies**: Multi-level business processes
- **Product Categories**: E-commerce taxonomy
- **Decision Trees**: Visual decision making paths
- **File Systems**: Directory structure display
- **Mind Maps**: Concept relationships

## Documentation Links
📚 [D3 Hierarchy Documentation](https://github.com/d3/d3-hierarchy)
📚 [D3 Tree Layout](https://github.com/d3/d3-hierarchy#tree)
📚 [Radial Tree Examples](https://observablehq.com/@d3/radial-tree)

## Tips
- Use `separation` function for better spacing
- Rotate labels for readability on different angles
- Add zoom/pan for large hierarchies
- Color code by depth or category
- Consider collapsible nodes for large trees
- Use transitions for smooth interactions