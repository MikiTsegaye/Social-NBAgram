import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PostEngagementBarChart = ({ team = 'Lakers', title = null }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const getTeamBrand = (teamName) => {
    const normalized = String(teamName || '').trim().toLowerCase();
    const brands = {
      'lakers': { primary: '#552583', secondary: '#FDB927', accent: '#ffffff' },
      'los angeles lakers': { primary: '#552583', secondary: '#FDB927', accent: '#ffffff' },
      'warriors': { primary: '#1d428a', secondary: '#ffc72c', accent: '#ffffff' },
      'golden state warriors': { primary: '#1d428a', secondary: '#ffc72c', accent: '#ffffff' },
      'bulls': { primary: '#a10707', secondary: '#ffffff', accent: '#ffffff' },
      'chicago bulls': { primary: '#a10707', secondary: '#ffffff', accent: '#ffffff' },
      'nets': { primary: '#000000', secondary: '#ffffff', accent: '#ffffff' },
      'brooklyn nets': { primary: '#000000', secondary: '#ffffff', accent: '#ffffff' },
      'heat': { primary: '#98002e', secondary: '#f9a01b', accent: '#ffffff' },
      'miami heat': { primary: '#98002e', secondary: '#f9a01b', accent: '#ffffff' },
      'celtics': { primary: '#007a33', secondary: '#ba9653', accent: '#ffffff' },
      'boston celtics': { primary: '#007a33', secondary: '#ba9653', accent: '#ffffff' },
      'rockets': { primary: '#ce1141', secondary: '#000000', accent: '#ffffff' },
      'houston rockets': { primary: '#ce1141', secondary: '#000000', accent: '#ffffff' },
      'mavericks': { primary: '#00538c', secondary: '#b8c4ca', accent: '#ffffff' },
      'dallas mavericks': { primary: '#00538c', secondary: '#b8c4ca', accent: '#ffffff' },
      'nuggets': { primary: '#0e2240', secondary: '#fdb927', accent: '#ffffff' },
      'denver nuggets': { primary: '#0e2240', secondary: '#fdb927', accent: '#ffffff' },
      'clippers': { primary: '#c8102e', secondary: '#1d428a', accent: '#ffffff' },
      'los angeles clippers': { primary: '#c8102e', secondary: '#1d428a', accent: '#ffffff' },
      'timberwolves': { primary: '#0c2340', secondary: '#78be20', accent: '#ffffff' },
      'minnesota timberwolves': { primary: '#0c2340', secondary: '#78be20', accent: '#ffffff' },
      'pelicans': { primary: '#002b5c', secondary: '#e31837', accent: '#ffffff' },
      'new orleans pelicans': { primary: '#002b5c', secondary: '#e31837', accent: '#ffffff' },
      'spurs': { primary: '#000000', secondary: '#c4ced4', accent: '#ffffff' },
      'san antonio spurs': { primary: '#000000', secondary: '#c4ced4', accent: '#ffffff' },
      'bucks': { primary: '#00471b', secondary: '#eee1c6', accent: '#ffffff' },
      'milwaukee bucks': { primary: '#00471b', secondary: '#eee1c6', accent: '#ffffff' },
      'suns': { primary: '#1d1160', secondary: '#e56020', accent: '#ffffff' },
      'phoenix suns': { primary: '#1d1160', secondary: '#e56020', accent: '#ffffff' },
      'jazz': { primary: '#002b5c', secondary: '#f9a01b', accent: '#ffffff' },
      'utah jazz': { primary: '#002b5c', secondary: '#f9a01b', accent: '#ffffff' },
      'hornets': { primary: '#1d1160', secondary: '#00788c', accent: '#ffffff' },
      'charlotte hornets': { primary: '#1d1160', secondary: '#00788c', accent: '#ffffff' },
      'grizzlies': { primary: '#5d76a9', secondary: '#fdb927', accent: '#ffffff' },
      'memphis grizzlies': { primary: '#5d76a9', secondary: '#fdb927', accent: '#ffffff' },
      'raptors': { primary: '#ce1141', secondary: '#000000', accent: '#ffffff' },
      'toronto raptors': { primary: '#ce1141', secondary: '#000000', accent: '#ffffff' },
      'knicks': { primary: '#006bb6', secondary: '#f58426', accent: '#ffffff' },
      'new york knicks': { primary: '#006bb6', secondary: '#f58426', accent: '#ffffff' },
      'pacers': { primary: '#002d62', secondary: '#ffc633', accent: '#ffffff' },
      'indiana pacers': { primary: '#002d62', secondary: '#ffc633', accent: '#ffffff' },
      'trail blazers': { primary: '#e03a3e', secondary: '#000000', accent: '#ffffff' },
      'portland trail blazers': { primary: '#e03a3e', secondary: '#000000', accent: '#ffffff' },
      'cavaliers': { primary: '#6f263d', secondary: '#ffb81c', accent: '#ffffff' },
      'cleveland cavaliers': { primary: '#6f263d', secondary: '#ffb81c', accent: '#ffffff' },
      'hawks': { primary: '#e03a3e', secondary: '#000000', accent: '#ffffff' },
      'atlanta hawks': { primary: '#e03a3e', secondary: '#000000', accent: '#ffffff' },
    };

    if (brands[normalized]) {
      return brands[normalized];
    }

    for (const key of Object.keys(brands)) {
      if (key && normalized.includes(key)) {
        return brands[key];
      }
    }

    return { primary: '#ff1744', secondary: '#FDB927', accent: '#ffffff' };
  };

  const teamBrand = getTeamBrand(team);
  const PRIMARY_COLOR = teamBrand.primary;
  const SECONDARY_COLOR = teamBrand.secondary;
  const TOOLTIP_COLOR = teamBrand.accent;
  const chartTitle = title || `${team} Post Engagement Analysis`;

  // mockData is defined inside useEffect to avoid changing hook dependencies

  useEffect(() => {
    // Mock data: Posts with likes and comments
    const mockData = [
      { post: 'Post 1', likes: 245, comments: 38, category: 'Game Day' },
      { post: 'Post 2', likes: 189, comments: 52, category: 'Training' },
      { post: 'Post 3', likes: 412, comments: 95, category: 'Achievement' },
      { post: 'Post 4', likes: 156, comments: 23, category: 'Update' },
      { post: 'Post 5', likes: 378, comments: 67, category: 'News' },
      { post: 'Post 6', likes: 298, comments: 45, category: 'Highlight' },
    ];
    if (!svgRef.current || !containerRef.current) return;

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.max(400, containerWidth * 0.5);

    // Margins
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('background', '#0a0a0a')
      .style('border-radius', '12px');

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(mockData.map((d) => d.post))
      .range([0, width])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(mockData, (d) => Math.max(d.likes, d.comments)) * 1.1])
      .range([height, 0]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#666')
      .style('font-size', '12px')
      .select('.domain')
      .attr('stroke', '#444');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#666')
      .style('font-size', '12px')
      .select('.domain')
      .attr('stroke', '#444');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', TOOLTIP_COLOR)
      .attr('font-size', '13px')
      .attr('font-weight', '500')
      .text('Engagement Count');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
      )
      .select('.domain')
      .remove();

    // Group bars by post
    const groups = g
      .selectAll('.post-group')
      .data(mockData)
      .enter()
      .append('g')
      .attr('class', 'post-group')
      .attr('transform', (d) => `translate(${xScale(d.post)}, 0)`);

    const barWidth = xScale.bandwidth() / 2 - 4;

    // Likes bars
    groups
      .append('rect')
      .attr('class', 'bar-likes')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.likes))
      .attr('width', barWidth)
      .attr('height', (d) => height - yScale(d.likes))
      .attr('fill', PRIMARY_COLOR)
      .attr('rx', 4)
      .style('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', SECONDARY_COLOR)
          .style('opacity', 1);

        // Show tooltip
        svg
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', margin.left + xScale(d.post) + barWidth / 2)
          .attr('y', margin.top + yScale(d.likes) - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', SECONDARY_COLOR)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(`${d.likes} likes`);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', PRIMARY_COLOR)
          .style('opacity', 0.85);

        svg.selectAll('.tooltip').remove();
      });

    // Comments bars
    groups
      .append('rect')
      .attr('class', 'bar-comments')
      .attr('x', barWidth + 6)
      .attr('y', (d) => yScale(d.comments))
      .attr('width', barWidth)
      .attr('height', (d) => height - yScale(d.comments))
      .attr('fill', SECONDARY_COLOR)
      .attr('rx', 4)
      .style('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', TOOLTIP_COLOR)
          .style('opacity', 1);

        // Show tooltip
        svg
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', margin.left + xScale(d.post) + barWidth + barWidth / 2 + 6)
          .attr('y', margin.top + yScale(d.comments) - 8)
          .attr('text-anchor', 'middle')
          .attr('fill', TOOLTIP_COLOR)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(`${d.comments} comments`);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', SECONDARY_COLOR)
          .style('opacity', 0.85);

        svg.selectAll('.tooltip').remove();
      });

    // Legend
    const legendData = [
      { label: 'Likes', color: PRIMARY_COLOR },
      { label: 'Comments', color: SECONDARY_COLOR },
    ];

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${containerWidth - 180}, 20)`);

    const legendItems = legend
      .selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 24})`);

    legendItems
      .append('rect')
      .attr('width', 14)
      .attr('height', 14)
      .attr('fill', (d) => d.color)
      .attr('rx', 2);

    legendItems
      .append('text')
      .attr('x', 22)
      .attr('y', 11)
      .attr('font-size', '12px')
      .attr('fill', TOOLTIP_COLOR)
      .attr('font-weight', '500')
      .text((d) => d.label);

    // Title
    svg
      .append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', SECONDARY_COLOR)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text(chartTitle);

    // X Axis Label (inside group to avoid bottom clipping)
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', TOOLTIP_COLOR)
      .attr('font-size', '13px')
      .attr('font-weight', '500')
      .text('Posts');
  }, [chartTitle, PRIMARY_COLOR, SECONDARY_COLOR, TOOLTIP_COLOR]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: '#111214',
        borderRadius: '14px',
        border: `1px solid ${SECONDARY_COLOR}`,
        minHeight: '400px',
      }}
    >
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default PostEngagementBarChart;
