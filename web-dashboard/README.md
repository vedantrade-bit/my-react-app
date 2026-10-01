# NexusFlow | Modern Node.js Cloud Operations Dashboard

A modern, high-precision web dashboard built with **Node.js**, **Express**, and modern **vanilla HTML5 / CSS3 / JavaScript**.

![NexusFlow Avatar](public/assets/avatar.jpg)

---

## 🌟 Key Features

### 1. High-Performance Node.js & Express Backend
- **Real-Time Hardware & OS Telemetry**: Live metrics extracted directly from Node.js native `os` and `process` modules (CPU model, cores, V8 JavaScript heap breakdown, system RAM, process uptime).
- **Server-Sent Events (SSE)**: Real-time telemetry streaming over `/api/stream` pushing updates every 2.5 seconds without WebSocket bloat.
- **RESTful Endpoints**: Full CRUD support for DevOps tasks, microservices health management, and live system logging.

### 2. Modern Cyber-Luxe Glassmorphism Frontend
- **Design System**: Frosted glass cards with `backdrop-filter: blur(18px)`, neon ambient glow orbs, subtle border gradients, and dark mode palette.
- **Custom HTML5 Canvas Real-Time Chart**: Zero heavyweight external chart dependencies. 60 FPS hardware-accelerated dual-area chart with cubic bezier interpolation, glowing stroke gradients, and interactive hover crosshairs.
- **Microservices Fleet Manager**: Real-time health monitoring with interactive simulated reboot action triggers.
- **DevOps Task Queue**: Interactive task creation, status toggles (pending/completed), and task filtering.
- **Deep Engine Diagnostics**: Accessible native HTML5 `<dialog>` modal showing live V8 engine heap allocation (RSS, heapTotal, heapUsed, external).
- **Interactive Terminal**: Live streaming system event logs with color-coded severity badges.
- **Keyboard Shortcuts**: `Ctrl + K` or `⌘K` for instant global search filtering.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm start
```
Or for development:
```bash
npm run dev
```

### 3. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/system` | Node.js runtime, OS hardware, and V8 memory breakdown |
| `GET` | `/api/stats` | Instantaneous system load, RAM usage %, throughput, and latency |
| `GET` | `/api/metrics/history` | Past 30 telemetry points for Canvas rendering |
| `GET` | `/api/stream` | Server-Sent Events (SSE) live data feed |
| `GET` | `/api/services` | Microservices fleet status and latency |
| `POST`| `/api/services/:id/restart` | Dispatch reboot sequence for a microservice |
| `GET` | `/api/tasks` | DevOps maintenance task queue |
| `POST`| `/api/tasks` | Register a new task |
| `PATCH`| `/api/tasks/:id/toggle` | Toggle task completion status |
| `DELETE`| `/api/tasks/:id` | Remove a task from queue |
| `GET` | `/api/logs` | Real-time system events and audit logs |

---

## 📁 Project Structure

```
web-dashboard/
├── package.json          # Node.js project manifest & scripts
├── server.js            # Express server, REST endpoints & SSE streaming
├── README.md            # Documentation and instructions
└── public/
    ├── index.html       # Semantic HTML5 dashboard layout
    ├── css/
    │   └── style.css    # Modern glassmorphic styling & responsive design
    ├── js/
    │   ├── app.js       # Main dashboard controller & event handlers
    │   └── charts.js    # Canvas 60 FPS telemetry chart engine
    └── assets/
        └── avatar.jpg   # High-resolution avatar profile asset
```
