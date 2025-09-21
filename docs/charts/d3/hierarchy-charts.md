# Hierarchy Charts (Treemap, Sunburst, Pack) - D3.js

## Description
D3 provides multiple ways to visualize hierarchical data. Treemaps use nested rectangles, sunbursts use concentric rings, and circle packing uses nested circles. Each offers unique advantages for different data types and use cases.

## Treemap Example

```tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

const salesData = {
  name: "Sales",
  children: [
    {
      name: "Q1",
      children: [
        { name: "Product A", value: 45000 },
        { name: "Product B", value: 32000 },
        { name: "Product C", value: 28000 },
      ]
    },
    {
      name: "Q2",
      children: [
        { name: "Product A", value: 52000 },
        { name: "Product B", value: 38000 },
        { name: "Product C", value: 31000 },
      ]
    }
  ]
};

export function SalesTreemap() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const root = d3.hierarchy(salesData)
      .sum((d: any) => d.value)
      .sort((a, b) => b.value! - a.value!);

    d3.treemap()
      .size([width, height])
      .padding(2)(root);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const leaf = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    leaf.append('rect')
      .attr('fill', (d: any) => color(d.parent.data.name))
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0);

    leaf.append('text')
      .attr('x', 4)
      .attr('y', 20)
      .text((d: any) => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', 'white');

    leaf.append('text')
      .attr('x', 4)
      .attr('y', 35)
      .text((d: any) => `$${d.value.toLocaleString()}`)
      .attr('font-size', '10px')
      .attr('fill', 'white');
  }, []);

  return <svg ref={svgRef} />;
}
```

## Sunburst Example

```tsx
export function SalesSunburst() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const radius = width / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', width);

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${width / 2})`);

    const root = d3.hierarchy(salesData)
      .sum((d: any) => d.value)
      .sort((a, b) => b.value! - a.value!);

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    partition(root);

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .innerRadius((d: any) => d.y0)
      .outerRadius((d: any) => d.y1);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    g.selectAll('path')
      .data(root.descendants())
      .join('path')
      .attr('d', arc as any)
      .style('fill', (d: any) => color(d.data.name))
      .style('stroke', '#fff')
      .append('title')
      .text((d: any) => `${d.data.name}: ${d.value}`);
  }, []);

  return <svg ref={svgRef} />;
}
```

## Circle Packing Example

```tsx
export function SalesCirclePacking() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const root = d3.hierarchy(salesData)
      .sum((d: any) => d.value)
      .sort((a, b) => b.value! - a.value!);

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    pack(root);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const node = svg.selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', (d: any) => d.r)
      .attr('fill', (d: any) => color(d.data.name))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5);

    node.filter((d: any) => !d.children)
      .append('text')
      .attr('dy', '0.3em')
      .style('text-anchor', 'middle')
      .text((d: any) => d.data.name)
      .attr('font-size', (d: any) => Math.min(d.r / 3, 12));
  }, []);

  return <svg ref={svgRef} />;
}
```

## Comparison of Hierarchy Types

| Type | Best For | Advantages | Limitations |
|------|----------|------------|-------------|
| **Treemap** | Part-to-whole comparison | Space efficient, good for many items | Hard to show deep hierarchy |
| **Sunburst** | Multi-level hierarchy | Shows full path, radial efficiency | Center space unused |
| **Circle Pack** | Size comparison | Aesthetic, shows nesting clearly | Less space efficient |

## Use Cases

### Treemap
- **Sales by Product**: Compare product revenue
- **Budget Allocation**: Visualize spending categories
- **File Storage**: Show disk usage by folder

### Sunburst
- **Navigation Paths**: Website user journeys
- **Organizational Structure**: Department hierarchies
- **Time Breakdown**: Project time allocation

### Circle Pack
- **Market Segments**: Nested market categories
- **Tag Clouds**: Weighted topic visualization
- **Population Data**: Geographic distributions

## Documentation Links
📚 [D3 Hierarchy Module](https://github.com/d3/d3-hierarchy)
📚 [Treemap Examples](https://observablehq.com/@d3/treemap)
📚 [Sunburst Examples](https://observablehq.com/@d3/sunburst)
📚 [Circle Packing Examples](https://observablehq.com/@d3/circle-packing)

## Tips
- Choose layout based on data depth and comparison needs
- Use color to encode additional dimensions
- Add zoom functionality for large datasets
- Consider transitions between layouts
- Implement tooltips for detailed information
- Use text sizing proportional to area/radius