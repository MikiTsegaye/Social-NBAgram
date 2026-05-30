import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TeamStatsPieChart = ({ team = 'Lakers', title = null }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Team-specific data and colors
  const getTeamData = (teamName) => {
    const teams = {
      'Los Angeles Lakers': {
        colors: { primary: '#552583', secondary: '#FDB927', accent1: '#ffffff', accent2: '#e0b327' },
        stats: [
          { label: 'Points', value: 2850, color: '#552583' },
          { label: 'Rebounds', value: 1520, color: '#FDB927' },
          { label: 'Assists', value: 1680, color: '#ffffff' },
          { label: 'Steals', value: 620, color: '#e0b327' },
        ],
      },
      'Chicago Bulls': {
        colors: { primary: '#a10707', secondary: '#ffffff', accent1: '#d1d1d1', accent2: '#9e9999' },
        stats: [
          { label: 'Points', value: 2720, color: '#a10707' },
          { label: 'Rebounds', value: 1480, color: '#ffffff' },
          { label: 'Assists', value: 1620, color: '#d1d1d1' },
          { label: 'Steals', value: 590, color: '#9e9999' },
        ],
      },
      'Golden State Warriors': {
        colors: { primary: '#1d428a', secondary: '#ffc72c', accent1: '#ffffff', accent2: '#f9c70b' },
        stats: [
          { label: 'Points', value: 2900, color: '#1d428a' },
          { label: 'Rebounds', value: 1450, color: '#ffc72c' },
          { label: 'Assists', value: 1750, color: '#ffffff' },
          { label: 'Steals', value: 610, color: '#f9c70b' },
        ],
      },
      "Boston Celtics": {
        colors: { primary: '#007a33', secondary: '#ba9653', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [
          { label: 'Points', value: 2680, color: '#007a33' },
          { label: 'Rebounds', value: 1420, color: '#ba9653' },
          { label: 'Assists', value: 1580, color: '#ffffff' },
          { label: 'Steals', value: 570, color: '#9e9e9e' },
        ],
      },
      'Miami Heat': {
        colors: { primary: '#98002e', secondary: '#f9a01b', accent1: '#ffffff', accent2: '#e0b327' },
        stats: [
          { label: 'Points', value: 2750, color: '#98002e' },
          { label: 'Rebounds', value: 1400, color: '#f9a01b' },
          { label: 'Assists', value: 1600, color: '#ffffff' },
          { label: 'Steals', value: 580, color: '#e0b327' },
        ],
      },
      "oklahoma city thunder": {
        colors: { primary: '#007ac1', secondary: '#f05133', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [
          { label: 'Points', value: 2750, color: '#007ac1' },
          { label: 'Rebounds', value: 1400, color: '#f05133' },
          { label: 'Assists', value: 1600, color: '#ffffff' },
          { label: 'Steals', value: 580, color: '#9e9e9e' },
        ],
      },
      "New York Knicks": {
        colors: { primary: '#006bb6', secondary: '#f58426', accent1: '#ffffff', accent2: '#e0b327' },
        stats: [ 
          { label: 'Points', value: 2650, color: '#006bb6' },
          { label: 'Rebounds', value: 1380, color: '#f58426' },
          { label: 'Assists', value: 1550, color: '#ffffff' },
          { label: 'Steals', value: 550, color: '#e0b327' },
        ],
    },
    "Portland Trail Blazers": {
      colors: { primary: '#e03a3e', secondary: '#000000', accent1: '#ffffff', accent2: '#9e9e9e' },
      stats: [ 
        { label: 'Points', value: 2700, color: '#e03a3e' },
        { label: 'Rebounds', value: 1350, color: '#000000' },
        { label: 'Assists', value: 1500, color: '#ffffff' }, 
        { label: 'Steals', value: 540, color: '#9e9e9e' },
      ],
    },
    "Philadelphia 76ers": {
      colors: { primary: '#006bb6', secondary: '#ed174c', accent1: '#ffffff', accent2: '#e0b327' },
      stats: [
        { label: 'Points', value: 2800, color: '#006bb6' },
        { label: 'Rebounds', value: 1320, color: '#ed174c' },
        { label: 'Assists', value: 1480, color: '#ffffff' }, 
        { label: 'Steals', value: 530, color: '#e0b327' },
      ],
    },
    "San Antonio Spurs": {
      colors: { primary: '#000000', secondary: '#c4ced4', accent1: '#ffffff', accent2: '#9e9e9e' },
      stats: [
        { label: 'Points', value: 2650, color: '#000000' },
        { label: 'Rebounds', value: 1300, color: '#c4ced4' },
        { label: 'Assists', value: 1450, color: '#ffffff' },
        { label: 'Steals', value: 520, color: '#9e9e9e' },
      ],
    },
    "Houston Rockets": {
      colors: { primary: '#ce1141', secondary: '#000000', accent1: '#ffffff', accent2: '#e0b327' },
      stats: [
        { label: 'Points', value: 2750, color: '#ce1141' },
        { label: 'Rebounds', value: 1280, color: '#000000' },
        { label: 'Assists', value: 1420, color: '#ffffff' },
        { label: 'Steals', value: 510, color: '#e0b327' },
      ],
    },
    "Dallas Mavericks": {
      colors: { primary: '#00538c', secondary: '#b8c4ca', accent1: '#ffffff', accent2: '#9e9e9e' },
      stats: [
        { label: 'Points', value: 2700, color: '#00538c' },
        { label: 'Rebounds', value: 1250, color: '#b8c4ca' },
        { label: 'Assists', value: 1400, color: '#ffffff' },
        { label: 'Steals', value: 500, color: '#9e9e9e' },
      ],
    },
    "Detroit Pistons": {
      colors: { primary: '#c8102e', secondary: '#1d42ba', accent1: '#ffffff', accent2: '#e0b327' },
      stats: [
        { label: 'Points', value: 2650, color: '#c8102e' },
        { label: 'Rebounds', value: 1220, color: '#1d42ba' },
        { label: 'Assists', value: 1380, color: '#ffffff' },
        { label: 'Steals', value: 480, color: '#e0b327' },
      ],
    },
    "Denver Nuggets": {
      colors: { primary: '#0e2240', secondary: '#fdb927', accent1: '#ffffff', accent2: '#9e9e9e' },
      stats: [
        { label: 'Points', value: 2750, color: '#0e2240' },
        { label: 'Rebounds', value: 1200, color: '#fdb927' },
        { label: 'Assists', value: 1350, color: '#ffffff' },
        { label: 'Steals', value: 470, color: '#9e9e9e' },
      ],
    },
    "Indiana Pacers": {
      colors: { primary: '#002d62', secondary: '#ffc633', accent1: '#ffffff', accent2: '#e0b327' },
      stats: [ 
        { label: 'Points', value: 2600, color: '#002d62' },
        { label: 'Rebounds', value: 1180, color: '#ffc633' },
        { label: 'Assists', value: 1320, color: '#ffffff' },
        { label: 'Steals', value: 450, color: '#e0b327' },
      ],
    },
    "Memphis Grizzlies": {
      colors: { primary: '#5d76a9', secondary: '#fdb927', accent1: '#ffffff', accent2: '#9e9e9e' },
      stats: [ 
        { label: 'Points', value: 2650, color: '#5d76a9' },
        { label: 'Rebounds', value: 1150, color: '#fdb927' },
        { label: 'Assists', value: 1280, color: '#ffffff' },
        { label: 'Steals', value: 430, color: '#9e9e9e' },
      ],
    },
    "Minnesota Timberwolves": {
      colors: { primary: '#0c2340', secondary: '#78be20', accent1: '#ffffff', accent2: '#e0b327' },
      stats: [
        { label: 'Points', value: 2600, color: '#0c2340' },
        { label: 'Rebounds', value: 1120, color: '#78be20' },
        { label: 'Assists', value: 1250, color: '#ffffff' },  
        { label: 'Steals', value: 420, color: '#e0b327' },
      ],
    },
    "New Orleans Pelicans": {
      colors: { primary: '#002b5c', secondary: '#e31837', accent1: '#ffffff', accent2: '#9e9e9e' },
      stats: [
        { label: 'Points', value: 2550, color: '#002b5c' },
        { label: 'Rebounds', value: 1100, color: '#e31837' },
        { label: 'Assists', value: 1200, color: '#ffffff' },
        { label: 'Steals', value: 400, color: '#9e9e9e' },
      ],
    },
    "Orlando Magic": { 
      colors: { primary: '#0077c0', secondary: '#c4ced4', accent1: '#ffffff', accent2: '#e0b327' },
      stats: [
        { label: 'Points', value: 2500, color: '#0077c0' },
        { label: 'Rebounds', value: 1080, color: '#c4ced4' },
        { label: 'Assists', value: 1150, color: '#ffffff' },
        { label: 'Steals', value: 380, color: '#e0b327' },
      ],
      },
      "Toronto Raptors": {
        colors: { primary: '#ce1141', secondary: '#000000', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [
          { label: 'Points', value: 2550, color: '#ce1141' },
          { label: 'Rebounds', value: 1050, color: '#000000' },
          { label: 'Assists', value: 1100, color: '#ffffff' },
          { label: 'Steals', value: 360, color: '#9e9e9e' },
        ],
      },
      "Utah Jazz": {
        colors: { primary: '#002b5c', secondary: '#f9a01b', accent1: '#ffffff', accent2: '#e0b327' },
        stats: [
          { label: 'Points', value: 2500, color: '#002b5c' },
          { label: 'Rebounds', value: 1020, color: '#f9a01b' },
          { label: 'Assists', value: 1080, color: '#ffffff' },
          { label: 'Steals', value: 350, color: '#e0b327' },
        ],
      }, 
      "Washington Wizards": {
        colors: { primary: '#002b5c', secondary: '#e31837', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [ 
          { label: 'Points', value: 2450, color: '#002b5c' },
          { label: 'Rebounds', value: 1000, color: '#e31837' },
          { label: 'Assists', value: 1050, color: '#ffffff' },
          { label: 'Steals', value: 330, color: '#9e9e9e' },
        ],
      },
      "Atlanta Hawks": {
        colors: { primary: '#e03a3e', secondary: '#000000', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [
          { label: 'Points', value: 2500, color: '#e03a3e' },
          { label: 'Rebounds', value: 980, color: '#000000' },
          { label: 'Assists', value: 1000, color: '#ffffff' },
          { label: 'Steals', value: 300, color: '#9e9e9e' },
        ],
      },
      "Cleveland Cavaliers": {
        colors: { primary: '#6f263d', secondary: '#ffb81c', accent1: '#ffffff', accent2: '#e0b327' },
        stats: [
          { label: 'Points', value: 2450, color: '#6f263d' },
          { label: 'Rebounds', value: 950, color: '#ffb81c' },
          { label: 'Assists', value: 980, color: '#ffffff' },
          { label: 'Steals', value: 290, color: '#e0b327' },
        ],
      },
      "Charlotte Hornets": {
        colors: { primary: '#1d1160', secondary: '#00788c', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [
          { label: 'Points', value: 2400, color: '#1d1160' },
          { label: 'Rebounds', value: 920, color: '#00788c' },
          { label: 'Assists', value: 950, color: '#ffffff' },
          { label: 'Steals', value: 280, color: '#9e9e9e' },
        ],
      },  
      "Brooklyn Nets": {
        colors: { primary: '#000000', secondary: '#ffffff', accent1: '#e0b327', accent2: '#9e9e9e' },
        stats: [
          { label: 'Points', value: 2400, color: '#000000' },
          { label: 'Rebounds', value: 900, color: '#ffffff' },
          { label: 'Assists', value: 920, color: '#e0b327' }, 
          { label: 'Steals', value: 270, color: '#9e9e9e' },
        ],
      },
      "Los Angeles Clippers": {
        colors: { primary: '#c8102e', secondary: '#1d428a', accent1: '#ffffff', accent2: '#9e9e9e' },
        stats: [  
          { label: 'Points', value: 2350, color: '#c8102e' },
          { label: 'Rebounds', value: 880, color: '#1d428a' },
          { label: 'Assists', value: 900, color: '#ffffff' },
          { label: 'Steals', value: 250, color: '#9e9e9e' },
        ],
      },
    };

    return teams[teamName] || teams['Los Angeles Lakers'];
  };

  const teamData = getTeamData(team);
  const mockData = teamData.stats;
  const coloredData = mockData;
  const chartTitle = title || `${team} Season Stats`;
  const themePrimary = teamData.colors.primary;
  const themeSecondary = teamData.colors.secondary;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.min(containerWidth, 500);

    // SVG dimensions
    const margin = 40;
    const radius = Math.min(containerWidth, containerHeight) / 2 - margin;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('background', '#0a0a0a')
      .style('border-radius', '12px');

    // Create group for pie chart
    const g = svg
      .append('g')
      .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);

    // Pie generator
    const pie = d3.pie().value((d) => d.value);
    const arc = d3
      .arc()
      .innerRadius(radius * 0.4) // Donut chart
      .outerRadius(radius);

    // Create pie slices
    const slices = g
      .selectAll('.slice')
      .data(pie(coloredData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    // Add paths
    slices
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', themePrimary)
      .attr('stroke-width', 2)
      .style('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('d', d3.arc()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 1.1));
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .attr('d', arc);
      });

    // Add labels with values
    slices
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#0a0a0a')
      .attr('font-weight', 'bold')
      .attr('font-size', '13px')
      .text((d) => `${d.data.label}`);

    // Add legend
    const legendX = -containerWidth / 2 + 20;
    const legendY = -containerHeight / 2 + 30;
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    const legendItems = legend
      .selectAll('.legend-item')
      .data(coloredData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 24})`);

    legendItems
      .append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', (d) => d.color)
      .attr('rx', 2);

    legendItems
      .append('text')
      .attr('x', 24)
      .attr('y', 12)
      .attr('font-size', '13px')
      .attr('fill', '#ffffff')
      .attr('font-weight', '500')
      .text((d) => `${d.label}: ${d.value.toLocaleString()}`);

    // Add title
    svg
      .append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', themeSecondary)
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .text(chartTitle);
  }, [chartTitle, team, coloredData, themePrimary, themeSecondary]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '14px',
        minHeight: '500px',
      }}
    >
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default TeamStatsPieChart;
