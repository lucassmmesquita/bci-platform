import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

const TREND_NODES = [
  { id: 't1', label: 'IoT', group: 'trend', color: '#0A5DC2' },
  { id: 't2', label: 'IA e Machine Learning', group: 'trend', color: '#7C5CFC' },
  { id: 't3', label: 'Automação e Controle', group: 'trend', color: '#00C48C' },
  { id: 't4', label: 'Infraestrutura de Redes', group: 'trend', color: '#FF8C42' },
  { id: 't5', label: 'Big Data e Analytics', group: 'trend', color: '#FF4757' },
];

const STARTUP_NODES = [
  { id: 's1', label: 'A2I Tech', group: 'startup' },
  { id: 's2', label: 'NuHealth', group: 'startup' },
  { id: 's3', label: 'AgriSmart', group: 'startup' },
  { id: 's4', label: 'FinPay', group: 'startup' },
  { id: 's5', label: 'GreenErgy', group: 'startup' },
  { id: 's6', label: 'CyberShield', group: 'startup' },
  { id: 's7', label: 'LegalFlow', group: 'startup' },
  { id: 's8', label: 'HRHub', group: 'startup' },
  { id: 's9', label: 'LogMove', group: 'startup' },
  { id: 's10', label: 'GovDigital', group: 'startup' },
  { id: 's11', label: 'EduSpark', group: 'startup' },
  { id: 's12', label: 'Insurify', group: 'startup' },
  { id: 's13', label: 'BioDetect', group: 'startup' },
  { id: 's14', label: 'PropView', group: 'startup' },
  { id: 's15', label: 'FoodChain', group: 'startup' },
];

const LINKS_DATA = [
  // IoT
  { source: 't1', target: 's3' }, { source: 't1', target: 's5' }, { source: 't1', target: 's9' }, { source: 't1', target: 's13' },
  // IA / ML
  { source: 't2', target: 's1' }, { source: 't2', target: 's2' }, { source: 't2', target: 's6' }, { source: 't2', target: 's7' }, { source: 't2', target: 's8' }, { source: 't2', target: 's12' },
  // Automação
  { source: 't3', target: 's1' }, { source: 't3', target: 's5' }, { source: 't3', target: 's9' }, { source: 't3', target: 's10' },
  // Redes
  { source: 't4', target: 's4' }, { source: 't4', target: 's6' }, { source: 't4', target: 's10' }, { source: 't4', target: 's14' },
  // Big Data
  { source: 't5', target: 's2' }, { source: 't5', target: 's3' }, { source: 't5', target: 's4' }, { source: 't5', target: 's7' }, { source: 't5', target: 's8' }, { source: 't5', target: 's9' },
  // Cross-trend links (faint)
  { source: 't1', target: 't3', type: 'trend-link' },
  { source: 't2', target: 't5', type: 'trend-link' },
  { source: 't3', target: 't4', type: 'trend-link' },
  { source: 't1', target: 't5', type: 'trend-link' },
];

export default function ObsidianGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const simRef = useRef(null);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width: Math.max(400, width), height: Math.max(380, Math.min(550, width * 0.65)) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dimensions;

    // Clear
    d3.select(svgRef.current).selectAll('*').remove();

    const nodes = [...TREND_NODES, ...STARTUP_NODES].map(n => ({ ...n }));
    const links = LINKS_DATA.map(l => ({ ...l }));

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', '#FAFBFD');

    // Defs
    const defs = svg.append('defs');
    // Glow filter
    const glow = defs.append('filter').attr('id', 'node-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Container for zoom
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.type === 'trend-link' ? 180 : 100).strength(d => d.type === 'trend-link' ? 0.1 : 0.4))
      .force('charge', d3.forceManyBody().strength(d => d.group === 'trend' ? -400 : -150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.group === 'trend' ? 45 : 22))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    simRef.current = simulation;

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        if (d.type === 'trend-link') return '#E2E6EE';
        const src = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        return src?.color || '#334';
      })
      .attr('stroke-opacity', d => d.type === 'trend-link' ? 0.6 : 0.25)
      .attr('stroke-width', d => d.type === 'trend-link' ? 1 : 1.5)
      .attr('stroke-dasharray', d => d.type === 'trend-link' ? '4 4' : 'none');

    // Node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    // Outer glow circle (trend only)
    node.filter(d => d.group === 'trend')
      .append('circle')
      .attr('r', 34)
      .attr('fill', d => d.color)
      .attr('opacity', 0.08);

    // Main circle
    node.append('circle')
      .attr('r', d => d.group === 'trend' ? 30 : 12)
      .attr('fill', d => d.group === 'trend' ? d.color : '#4A6FA5')
      .attr('stroke', d => d.group === 'trend' ? '#fff' : 'rgba(255,255,255,0.6)')
      .attr('stroke-width', d => d.group === 'trend' ? 2.5 : 1.5)
      .attr('filter', d => d.group === 'trend' ? 'url(#node-glow)' : null);

    // Labels
    node.append('text')
      .text(d => d.label)
      .attr('dy', d => d.group === 'trend' ? 48 : 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.group === 'trend' ? 13 : 11)
      .attr('font-weight', d => d.group === 'trend' ? 700 : 600)
      .attr('fill', d => d.group === 'trend' ? d.color : '#5A6478')
      .attr('font-family', "'Plus Jakarta Sans', sans-serif")
      .attr('pointer-events', 'none');

    // Trend icon text inside
    node.filter(d => d.group === 'trend')
      .append('text')
      .text(d => d.label.charAt(0))
      .attr('dy', 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 800)
      .attr('fill', '#fff')
      .attr('font-family', "'Plus Jakarta Sans', sans-serif")
      .attr('pointer-events', 'none');

    // Startup initial inside circle
    node.filter(d => d.group === 'startup')
      .append('text')
      .text(d => d.label.charAt(0))
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', '#fff')
      .attr('font-family', "'Plus Jakarta Sans', sans-serif")
      .attr('pointer-events', 'none');

    // Hover interactions
    node.on('mouseover', function (event, d) {
      // Highlight connected links
      link.attr('stroke-opacity', l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id || tId === d.id) return 0.8;
        return l.type === 'trend-link' ? 0.3 : 0.06;
      }).attr('stroke-width', l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id || tId === d.id) return 2.5;
        return l.type === 'trend-link' ? 1 : 1.5;
      }).attr('stroke', l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id || tId === d.id) {
          const trendNode = nodes.find(n => n.group === 'trend' && (n.id === sId || n.id === tId));
          return trendNode?.color || '#4A6FA5';
        }
        if (l.type === 'trend-link') return '#E2E6EE';
        return '#CCD3DE';
      });

      // Dim non-connected nodes
      const connectedIds = new Set([d.id]);
      links.forEach(l => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        if (sId === d.id) connectedIds.add(tId);
        if (tId === d.id) connectedIds.add(sId);
      });

      node.select('circle:last-of-type')
        .attr('opacity', n => connectedIds.has(n.id) ? 1 : 0.15);
      node.selectAll('text')
        .attr('opacity', n => connectedIds.has(n.id) ? 1 : 0.15);

      // Scale up hovered node
      d3.select(this).select('circle:last-of-type')
        .transition().duration(150)
        .attr('r', d.group === 'trend' ? 34 : 16);
    })
    .on('mouseout', function () {
      link.attr('stroke-opacity', l => l.type === 'trend-link' ? 0.6 : 0.25)
        .attr('stroke-width', l => l.type === 'trend-link' ? 1 : 1.5)
        .attr('stroke', l => {
          if (l.type === 'trend-link') return '#E2E6EE';
          const src = nodes.find(n => n.id === (typeof l.source === 'object' ? l.source.id : l.source));
          return src?.color || '#CCD3DE';
        });
      node.select('circle:last-of-type').attr('opacity', 1);
      node.selectAll('text').attr('opacity', 1);
      d3.select(this).select('circle:last-of-type')
        .transition().duration(150)
        .attr('r', d => d.group === 'trend' ? 30 : 12);
    });

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(16, ${height - 28})`);
    legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 7).attr('fill', '#7C5CFC');
    legend.append('text').attr('x', 12).attr('y', 5).text('Tendência Gov').attr('fill', '#6B7280').attr('font-size', 11).attr('font-weight', 600).attr('font-family', "'Plus Jakarta Sans', sans-serif");
    legend.append('circle').attr('cx', 130).attr('cy', 0).attr('r', 5).attr('fill', '#4A6FA5');
    legend.append('text').attr('x', 140).attr('y', 5).text('Startup').attr('fill', '#6B7280').attr('font-size', 11).attr('font-weight', 600).attr('font-family', "'Plus Jakarta Sans', sans-serif");
    legend.append('text').attr('x', width - 32).attr('y', 5).text('Arraste os nós • Scroll para zoom').attr('fill', '#9AA1B4').attr('font-size', 10).attr('text-anchor', 'end').attr('font-family', "'Plus Jakarta Sans', sans-serif");

    return () => simulation.stop();
  }, [dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#FAFBFD', border: '1px solid var(--g200)' }}>
      <svg ref={svgRef} style={{ width: '100%', height: dimensions.height, display: 'block' }} />
    </div>
  );
}
