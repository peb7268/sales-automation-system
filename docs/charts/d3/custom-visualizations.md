# Custom Visualizations - D3.js

## Description
D3.js excels at creating custom, bespoke visualizations that go beyond standard chart types. Its low-level control over SVG elements enables unique data representations tailored to specific needs.

## Custom Sales Pipeline Funnel

```tsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

export function CustomSalesFunnel() {
  const svgRef = useRef<SVGSVGElement>(null);

  const data = [
    { stage: 'Prospects', value: 1000, conversion: 100 },
    { stage: 'Qualified', value: 650, conversion: 65 },
    { stage: 'Proposals', value: 420, conversion: 64.6 },
    { stage: 'Negotiation', value: 230, conversion: 54.8 },
    { stage: 'Closed Won', value: 87, conversion: 37.8 },
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 150, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const funnelWidth = width - margin.left - margin.right;
    const funnelHeight = height - margin.top - margin.bottom;
    const sectionHeight = funnelHeight / data.length;

    // Create gradient definitions
    const defs = svg.append('defs');

    data.forEach((d, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.interpolateBlues(0.9 - i * 0.15));

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.interpolateBlues(0.7 - i * 0.15));
    });

    // Calculate trapezoid points
    const maxValue = data[0].value;
    const minWidth = 100;

    const sections = g.selectAll('.section')
      .data(data)
      .join('g')
      .attr('class', 'section');

    // Draw trapezoids
    sections.append('path')
      .attr('d', (d, i) => {
        const topWidth = (d.value / maxValue) * funnelWidth;
        const bottomWidth = i < data.length - 1
          ? (data[i + 1].value / maxValue) * funnelWidth
          : minWidth;

        const topX = (funnelWidth - topWidth) / 2;
        const bottomX = (funnelWidth - bottomWidth) / 2;
        const y = i * sectionHeight;

        return `
          M ${topX} ${y}
          L ${topX + topWidth} ${y}
          L ${bottomX + bottomWidth} ${y + sectionHeight}
          L ${bottomX} ${y + sectionHeight}
          Z
        `;
      })
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 200)
      .attr('opacity', 0.9);

    // Add stage labels
    sections.append('text')
      .attr('x', funnelWidth / 2)
      .attr('y', (d, i) => i * sectionHeight + sectionHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text(d => d.stage);

    // Add value labels
    sections.append('text')
      .attr('x', funnelWidth / 2)
      .attr('y', (d, i) => i * sectionHeight + sectionHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', 'white')
      .attr('font-size', '18px')
      .text(d => d.value);

    // Add conversion rate arrows
    const arrows = g.selectAll('.arrow')
      .data(data.slice(0, -1))
      .join('g')
      .attr('class', 'arrow');

    arrows.append('line')
      .attr('x1', funnelWidth + 20)
      .attr('y1', (d, i) => (i + 0.5) * sectionHeight)
      .attr('x2', funnelWidth + 20)
      .attr('y2', (d, i) => (i + 1.5) * sectionHeight)
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    arrows.append('text')
      .attr('x', funnelWidth + 40)
      .attr('y', (d, i) => (i + 1) * sectionHeight)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(d => `${d.conversion}%`);

    // Add arrowhead marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', '#666');

    // Add hover interactions
    sections.on('mouseover', function(event, d) {
      d3.select(this).select('path')
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('transform', 'scale(1.02)');
    }).on('mouseout', function(event, d) {
      d3.select(this).select('path')
        .transition()
        .duration(200)
        .attr('opacity', 0.9)
        .attr('transform', 'scale(1)');
    });
  }, []);

  return <svg ref={svgRef} />;
}
```

## Custom Animated Progress Ring

```tsx
export function AnimatedProgressRing({ progress = 75, size = 200 }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size);

    svg.selectAll('*').remove();

    const radius = size / 2;
    const strokeWidth = size / 10;
    const innerRadius = radius - strokeWidth;

    const g = svg.append('g')
      .attr('transform', `translate(${radius},${radius})`);

    // Background circle
    g.append('circle')
      .attr('r', innerRadius)
      .attr('fill', 'none')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', strokeWidth);

    // Progress arc
    const arc = d3.arc()
      .innerRadius(innerRadius - strokeWidth / 2)
      .outerRadius(innerRadius + strokeWidth / 2)
      .startAngle(0);

    const progressPath = g.append('path')
      .datum({ endAngle: 0 })
      .attr('d', arc as any)
      .attr('fill', 'url(#progressGradient)');

    // Gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'progressGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', -innerRadius)
      .attr('y1', 0)
      .attr('x2', innerRadius)
      .attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2');

    // Animate
    progressPath.transition()
      .duration(1500)
      .attrTween('d', function(d: any) {
        const interpolate = d3.interpolate(d.endAngle, (progress / 100) * 2 * Math.PI);
        return function(t: number) {
          d.endAngle = interpolate(t);
          return (arc as any)(d);
        };
      });

    // Center text
    const text = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', size / 5)
      .attr('font-weight', 'bold')
      .attr('fill', '#333');

    text.transition()
      .duration(1500)
      .tween('text', function() {
        const interpolate = d3.interpolate(0, progress);
        return function(t: number) {
          this.textContent = Math.round(interpolate(t)) + '%';
        };
      });
  }, [progress, size]);

  return <svg ref={svgRef} />;
}
```

## Key D3 Concepts for Custom Visualizations

| Concept | Description | Use Case |
|---------|-------------|----------|
| **Selections** | Select and manipulate DOM elements | Building blocks of all visualizations |
| **Scales** | Map data to visual properties | Convert data values to positions/colors |
| **Axes** | Create axis components | Add context to charts |
| **Shapes** | Generate path data | Create custom geometric shapes |
| **Transitions** | Animate changes | Smooth updates and interactions |
| **Forces** | Physics simulations | Network and particle effects |
| **Geo** | Geographic projections | Map visualizations |

## Use Cases for Custom Visualizations

- **Dashboard Widgets**: Unique KPI displays
- **Process Flows**: Custom business process diagrams
- **Interactive Infographics**: Engaging data stories
- **Real-time Monitors**: Live data dashboards
- **Specialized Charts**: Industry-specific visualizations
- **Data Art**: Creative data representations

## Documentation Links
📚 [D3.js Official Documentation](https://d3js.org/)
📚 [D3 Gallery](https://observablehq.com/@d3/gallery)
📚 [D3 Tutorials](https://observablehq.com/@d3/learn-d3)

## Tips for Custom Visualizations
- Start with SVG understanding
- Use D3's modular approach
- Implement responsive design with viewBox
- Add meaningful transitions
- Consider performance with large datasets
- Test across different screen sizes
- Document your custom components
- Build reusable visualization functions