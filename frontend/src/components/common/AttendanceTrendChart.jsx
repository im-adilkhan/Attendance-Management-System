const COLORS = { present: '#3b68e8', late: '#f2a33a', absent: '#d9e0ed' };

export default function AttendanceTrendChart({ days = [], title = 'Attendance trend' }) {
  const width = 700; const height = 230; const left = 34; const right = 12; const top = 16; const bottom = 34;
  const graphHeight = height - top - bottom; const graphWidth = width - left - right;
  const max = Math.max(1, ...days.flatMap((day) => [day.present || 0, day.late || 0, day.absent || 0]));
  const groupWidth = graphWidth / Math.max(days.length, 1); const barWidth = Math.max(2, Math.min(12, groupWidth * .2));
  const series = ['present', 'late', 'absent'];
  return <section className="panel chart-panel" aria-label={title}>
    <div className="chart-heading"><div><p className="eyebrow">CAMPUS ACTIVITY</p><h2>{title}</h2></div><div className="chart-legend">{series.map((key) => <span key={key}><i style={{ background: COLORS[key] }} />{key[0].toUpperCase() + key.slice(1)}</span>)}</div></div>
    {days.length ? <div className="chart-scroll"><svg className="attendance-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={days.map((day) => `${day.date}: ${day.present || 0} present, ${day.late || 0} late, ${day.absent || 0} absent`).join('; ')}>
      {[0, .5, 1].map((step) => { const y = top + graphHeight * step; return <g key={step}><line x1={left} y1={y} x2={width - right} y2={y} className="chart-gridline" /><text x={left - 8} y={y + 4} textAnchor="end" className="chart-axis-label">{Math.round(max * (1 - step))}</text></g>; })}
      {days.map((day, index) => {
        const center = left + groupWidth * (index + .5);
        return <g key={day.date}>
          {series.map((key, seriesIndex) => { const value = Number(day[key] || 0); const barHeight = Math.max(value ? 2 : 0, (value / max) * graphHeight); return <rect key={key} x={center + (seriesIndex - 1) * (barWidth + 2) - barWidth / 2} y={top + graphHeight - barHeight} width={barWidth} height={barHeight} rx="3" fill={COLORS[key]}><title>{`${day.date}: ${value} ${key}`}</title></rect>; })}
          {(index === 0 || index === days.length - 1 || index % Math.ceil(days.length / 7) === 0) && <text x={center} y={height - 8} textAnchor="middle" className="chart-axis-label">{day.date.slice(-2)}</text>}
        </g>;
      })}
    </svg></div> : <p className="page-state">No attendance trend data available yet.</p>}
  </section>;
}
