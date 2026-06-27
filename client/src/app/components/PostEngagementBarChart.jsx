import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import api from '../../services/api';

const PostEngagementBarChart = ({ team = 'Lakers', title = null }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const normalizePosts = useCallback((response) => {
    const posts = Array.isArray(response)
      ? response
      : Array.isArray(response.posts)
      ? response.posts
      : response.data || [];

    const targetTeam = String(team || '').trim().toLowerCase();

    return posts
      .filter((post) => {
        if (!targetTeam) return true;
        const postTeam = String(post.teamTag || post.team || '').trim().toLowerCase();
        return postTeam.includes(targetTeam);
      })
      .map((post, index) => {
        const id = String(post._id || post.id || `post-${index}`);
        const label = `Post ${index + 1}`;
        const likes = Array.isArray(post.likes) ? post.likes.length : Number(post.likes || 0);
        const comments = Array.isArray(post.comments) ? post.comments.length : Number(post.comments || 0);

        return { id, label, likes, comments };
      });
  }, [team]);

  useEffect(() => {
    
    setLoading(true);
    setError(null);

    api.getFeed()
      .done((data) => {
        const processed = normalizePosts(data);
        setChartData(processed);
      })
      .fail((xhr) => {
        const message = xhr?.responseJSON?.message || xhr?.statusText || 'Failed to load engagement data';
        setError(message);
      })
      .always(() => {
        setLoading(false);
      });
  }, [normalizePosts]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const displayData = chartData.length > 0 ? chartData : [{ label: 'No posts', likes: 0, comments: 0 }];
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.max(480, containerWidth * 0.7);
    const margin = { top: 66, right: 34, bottom: 86, left: 64 };
    const width = Math.max(0, containerWidth - margin.left - margin.right);
    const height = Math.max(0, containerHeight - margin.top - margin.bottom);

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('background', '#0a0a0a')
      .style('border-radius', '12px');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(displayData.map((d) => d.label))
      .range([0, width])
      .padding(0.24);

    const maxValue = d3.max(displayData, (d) => Math.max(d.likes, d.comments)) || 0;
    const maxInt = Math.max(1, Math.ceil(maxValue));
    const yScale = d3
      .scaleLinear()
      .domain([0, maxInt])
      .range([height, 0]);

    const yTicks = maxInt <= 8 ? d3.range(0, maxInt + 1) : d3.ticks(0, maxInt, 6).map(Math.round).filter((value, index, array) => array.indexOf(value) === index);

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .attr('color', '#999')
      .selectAll('text')
      .attr('fill', '#ddd')
      .style('font-size', '12px')
      .style('text-anchor', 'middle');

    g.append('g')
      .call(d3.axisLeft(yScale).tickValues(yTicks).tickSize(-width).tickFormat(d3.format('d')))
      .attr('color', '#999')
      .selectAll('text')
      .attr('fill', '#ddd')
      .style('font-size', '12px');

    g.selectAll('.domain').attr('stroke', '#444');
    g.selectAll('.tick line').attr('stroke', '#333');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -48)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', TOOLTIP_COLOR)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text('Total Engagement');

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

    const groups = g
      .selectAll('.bar-group')
      .data(displayData)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(${xScale(d.label)}, 0)`);

    const barWidth = xScale.bandwidth() / 2 - 4;

    groups
      .append('rect')
      .attr('class', 'bar-likes')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.likes))
      .attr('width', barWidth)
      .attr('height', (d) => height - yScale(d.likes))
      .attr('fill', PRIMARY_COLOR)
      .attr('rx', 4)
      .attr('opacity', 0.88)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('fill', SECONDARY_COLOR).attr('opacity', 1);
        svg
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', margin.left + xScale(d.label) + barWidth / 2)
          .attr('y', margin.top + yScale(d.likes) - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', SECONDARY_COLOR)
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .text(`${d.likes} likes`);
      })
      .on('mouseleave', () => {
        d3.selectAll('.bar-likes').attr('fill', PRIMARY_COLOR).attr('opacity', 0.88);
        svg.selectAll('.tooltip').remove();
      });

    groups
      .append('rect')
      .attr('class', 'bar-comments')
      .attr('x', barWidth + 6)
      .attr('y', (d) => yScale(d.comments))
      .attr('width', barWidth)
      .attr('height', (d) => height - yScale(d.comments))
      .attr('fill', SECONDARY_COLOR)
      .attr('rx', 4)
      .attr('opacity', 0.88)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('fill', TOOLTIP_COLOR).attr('opacity', 1);
        svg
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', margin.left + xScale(d.label) + barWidth + barWidth / 2 + 6)
          .attr('y', margin.top + yScale(d.comments) - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', TOOLTIP_COLOR)
          .attr('font-size', '12px')
          .attr('font-weight', '700')
          .text(`${d.comments} comments`);
      })
      .on('mouseleave', () => {
        d3.selectAll('.bar-comments').attr('fill', SECONDARY_COLOR).attr('opacity', 0.88);
        svg.selectAll('.tooltip').remove();
      });

    const legend = svg.append('g').attr('transform', `translate(${containerWidth - 510}, 10)`);
    const legendItems = legend
      .selectAll('.legend-item')
      .data([
        { label: 'Likes', color: PRIMARY_COLOR },
        { label: 'Comments', color: SECONDARY_COLOR }
      ])
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 24})`);

    legendItems.append('rect').attr('width', 14).attr('height', 14).attr('fill', (d) => d.color).attr('rx', 3);
    legendItems.append('text').attr('x', 20).attr('y', 12).attr('fill', TOOLTIP_COLOR).attr('font-size', '12px').attr('font-weight', '500').text((d) => d.label);

    svg
      .append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 32)
      .attr('text-anchor', 'middle')
      .attr('fill', SECONDARY_COLOR)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(chartTitle);

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 48)
      .attr('text-anchor', 'middle')
      .attr('fill', TOOLTIP_COLOR)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text('Posts');
  }, [chartData, chartTitle, PRIMARY_COLOR, SECONDARY_COLOR, TOOLTIP_COLOR]);

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
        minHeight: '420px',
        position: 'relative'
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', top: '18px', left: '20px', color: '#ddd', fontSize: '0.95rem' }}>
          Loading engagement data...
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', top: '18px', left: '20px', color: '#ff7b7b', fontSize: '0.95rem' }}>
          {error}
        </div>
      )}
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PostEngagementBarChart;
