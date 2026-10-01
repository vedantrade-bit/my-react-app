/**
 * NexusFlow Dashboard Controller
 * Connects frontend glassmorphic UI to Node.js backend APIs & real-time SSE stream.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    services: [],
    tasks: [],
    logs: [],
    systemInfo: null,
    activeServiceFilter: 'all',
    activeTaskFilter: 'all',
    searchQuery: '',
    chart: null,
    eventSource: null
  };

  // --------------------------------------------------------------------------
  // Initialize Canvas Chart
  // --------------------------------------------------------------------------
  state.chart = new window.TelemetryChart('telemetryCanvas', 'chartTooltip');

  // Metric Toggle Buttons
  const metricButtons = document.querySelectorAll('.btn-toggle');
  metricButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      metricButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const metric = btn.dataset.metric;
      state.chart.setMetric(metric);
      showToast(`Chart view switched to ${btn.textContent}`, 'info');
    });
  });

  // --------------------------------------------------------------------------
  // Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // --------------------------------------------------------------------------
  // Real-Time Server-Sent Events (SSE) Stream
  // --------------------------------------------------------------------------
  function setupSSE() {
    try {
      if (state.eventSource) state.eventSource.close();
      state.eventSource = new EventSource('/api/stream');

      state.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'heartbeat') {
            updateLiveMetrics(payload.metrics);
            if (payload.latestTelemetry) {
              appendTelemetryPoint(payload.latestTelemetry);
            }
          }
        } catch (err) {
          console.error('Error parsing SSE payload:', err);
        }
      };

      state.eventSource.onerror = () => {
        // SSE disconnected, fallback to quiet retry
        state.eventSource.close();
        setTimeout(setupSSE, 5000);
      };
    } catch (e) {
      console.warn('SSE not supported or failed, fallback to polling.', e);
    }
  }

  function appendTelemetryPoint(point) {
    if (!state.chart || !state.chart.points) return;
    const pts = state.chart.points;
    pts.push(point);
    if (pts.length > 30) pts.shift();
    state.chart.render();
    state.chart.updateRibbonStats();
  }

  function updateLiveMetrics(m) {
    if (!m) return;

    // CPU
    const cpuVal = document.getElementById('kpiCpuValue');
    const cpuProg = document.getElementById('kpiCpuProgress');
    const cpuStatus = document.getElementById('kpiCpuStatus');
    if (cpuVal) cpuVal.textContent = `${m.cpuUsage}%`;
    if (cpuProg) cpuProg.style.width = `${Math.min(100, m.cpuUsage)}%`;
    if (cpuStatus) {
      if (m.cpuUsage > 75) {
        cpuStatus.textContent = 'High Load';
        cpuStatus.className = 'kpi-badge badge-amber';
      } else {
        cpuStatus.textContent = 'Optimal';
        cpuStatus.className = 'kpi-badge badge-cyan';
      }
    }

    // Memory
    const memVal = document.getElementById('kpiMemValue');
    const memProg = document.getElementById('kpiMemProgress');
    const memUsed = document.getElementById('kpiMemUsedText');
    if (memVal) memVal.textContent = `${m.memoryUsagePercent}%`;
    if (memProg) memProg.style.width = `${Math.min(100, m.memoryUsagePercent)}%`;
    if (memUsed) memUsed.textContent = `${m.memoryUsedFormatted} / ${m.memoryTotalFormatted}`;

    // Requests
    const rpsVal = document.getElementById('kpiRpsValue');
    const rpsProg = document.getElementById('kpiRpsProgress');
    if (rpsVal) rpsVal.textContent = m.requestsPerSec.toLocaleString();
    if (rpsProg) rpsProg.style.width = `${Math.min(100, (m.requestsPerSec / 3200) * 100)}%`;

    // Latency
    const latVal = document.getElementById('kpiLatencyValue');
    const latProg = document.getElementById('kpiLatencyProgress');
    if (latVal) latVal.textContent = m.avgLatencyMs;
    if (latProg) latProg.style.width = `${Math.min(100, (m.avgLatencyMs / 60) * 100)}%`;

    // Uptime Badge
    const uptimeEl = document.getElementById('uptimeCounter');
    if (uptimeEl && m.uptime) {
      uptimeEl.textContent = `Uptime: ${m.uptime}`;
    }
  }

  // --------------------------------------------------------------------------
  // API Fetch Functions
  // --------------------------------------------------------------------------
  async function fetchTelemetryHistory() {
    try {
      const res = await fetch('/api/metrics/history');
      const data = await res.json();
      if (data.status === 'success' && data.points) {
        state.chart.setData(data.points);
      }
    } catch (err) {
      console.error('Failed to load telemetry history:', err);
    }
  }

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const json = await res.json();
      if (json.status === 'success') {
        state.services = json.data;
        renderServices();
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.status === 'success') {
        state.tasks = json.data;
        renderTasks();
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }

  async function fetchLogs() {
    try {
      const res = await fetch('/api/logs');
      const json = await res.json();
      if (json.status === 'success') {
        state.logs = json.data;
        renderLogs();
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }

  async function fetchSystemSpecs() {
    try {
      const res = await fetch('/api/system');
      const json = await res.json();
      if (json.status === 'success') {
        state.systemInfo = json.data;
        renderSystemSpecs(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch system info:', err);
    }
  }

  // --------------------------------------------------------------------------
  // UI Renderers
  // --------------------------------------------------------------------------
  function renderServices() {
    const container = document.getElementById('servicesContainer');
    const counter = document.getElementById('servicesCounter');
    if (!container) return;

    let filtered = state.services;

    // Filter pill check
    if (state.activeServiceFilter !== 'all') {
      filtered = filtered.filter(s => s.status === state.activeServiceFilter);
    }

    // Search query check
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q)
      );
    }

    if (counter) {
      const opCount = state.services.filter(s => s.status === 'operational').length;
      counter.textContent = `${opCount}/${state.services.length} Healthy`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b; font-size: 0.85rem;">
          No microservices matching criteria.
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(srv => {
      const isRebooting = srv.status === 'restarting';
      return `
        <div class="service-card" id="card-${srv.id}">
          <div class="service-top">
            <div class="service-identity">
              <span class="srv-status-indicator ${isRebooting ? 'restarting' : ''}"></span>
              <div>
                <div class="service-title">${srv.name}</div>
                <div class="service-category">${srv.category}</div>
              </div>
            </div>
            <span class="service-latency-pill">${isRebooting ? 'Syncing...' : srv.latency + ' ms'}</span>
          </div>
          
          <div class="service-meta-row">
            <span>Port: ${srv.port}</span>
            <span>Uptime: ${srv.uptime}</span>
          </div>

          <div class="service-actions">
            <button class="btn-restart-srv" data-srv-id="${srv.id}" ${isRebooting ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              ${isRebooting ? 'Rebooting...' : 'Restart Service'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach restart handlers
    container.querySelectorAll('.btn-restart-srv').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.srvId;
        await restartService(id);
      });
    });
  }

  async function restartService(id) {
    try {
      showToast(`Initiating reboot sequence for ${id}...`, 'warning');
      const res = await fetch(`/api/services/${id}/restart`, { method: 'POST' });
      const data = await res.json();

      if (data.status === 'success') {
        const srv = state.services.find(s => s.id === id);
        if (srv) srv.status = 'restarting';
        renderServices();

        // Refresh logs immediately
        await fetchLogs();

        setTimeout(async () => {
          await fetchServices();
          await fetchLogs();
          showToast(`Service ${id} is back online and operational!`, 'success');
        }, 4200);
      }
    } catch (err) {
      showToast(`Failed to reboot service: ${err.message}`, 'warning');
    }
  }

  function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const counter = document.getElementById('tasksCounter');
    if (!container) return;

    let filtered = state.tasks;

    if (state.activeTaskFilter === 'pending') {
      filtered = filtered.filter(t => t.status === 'pending');
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q)
      );
    }

    if (counter) {
      counter.textContent = `${state.tasks.length} Total (${state.tasks.filter(t => t.status === 'pending').length} Pending)`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.85rem;">
          No DevOps tasks in this view.
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const isCompleted = t.status === 'completed';
      const prioClass = `priority-${t.priority.toLowerCase()}`;

      return `
        <div class="task-item ${isCompleted ? 'completed' : ''}" id="task-${t.id}">
          <div class="task-left">
            <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" ${isCompleted ? 'checked' : ''} aria-label="Toggle task status">
            <div class="task-details">
              <span class="task-title">${t.title}</span>
              <div class="task-submeta">
                <span>Assignee: ${t.assignedTo}</span>
                <span>&bull;</span>
                <span>Due: ${t.dueDate}</span>
              </div>
            </div>
          </div>
          <div class="task-right">
            <span class="priority-tag ${prioClass}">${t.priority}</span>
            <button class="btn-delete-task" data-task-id="${t.id}" title="Remove task" aria-label="Delete task">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Toggle & Delete listeners
    container.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', async () => {
        const id = cb.dataset.taskId;
        await toggleTask(id);
      });
    });

    container.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.taskId;
        await deleteTask(id);
      });
    });
  }

  async function toggleTask(id) {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.status === 'success') {
        const task = state.tasks.find(t => t.id === id);
        if (task) task.status = data.data.status;
        renderTasks();
        showToast(`Task updated to ${data.data.status}`, 'info');
      }
    } catch (err) {
      showToast('Failed to toggle task', 'warning');
    }
  }

  async function deleteTask(id) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        state.tasks = state.tasks.filter(t => t.id !== id);
        renderTasks();
        showToast('DevOps Task removed', 'info');
      }
    } catch (err) {
      showToast('Failed to delete task', 'warning');
    }
  }

  function renderLogs() {
    const container = document.getElementById('terminalLogsContainer');
    if (!container) return;

    container.innerHTML = state.logs.map(log => {
      let badgeClass = 'log-info';
      if (log.level === 'warning') badgeClass = 'log-warn';
      if (log.level === 'success') badgeClass = 'log-success';

      return `
        <div class="log-entry">
          <span class="log-time">[${log.timestamp}]</span>
          <span class="log-badge ${badgeClass}">${log.level}</span>
          <span class="log-msg"><strong style="color: #94a3b8;">${log.source}:</strong> ${log.message}</span>
        </div>
      `;
    }).join('');

    container.scrollTop = 0;
  }

  function renderSystemSpecs(sys) {
    if (!sys) return;

    // Overview Card
    const nodeVer = document.getElementById('specNodeVersion');
    const platform = document.getElementById('specPlatform');
    const v8 = document.getElementById('specV8Version');
    const cpu = document.getElementById('specCpuModel');
    const host = document.getElementById('specHostname');
    const heapRss = document.getElementById('specHeapRss');
    const heapUsed = document.getElementById('specHeapUsed');

    if (nodeVer) nodeVer.textContent = sys.nodeVersion;
    if (platform) platform.textContent = sys.platform;
    if (v8) v8.textContent = `V8 Engine ${sys.v8Version}`;
    if (cpu) cpu.textContent = sys.cpuModel;
    if (host) host.textContent = sys.hostname;
    if (heapRss) heapRss.textContent = sys.processMemory.rss;
    if (heapUsed) heapUsed.textContent = sys.processMemory.heapUsed;

    // Header CPU subtext
    const cpuSub = document.getElementById('cpuModelText');
    if (cpuSub) cpuSub.textContent = `${sys.cpuCores} Cores Detected`;

    const cpuCoresEl = document.getElementById('kpiCpuCores');
    if (cpuCoresEl) cpuCoresEl.textContent = `${sys.cpuCores} Virtual Processors`;

    // Diagnostics Modal
    document.getElementById('diagNodeVer').textContent = sys.nodeVersion;
    document.getElementById('diagV8Ver').textContent = sys.v8Version;
    document.getElementById('diagOsPlatform').textContent = sys.platform;
    document.getElementById('diagCpuCores').textContent = `${sys.cpuCores} Cores`;

    document.getElementById('diagRss').textContent = sys.processMemory.rss;
    document.getElementById('diagHeapTotal').textContent = sys.processMemory.heapTotal;
    document.getElementById('diagHeapUsed').textContent = sys.processMemory.heapUsed;
    document.getElementById('diagExternal').textContent = sys.processMemory.external;

    document.getElementById('diagHostTotalMem').textContent = sys.memory.total;
    document.getElementById('diagHostFreeMem').textContent = `${sys.memory.free} (${(100 - sys.memory.percentage).toFixed(1)}% free)`;
    document.getElementById('diagHostUptime').textContent = `${Math.floor(sys.systemUptimeSeconds / 3600)} hours`;
  }

  // --------------------------------------------------------------------------
  // Modals & Dialog Handlers (<dialog>)
  // --------------------------------------------------------------------------
  const taskModal = document.getElementById('taskModal');
  const btnOpenTaskModal = document.getElementById('btnOpenTaskModal');
  const btnCloseTaskModal = document.getElementById('btnCloseTaskModal');
  const btnCancelTaskModal = document.getElementById('btnCancelTaskModal');
  const createTaskForm = document.getElementById('createTaskForm');

  if (btnOpenTaskModal && taskModal) {
    btnOpenTaskModal.addEventListener('click', () => taskModal.showModal());
  }

  const closeTaskModalFn = () => taskModal?.close();
  if (btnCloseTaskModal) btnCloseTaskModal.addEventListener('click', closeTaskModalFn);
  if (btnCancelTaskModal) btnCancelTaskModal.addEventListener('click', closeTaskModalFn);

  // Form Submit for New Task
  if (createTaskForm) {
    createTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('taskTitleInput').value;
      const priority = document.getElementById('taskPrioritySelect').value;
      const assignedTo = document.getElementById('taskAssigneeInput').value;
      const dueDate = document.getElementById('taskDueDateInput').value;

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, priority, assignedTo, dueDate })
        });
        const json = await res.json();
        if (json.status === 'success') {
          state.tasks.unshift(json.data);
          renderTasks();
          taskModal.close();
          createTaskForm.reset();
          showToast(`Task "${title}" created successfully!`, 'success');
          await fetchLogs();
        }
      } catch (err) {
        showToast('Failed to create task: ' + err.message, 'warning');
      }
    });
  }

  // Diagnostics Modal
  const diagModal = document.getElementById('diagnosticsModal');
  const btnOpenDiag = document.getElementById('btnOpenDiagnostics');
  const btnLaunchFullSpecs = document.getElementById('btnLaunchFullSpecs');
  const btnCloseDiag = document.getElementById('btnCloseDiagModal');
  const btnDismissDiag = document.getElementById('btnDismissDiag');
  const btnExportSpecs = document.getElementById('btnExportSpecs');

  const openDiagFn = () => {
    fetchSystemSpecs();
    diagModal?.showModal();
  };
  if (btnOpenDiag) btnOpenDiag.addEventListener('click', openDiagFn);
  if (btnLaunchFullSpecs) btnLaunchFullSpecs.addEventListener('click', openDiagFn);

  const closeDiagFn = () => diagModal?.close();
  if (btnCloseDiag) btnCloseDiag.addEventListener('click', closeDiagFn);
  if (btnDismissDiag) btnDismissDiag.addEventListener('click', closeDiagFn);

  // Copy Specs JSON to clipboard
  if (btnExportSpecs) {
    btnExportSpecs.addEventListener('click', () => {
      if (state.systemInfo) {
        navigator.clipboard.writeText(JSON.stringify(state.systemInfo, null, 2))
          .then(() => showToast('Diagnostics telemetry copied to clipboard!', 'success'))
          .catch(() => showToast('Clipboard write permission denied', 'warning'));
      }
    });
  }

  // --------------------------------------------------------------------------
  // Search & Filter Interactions
  // --------------------------------------------------------------------------
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderServices();
      renderTasks();
    });
  }

  // Keyboard shortcut Ctrl+K / Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // Service filter pills
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeServiceFilter = pill.dataset.filter;
      renderServices();
    });
  });

  // Task filter buttons
  const btnFilterPending = document.getElementById('btnFilterPendingTasks');
  const btnFilterAll = document.getElementById('btnFilterAllTasks');
  if (btnFilterPending) {
    btnFilterPending.addEventListener('click', () => {
      state.activeTaskFilter = 'pending';
      btnFilterPending.classList.add('btn-primary');
      btnFilterPending.classList.remove('btn-secondary');
      btnFilterAll?.classList.add('btn-secondary');
      btnFilterAll?.classList.remove('btn-primary');
      renderTasks();
    });
  }
  if (btnFilterAll) {
    btnFilterAll.addEventListener('click', () => {
      state.activeTaskFilter = 'all';
      btnFilterAll.classList.add('btn-primary');
      btnFilterAll.classList.remove('btn-secondary');
      btnFilterPending?.classList.add('btn-secondary');
      btnFilterPending?.classList.remove('btn-primary');
      renderTasks();
    });
  }

  // Terminal Clear button
  const btnClearLogs = document.getElementById('btnClearLogs');
  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
      state.logs = [];
      renderLogs();
      showToast('Terminal buffer cleared', 'info');
    });
  }

  // Global Refresh Sync button
  const btnRefresh = document.getElementById('btnRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      btnRefresh.style.transform = 'rotate(180deg)';
      setTimeout(() => btnRefresh.style.transform = 'none', 300);
      await Promise.all([
        fetchTelemetryHistory(),
        fetchServices(),
        fetchTasks(),
        fetchLogs(),
        fetchSystemSpecs()
      ]);
      showToast('All system telemetry re-synchronized', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // Initial Boot Sequence
  // --------------------------------------------------------------------------
  async function boot() {
    await Promise.all([
      fetchTelemetryHistory(),
      fetchServices(),
      fetchTasks(),
      fetchLogs(),
      fetchSystemSpecs()
    ]);
    setupSSE();
    showToast('NexusFlow Node.js Telemetry Engine Connected', 'success');
  }

  boot();
});
