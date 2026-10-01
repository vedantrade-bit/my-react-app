/**
 * TelemetryChart - High-performance Vanilla HTML5 Canvas Real-Time Chart
 * Features: High-DPI crisp rendering, smooth gradient fills, interactive hover crosshair & tooltip
 */
class TelemetryChart {
  constructor(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = document.getElementById(tooltipId);
    this.points = [];
    this.activeMetric = 'throughput'; // 'throughput' | 'cpu' | 'latency'
    this.hoverIndex = -1;
    this.dpr = window.devicePixelRatio || 1;

    this.colorSchemes = {
      throughput: {
        stroke: '#06b6d4',
        fillStart: 'rgba(6, 182, 212, 0.35)',
        fillEnd: 'rgba(6, 182, 212, 0.00)',
        glow: 'rgba(6, 182, 212, 0.6)',
        unit: ' req/s',
        label: 'Throughput'
      },
      cpu: {
        stroke: '#8b5cf6',
        fillStart: 'rgba(139, 92, 246, 0.35)',
        fillEnd: 'rgba(139, 92, 246, 0.00)',
        glow: 'rgba(139, 92, 246, 0.6)',
        unit: '%',
        label: 'CPU Utilization'
      },
      latency: {
        stroke: '#f59e0b',
        fillStart: 'rgba(245, 158, 11, 0.35)',
        fillEnd: 'rgba(245, 158, 11, 0.00)',
        glow: 'rgba(245, 158, 11, 0.6)',
        unit: ' ms',
        label: 'Edge Latency'
      }
    };

    this.initEvents();
    this.resize();
  }

  setMetric(metric) {
    if (this.colorSchemes[metric]) {
      this.activeMetric = metric;
      this.render();
      this.updateRibbonStats();
    }
  }

  setData(points) {
    this.points = points;
    this.render();
    this.updateRibbonStats();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.scale(this.dpr, this.dpr);
    this.render();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Interactive mouse hover crosshair
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.points || this.points.length < 2) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const padding = { left: 40, right: 20 };
      const chartWidth = this.width - padding.left - padding.right;

      if (mouseX < padding.left || mouseX > this.width - padding.right) {
        this.hoverIndex = -1;
        this.hideTooltip();
        this.render();
        return;
      }

      const relativeX = (mouseX - padding.left) / chartWidth;
      const index = Math.round(relativeX * (this.points.length - 1));
      this.hoverIndex = Math.max(0, Math.min(index, this.points.length - 1));

      this.render();
      this.showTooltip(this.hoverIndex, mouseX, e.clientY - rect.top);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this.hideTooltip();
      this.render();
    });
  }

  showTooltip(index, x, y) {
    if (!this.tooltip || !this.points[index]) return;
    const pt = this.points[index];
    const scheme = this.colorSchemes[this.activeMetric];
    const val = pt[this.activeMetric];

    this.tooltip.innerHTML = `
      <div style="color: #94a3b8; font-size: 0.7rem; margin-bottom: 2px;">${pt.time}</div>
      <div style="font-weight: 700; color: ${scheme.stroke}; font-size: 0.9rem;">
        ${val}${scheme.unit}
      </div>
    `;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${Math.max(20, y)}px`;
    this.tooltip.style.opacity = '1';
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
    }
  }

  updateRibbonStats() {
    if (!this.points || this.points.length === 0) return;
    const values = this.points.map(p => p[this.activeMetric] || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(1);
    const scheme = this.colorSchemes[this.activeMetric];

    const maxEl = document.getElementById('chartMaxPeak');
    const avgEl = document.getElementById('chartRollingAvg');
    const minEl = document.getElementById('chartLowestVal');

    if (maxEl) maxEl.textContent = `${max}${scheme.unit}`;
    if (avgEl) avgEl.textContent = `${avg}${scheme.unit}`;
    if (minEl) minEl.textContent = `${min}${scheme.unit}`;
  }

  render() {
    if (!this.ctx || !this.points || this.points.length < 2) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const padding = { top: 25, right: 25, bottom: 35, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    // Compute range
    const values = this.points.map(p => p[this.activeMetric]);
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);

    // Add 15% headroom
    const range = (maxVal - minVal) || 1;
    minVal = Math.max(0, Math.floor(minVal - range * 0.15));
    maxVal = Math.ceil(maxVal + range * 0.15);

    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
    const getX = (idx) => padding.left + (idx / (this.points.length - 1)) * chartW;

    // Draw Subtle Horizontal Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const stepVal = Math.round(minVal + (i / gridSteps) * (maxVal - minVal));
      const y = padding.top + chartH - (i / gridSteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillText(stepVal, padding.left - 8, y);
    }

    // Time Axis Labels (Show first, middle, last)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const sampleIndices = [0, Math.floor(this.points.length / 2), this.points.length - 1];
    sampleIndices.forEach(idx => {
      if (this.points[idx]) {
        const x = getX(idx);
        ctx.fillText(this.points[idx].time, x, h - padding.bottom + 8);
      }
    });

    const scheme = this.colorSchemes[this.activeMetric];

    // Build Area Path
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(this.points[0][this.activeMetric]));

    for (let i = 1; i < this.points.length; i++) {
      // Smooth cubic bezier interpolation
      const prevX = getX(i - 1);
      const prevY = getY(this.points[i - 1][this.activeMetric]);
      const currX = getX(i);
      const currY = getY(this.points[i][this.activeMetric]);
      const midX = (prevX + currX) / 2;

      ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
    }

    // Fill under line with gradient
    const areaPath = new Path2D(ctx);
    areaPath.lineTo(getX(this.points.length - 1), padding.top + chartH);
    areaPath.lineTo(getX(0), padding.top + chartH);
    areaPath.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, scheme.fillStart);
    gradient.addColorStop(1, scheme.fillEnd);

    ctx.fillStyle = gradient;
    ctx.fill(areaPath);

    // Stroke line with glow
    ctx.save();
    ctx.shadowColor = scheme.glow;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = scheme.stroke;
    ctx.stroke();
    ctx.restore();

    // Render interactive hover indicator
    if (this.hoverIndex >= 0 && this.points[this.hoverIndex]) {
      const hx = getX(this.hoverIndex);
      const hy = getY(this.points[this.hoverIndex][this.activeMetric]);

      // Vertical guide line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.moveTo(hx, padding.top);
      ctx.lineTo(hx, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer halo
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fillStyle = scheme.stroke;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Solid central point
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = scheme.stroke;
      ctx.stroke();
    }
  }
}

window.TelemetryChart = TelemetryChart;
