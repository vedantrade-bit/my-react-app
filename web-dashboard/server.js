const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for the dashboard
let services = [
  { id: 'srv-1', name: 'API Gateway', category: 'Ingress & Routing', status: 'operational', latency: 14, uptime: '99.99%', region: 'us-east (N. Virginia)', port: 443 },
  { id: 'srv-2', name: 'Auth & Identity Cluster', category: 'Security & Token Auth', status: 'operational', latency: 28, uptime: '99.95%', region: 'us-east (N. Virginia)', port: 8081 },
  { id: 'srv-3', name: 'PostgreSQL Core Replica', category: 'Persistent Storage', status: 'operational', latency: 6, uptime: '100.00%', region: 'us-east-db-1', port: 5432 },
  { id: 'srv-4', name: 'Redis Cache Cluster', category: 'In-Memory Store', status: 'operational', latency: 2, uptime: '99.99%', region: 'us-east-cache', port: 6379 },
  { id: 'srv-5', name: 'Cloudflare Edge CDN', category: 'Global Content Delivery', status: 'operational', latency: 11, uptime: '99.99%', region: 'Global Edge (240 PoPs)', port: 80 },
  { id: 'srv-6', name: 'AI Inference Worker', category: 'Neural Processing Engine', status: 'operational', latency: 42, uptime: '99.85%', region: 'us-west (GPU cluster)', port: 9000 }
];

let tasks = [
  { id: 'tsk-101', title: 'Automated DB Snapshot & Replication Check', priority: 'High', status: 'completed', assignedTo: 'Node Daemon', dueDate: 'Today, 12:00 PM' },
  { id: 'tsk-102', title: 'Renew SSL/TLS Certificates on API Gateway', priority: 'Medium', status: 'pending', assignedTo: 'Security Ops', dueDate: 'Tomorrow, 09:00 AM' },
  { id: 'tsk-103', title: 'Optimize Redis Cache Memory Allocation', priority: 'Low', status: 'pending', assignedTo: 'Performance Team', dueDate: 'Friday, 04:00 PM' },
  { id: 'tsk-104', title: 'Scale AI Inference GPU Worker Pool (k8s)', priority: 'High', status: 'pending', assignedTo: 'Infra Automation', dueDate: 'Immediate' }
];

let systemLogs = [
  { id: 1, timestamp: new Date(Date.now() - 360000).toLocaleTimeString(), level: 'info', source: 'Kubelet', message: 'Node cluster health check passed across 12 pods.' },
  { id: 2, timestamp: new Date(Date.now() - 240000).toLocaleTimeString(), level: 'success', source: 'Auth Cluster', message: 'OAuth2 JWKS key rotation executed cleanly.' },
  { id: 3, timestamp: new Date(Date.now() - 150000).toLocaleTimeString(), level: 'info', source: 'CDN Edge', message: 'Global purge cache completed for static assets.' },
  { id: 4, timestamp: new Date(Date.now() - 40000).toLocaleTimeString(), level: 'warning', source: 'AI Worker', message: 'GPU VRAM hit 78% threshold during batch vectorization.' }
];

// Generate past 30 telemetry points for graphs
function generateTelemetryHistory() {
  const points = [];
  const now = Date.now();
  let baseThroughput = 1420;
  let baseCpu = 28;

  for (let i = 29; i >= 0; i--) {
    const time = new Date(now - i * 4000);
    baseThroughput += Math.floor((Math.random() - 0.48) * 120);
    if (baseThroughput < 800) baseThroughput = 850;
    if (baseThroughput > 2800) baseThroughput = 2700;

    baseCpu += Math.floor((Math.random() - 0.5) * 6);
    if (baseCpu < 15) baseCpu = 18;
    if (baseCpu > 85) baseCpu = 75;

    points.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      throughput: baseThroughput,
      cpu: baseCpu,
      latency: Math.floor(18 + Math.random() * 14)
    });
  }
  return points;
}

let telemetryData = generateTelemetryHistory();

// Periodically push a new telemetry point
setInterval(() => {
  const lastPoint = telemetryData[telemetryData.length - 1];
  let newThroughput = lastPoint ? lastPoint.throughput + Math.floor((Math.random() - 0.48) * 150) : 1500;
  if (newThroughput < 900) newThroughput = 950;
  if (newThroughput > 3200) newThroughput = 3000;

  let newCpu = lastPoint ? lastPoint.cpu + Math.floor((Math.random() - 0.5) * 8) : 32;
  if (newCpu < 18) newCpu = 20;
  if (newCpu > 88) newCpu = 82;

  const now = new Date();
  telemetryData.push({
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    throughput: newThroughput,
    cpu: newCpu,
    latency: Math.floor(16 + Math.random() * 12)
  });

  if (telemetryData.length > 30) {
    telemetryData.shift();
  }
}, 4000);

// Helper for formatted bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// --------------------------------------------------------------------------
// API Endpoints
// --------------------------------------------------------------------------

// GET /api/system - Hardware and Node runtime overview
app.get('/api/system', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);

  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  const memUsage = process.memoryUsage();

  res.json({
    status: 'success',
    data: {
      platform: `${os.type()} (${os.platform()} ${os.arch()})`,
      release: os.release(),
      hostname: os.hostname(),
      cpuModel: cpus.length ? cpus[0].model : 'Multi-Core Processor',
      cpuCores: cpus.length,
      nodeVersion: process.version,
      v8Version: process.versions.v8,
      uptimeSeconds: Math.floor(process.uptime()),
      systemUptimeSeconds: Math.floor(os.uptime()),
      memory: {
        total: formatBytes(totalMem),
        used: formatBytes(usedMem),
        free: formatBytes(freeMem),
        percentage: Number(memPercentage)
      },
      processMemory: {
        rss: formatBytes(memUsage.rss),
        heapTotal: formatBytes(memUsage.heapTotal),
        heapUsed: formatBytes(memUsage.heapUsed),
        external: formatBytes(memUsage.external)
      },
      loadAverage: loadAvg.map(val => val.toFixed(2))
    }
  });
});

// GET /api/stats - Live system metrics
app.get('/api/stats', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercentage = Number(((usedMem / totalMem) * 100).toFixed(1));

  const currentTelemetry = telemetryData[telemetryData.length - 1] || { throughput: 1540, cpu: 26, latency: 19 };

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    metrics: {
      cpuUsage: currentTelemetry.cpu,
      memoryUsagePercent: memPercentage,
      memoryUsedFormatted: formatBytes(usedMem),
      memoryTotalFormatted: formatBytes(totalMem),
      requestsPerSec: currentTelemetry.throughput,
      avgLatencyMs: currentTelemetry.latency,
      activeConnections: Math.floor(340 + Math.random() * 85),
      activeServicesCount: services.filter(s => s.status === 'operational').length,
      totalServicesCount: services.length,
      serverUptime: formatUptime(process.uptime())
    }
  });
});

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// GET /api/metrics/history - Telemetry points for canvas rendering
app.get('/api/metrics/history', (req, res) => {
  res.json({
    status: 'success',
    points: telemetryData
  });
});

// GET /api/services - Microservices list
app.get('/api/services', (req, res) => {
  res.json({
    status: 'success',
    data: services
  });
});

// POST /api/services/:id/restart - Trigger simulated reboot
app.post('/api/services/:id/restart', (req, res) => {
  const srv = services.find(s => s.id === req.params.id);
  if (!srv) {
    return res.status(404).json({ status: 'error', message: 'Service not found' });
  }

  srv.status = 'restarting';
  const logEntry = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    level: 'warning',
    source: srv.name,
    message: `Manual reboot sequence dispatched for service [${srv.id}].`
  };
  systemLogs.unshift(logEntry);

  // Return to operational after 4 seconds
  setTimeout(() => {
    srv.status = 'operational';
    srv.latency = Math.floor(8 + Math.random() * 15);
    systemLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      source: srv.name,
      message: `Service [${srv.id}] successfully initialized and passed warm health-checks.`
    });
  }, 4000);

  res.json({
    status: 'success',
    message: `Rebooting ${srv.name}...`,
    service: srv
  });
});

// GET /api/tasks - Task queue
app.get('/api/tasks', (req, res) => {
  res.json({
    status: 'success',
    data: tasks
  });
});

// POST /api/tasks - Add new task
app.post('/api/tasks', (req, res) => {
  const { title, priority, assignedTo, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ status: 'error', message: 'Task title is required' });
  }

  const newTask = {
    id: 'tsk-' + Date.now().toString().slice(-4),
    title: title.trim(),
    priority: priority || 'Medium',
    status: 'pending',
    assignedTo: assignedTo ? assignedTo.trim() : 'DevOps Engineer',
    dueDate: dueDate ? dueDate.trim() : 'Pending Queue'
  };

  tasks.unshift(newTask);

  systemLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'Task Automation',
    message: `New DevOps Task registered: "${newTask.title}" [${newTask.priority}]`
  });

  res.status(201).json({
    status: 'success',
    data: newTask
  });
});

// PATCH /api/tasks/:id/toggle - Toggle task status
app.patch('/api/tasks/:id/toggle', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ status: 'error', message: 'Task not found' });
  }

  task.status = task.status === 'completed' ? 'pending' : 'completed';

  systemLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    source: 'Task Automation',
    message: `Task [${task.id}] marked as ${task.status}.`
  });

  res.json({
    status: 'success',
    data: task
  });
});

// DELETE /api/tasks/:id - Remove task
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Task not found' });
  }

  const removed = tasks.splice(index, 1)[0];
  res.json({
    status: 'success',
    message: 'Task removed',
    data: removed
  });
});

// GET /api/logs - Live event logs
app.get('/api/logs', (req, res) => {
  res.json({
    status: 'success',
    data: systemLogs.slice(0, 25)
  });
});

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  const sseInterval = setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const currentTelemetry = telemetryData[telemetryData.length - 1] || { throughput: 1540, cpu: 26, latency: 19 };

    const payload = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      metrics: {
        cpuUsage: currentTelemetry.cpu,
        memoryUsagePercent: Number(((usedMem / totalMem) * 100).toFixed(1)),
        memoryUsedFormatted: formatBytes(usedMem),
        memoryTotalFormatted: formatBytes(totalMem),
        requestsPerSec: currentTelemetry.throughput,
        avgLatencyMs: currentTelemetry.latency,
        activeConnections: Math.floor(340 + Math.random() * 85),
        uptime: formatUptime(process.uptime())
      },
      latestTelemetry: currentTelemetry
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }, 2500);

  req.on('close', () => {
    clearInterval(sseInterval);
  });
});

// Fallback route for SPA (compatible with Express 5)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 NexusFlow Node.js Cloud Operations Dashboard Active`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`⚙️  Node Version: ${process.version} | Architecture: ${os.arch()}`);
  console.log(`======================================================\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => console.log('Process terminated gracefully.'));
});
