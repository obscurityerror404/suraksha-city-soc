/**
 * SURAKSHA-CITY Core Dashboard Application Controller
 * Cyber Samvad Hackathon 2026 - Problem Statement 4
 * Multi-Incident Concurrency, Dynamic Attack Forensics & Interactive SOC Analyst Terminal CLI
 * Senior UI/UX Design System Controller (Light & Dark Themes, Responsive Drawer, Carousel)
 */

const API_BASE = "";

const state = {
  status: {},
  assets: [],
  alerts: [],
  scenarios: [],
  incidents: [],
  activeIncidents: [],
  selectedIncidentId: null,
  activeIncident: null,
  selectedSector: "ALL",
  activeTab: "overview",
  soundEnabled: true,
  cityMap: null,
  searchQuery: "",
  currentSlide: 0,
  commandHistory: [],
  historyIndex: -1,
  terminalLogs: [
    { text: "[+] SURAKSHA-CITY Enterprise SOC Defense Center initialized.", type: "prompt" },
    { text: "[+] Zero-Trust Network Defense active on all 12 critical SCADA/IT nodes.", type: "success" },
    { text: "[+] Persistent SOC Analyst TTY-01 CLI shell ready. Type 'help' or click quick actions.", type: "warn" }
  ]
};

const tabTitles = {
  overview: "City Map & Topology",
  alerts: "Prioritized Threat Alerts",
  playbook: "SOAR Playbook & Analyst CLI",
  simulator: "Attack Simulation Sandbox",
  logs: "Audit Logs & Compliance",
  awareness: "Cyber Awareness Hub",
  presentation: "Hackathon Pitch Deck"
};

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initClock();
  initTabs();
  initSectorFilters();
  initSearch();
  initTerminalEvents();
  initKeyboardShortcuts();
  initSlideDeck();
  renderTerminalLogs();
  initState();
  
  // Initialize City Map
  state.cityMap = new CityMap("city-map-container", (assetId) => {
    openAssetDetailModal(assetId);
  });
  window.handleNodeClick = (assetId) => openAssetDetailModal(assetId);

  // Poll state every 2.5 seconds (Playbook Left Col updates, Terminal DOM preserved!)
  setInterval(fetchDashboardData, 2500);
});

/* ========================================================
   THEME SWITCHER (LIGHT & DARK SAAS MODES)
   ======================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem("suraksha_theme") || "light";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("suraksha_theme", theme);

  const iconEl = document.getElementById("theme-icon");
  const labelEl = document.getElementById("theme-label");

  if (iconEl) iconEl.textContent = theme === "dark" ? "🌙" : "☀️";
  if (labelEl) labelEl.textContent = theme === "dark" ? "Dark" : "Light";

  if (state.cityMap) {
    state.cityMap.render();
  }
}

/* ========================================================
   MOBILE DRAWER NAVIGATION
   ======================================================== */
function toggleMobileSidebar(force) {
  const sidebar = document.getElementById("soc-sidebar");
  const backdrop = document.getElementById("mobile-backdrop");
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains("mobile-open");
  const shouldOpen = force !== undefined ? force : !isOpen;

  if (shouldOpen) {
    sidebar.classList.add("mobile-open");
    if (backdrop) backdrop.classList.add("active");
  } else {
    sidebar.classList.remove("mobile-open");
    if (backdrop) backdrop.classList.remove("active");
  }
}

function initClock() {
  const clockEl = document.getElementById("soc-clock");
  const updateTime = () => {
    const now = new Date();
    if (clockEl) clockEl.textContent = now.toLocaleTimeString() + " IST";
  };
  updateTime();
  setInterval(updateTime, 1000);
}

function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      switchTab(target);
      // Close mobile drawer if open
      toggleMobileSidebar(false);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

  const targetBtns = document.querySelectorAll(`.tab-btn[data-tab="${tabId}"]`);
  targetBtns.forEach(b => b.classList.add("active"));

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add("active");

  const titleEl = document.getElementById("topbar-current-tab");
  if (titleEl && tabTitles[tabId]) {
    titleEl.textContent = tabTitles[tabId];
  }

  if (tabId === "overview" && state.cityMap) {
    state.cityMap.render();
  } else if (tabId === "playbook") {
    // Auto focus terminal input when switching to Playbook tab
    setTimeout(() => {
      const inputEl = document.getElementById("terminal-cli-input");
      if (inputEl) inputEl.focus();
    }, 100);
  } else if (tabId === "presentation") {
    updateSlideDeckView();
  }
}

function initSectorFilters() {
  const filterPills = document.querySelectorAll(".filter-pill");
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.selectedSector = pill.dataset.sector;
      renderAssets();
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById("global-search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderAssets();
    if (state.activeTab !== "overview" && state.searchQuery) {
      switchTab("overview");
    }
  });
}

function initKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K for global search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const searchInput = document.getElementById("global-search-input");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    // Escape key dismisses modals & mobile sidebar
    if (e.key === "Escape") {
      closeResolveModal();
      closeReportModal();
      closeAssetModal();
      toggleMobileSidebar(false);
    }
  });
}

function initTerminalEvents() {
  const inputEl = document.getElementById("terminal-cli-input");
  if (!inputEl) return;

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendTerminalCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (state.commandHistory.length > 0) {
        if (state.historyIndex > 0) {
          state.historyIndex--;
        } else {
          state.historyIndex = 0;
        }
        inputEl.value = state.commandHistory[state.historyIndex] || "";
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (state.historyIndex < state.commandHistory.length - 1) {
        state.historyIndex++;
        inputEl.value = state.commandHistory[state.historyIndex] || "";
      } else {
        state.historyIndex = state.commandHistory.length;
        inputEl.value = "";
      }
    }
  });
}

/* ========================================================
   PRESENTATION PITCH DECK SLIDE CAROUSEL
   ======================================================== */
function initSlideDeck() {
  updateSlideDeckView();
}

function navigateSlide(direction) {
  const slides = document.querySelectorAll(".pitch-slide-card");
  if (slides.length === 0) return;

  state.currentSlide += direction;
  if (state.currentSlide < 0) state.currentSlide = 0;
  if (state.currentSlide >= slides.length) state.currentSlide = slides.length - 1;

  updateSlideDeckView();
}

function updateSlideDeckView() {
  const slides = document.querySelectorAll(".pitch-slide-card");
  const badge = document.getElementById("slide-counter-badge");
  if (!slides || slides.length === 0) return;

  slides.forEach((slide, idx) => {
    if (idx === state.currentSlide) {
      slide.style.display = "block";
    } else {
      slide.style.display = "none";
    }
  });

  if (badge) {
    badge.textContent = `Slide ${state.currentSlide + 1} of ${slides.length}`;
  }
}

async function initState() {
  await fetchScenarios();
  await fetchDashboardData();
  await fetchIncidents();
}

async function fetchDashboardData() {
  try {
    const [statusRes, assetsRes, alertsRes, incidentsRes] = await Promise.all([
      fetch(`${API_BASE}/api/status`),
      fetch(`${API_BASE}/api/assets`),
      fetch(`${API_BASE}/api/alerts`),
      fetch(`${API_BASE}/api/active-incidents`)
    ]);

    const statusData = await statusRes.json();
    const assetsData = await assetsRes.json();
    const alertsData = await alertsRes.json();
    const activeIncidentsData = await incidentsRes.json();

    const previousCount = state.activeIncidents.length;
    const currentCount = activeIncidentsData.length;

    state.status = statusData;
    state.assets = assetsData;
    state.alerts = alertsData;
    state.activeIncidents = activeIncidentsData;

    // Siren alarm if new incidents appeared
    if (currentCount > previousCount && currentCount > 0) {
      if (window.socAudio) window.socAudio.playAlertSiren();
    } else if (currentCount === 0 && previousCount > 0) {
      if (window.socAudio) window.socAudio.stopAlertSiren();
    }

    // Ensure selected incident is valid
    if (state.activeIncidents.length > 0) {
      const exists = state.activeIncidents.some(i => i.incidentId === state.selectedIncidentId);
      if (!exists) {
        state.selectedIncidentId = state.activeIncidents[0].incidentId;
      }
      state.activeIncident = state.activeIncidents.find(i => i.incidentId === state.selectedIncidentId) || state.activeIncidents[0];
    } else {
      state.selectedIncidentId = null;
      state.activeIncident = null;
    }

    updateKPIs();
    renderActiveIncidentBanner();
    renderAssets();
    renderAlerts();
    renderPlaybook(); // Updates #playbook-left-col WITHOUT wiping terminal input!
    renderScenarios();

    if (state.cityMap) {
      state.cityMap.updateAssets(state.assets);
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
}

async function fetchScenarios() {
  try {
    const res = await fetch(`${API_BASE}/api/scenarios`);
    state.scenarios = await res.json();
    renderScenarios();
  } catch (err) {
    console.error("Error fetching scenarios:", err);
  }
}

async function fetchIncidents() {
  try {
    const res = await fetch(`${API_BASE}/api/incidents`);
    state.incidents = await res.json();
    renderIncidentLogs();
  } catch (err) {
    console.error("Error fetching incidents:", err);
  }
}

function updateKPIs() {
  const s = state.status;
  if (!s) return;

  // City Resilience Index
  const resScoreEl = document.getElementById("kpi-resilience");
  const resLabelEl = document.getElementById("kpi-resilience-sub");
  const resTrendEl = document.getElementById("kpi-resilience-trend");
  if (resScoreEl) resScoreEl.textContent = `${s.cityResilienceScore || 98.4}%`;
  if (resLabelEl) {
    if (s.cityResilienceScore < 70) {
      resLabelEl.textContent = "Defensive Degradation Active";
      resLabelEl.style.color = "var(--status-critical)";
      if (resTrendEl) {
        resTrendEl.textContent = "▼ Compromised";
        resTrendEl.className = "kpi-trend-pill critical";
      }
    } else {
      resLabelEl.textContent = "Grid & Telemetry Nominal";
      resLabelEl.style.color = "var(--status-healthy)";
      if (resTrendEl) {
        resTrendEl.textContent = "▲ 0.4% Nominal";
        resTrendEl.className = "kpi-trend-pill success";
      }
    }
  }

  // Threat Level & Status Chips
  const threatEl = document.getElementById("kpi-threat-level");
  const pulseEl = document.getElementById("pulse-indicator");
  const statusTextEl = document.getElementById("soc-status-text");
  const statusChipEl = document.getElementById("soc-status-chip");
  const playbookDot = document.getElementById("tab-playbook-dot");

  if (s.overallRiskLevel === "CRITICAL") {
    if (threatEl) {
      threatEl.textContent = "CRITICAL";
      threatEl.style.color = "var(--status-critical)";
    }
    if (pulseEl) pulseEl.className = "pulse-dot critical";
    if (statusTextEl) statusTextEl.textContent = "CRITICAL ATTACK ACTIVE";
    if (statusChipEl) {
      statusChipEl.className = "posture-chip critical";
      statusChipEl.style.borderColor = "";
    }
    if (playbookDot) playbookDot.style.display = "block";
  } else if (s.overallRiskLevel === "MEDIUM" || s.overallRiskLevel === "ELEVATED_CONTAINED") {
    if (threatEl) {
      threatEl.textContent = s.overallRiskLevel;
      threatEl.style.color = "var(--status-warning)";
    }
    if (pulseEl) pulseEl.className = "pulse-dot";
    if (statusTextEl) statusTextEl.textContent = "DEFENSE ELEVATED";
    if (statusChipEl) {
      statusChipEl.className = "posture-chip warning";
      statusChipEl.style.borderColor = "";
    }
    if (playbookDot) playbookDot.style.display = "block";
  } else {
    if (threatEl) {
      threatEl.textContent = "LOW";
      threatEl.style.color = "var(--status-healthy)";
    }
    if (pulseEl) pulseEl.className = "pulse-dot";
    if (statusTextEl) statusTextEl.textContent = "DEFENSE NOMINAL";
    if (statusChipEl) {
      statusChipEl.className = "posture-chip";
      statusChipEl.style.borderColor = "";
    }
    if (playbookDot) playbookDot.style.display = "none";
  }

  // Active Alerts Count
  const alertsCountEl = document.getElementById("kpi-alerts-count");
  const tabAlertBadge = document.getElementById("tab-alert-badge");
  if (alertsCountEl) alertsCountEl.textContent = s.activeAlertsCount || "0";
  if (tabAlertBadge) {
    tabAlertBadge.textContent = s.activeAlertsCount || "0";
    tabAlertBadge.style.display = s.activeAlertsCount > 0 ? "inline-block" : "none";
  }

  // Critical Assets
  const assetsCountEl = document.getElementById("kpi-assets-count");
  if (assetsCountEl && s.assetsSummary) {
    assetsCountEl.textContent = `${s.assetsSummary.compromised} Compromised / ${s.assetsSummary.total} Total`;
    if (s.assetsSummary.compromised > 0) {
      assetsCountEl.style.color = "var(--status-critical)";
    } else {
      assetsCountEl.style.color = "var(--text-main)";
    }
  }
}

function renderActiveIncidentBanner() {
  const banner = document.getElementById("active-incident-banner");
  if (!banner) return;

  const count = state.activeIncidents.length;
  if (count > 0) {
    banner.style.display = "flex";
    if (count === 1) {
      const inc = state.activeIncidents[0];
      document.getElementById("banner-title").textContent = `CRITICAL INCIDENT [${inc.incidentId}]: ${inc.title}`;
      document.getElementById("banner-desc").textContent = `Target: ${inc.targetAssetId} | Sector: ${inc.sector} | Risk Score: ${inc.riskScore}/100`;
    } else {
      const sectors = Array.from(new Set(state.activeIncidents.map(i => i.sector))).join(", ");
      document.getElementById("banner-title").textContent = `🚨 MULTIPLE ATTACKS DETECTED: ${count} CONCURRENT INCIDENTS ACTIVE`;
      document.getElementById("banner-desc").textContent = `Sectors under attack: ${sectors} | Open Interactive Analyst Terminal to Mitigate`;
    }
  } else {
    banner.style.display = "none";
  }
}

function renderAssets() {
  const container = document.getElementById("assets-grid");
  if (!container) return;

  let filtered = state.assets;
  if (state.selectedSector !== "ALL") {
    filtered = state.assets.filter(a => a.sector.toLowerCase().includes(state.selectedSector.toLowerCase()));
  }

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery;
    filtered = filtered.filter(a => 
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.sector.toLowerCase().includes(q) ||
      (a.ip && a.ip.includes(q)) ||
      (a.protocol && a.protocol.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-card); border: 1px dashed var(--border-medium); border-radius: var(--radius-lg);">
        <div style="font-size:2rem; margin-bottom:10px;">🔍</div>
        <p style="font-size:1rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">No SCADA assets match your query</p>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">Try adjusting your search terms or clearing the sector filter.</p>
        <button class="btn-sm btn-secondary" onclick="clearAssetSearch()">Clear Search</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(a => {
    let metricsHtml = Object.entries(a.currentMetrics || {}).map(([k, v]) => `
      <div class="metric-row">
        <span>${formatMetricKey(k)}:</span>
        <strong style="color:${isMetricCritical(k, v) ? 'var(--status-critical)' : 'var(--accent-cyan)'}">${v}</strong>
      </div>
    `).join("");

    return `
      <div class="asset-card ${a.status}">
        <div>
          <div class="asset-card-top">
            <span class="asset-id-badge">${a.id}</span>
            <span class="asset-status-badge badge-${a.status}">${a.status}</span>
          </div>
          <div class="asset-name">${a.name}</div>
          <div class="asset-meta">
            <span>${a.sector}</span>
            <span>•</span>
            <span>Risk: ${a.riskScore}/100</span>
          </div>
          <div class="asset-metrics-box">
            ${metricsHtml}
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; pt:10px; border-top:1px solid var(--border-subtle); padding-top:10px;">
          <span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--text-dim);">${a.ip}</span>
          <button class="btn-sm btn-secondary" style="font-size:0.72rem; padding:4px 10px;" onclick="openAssetDetailModal('${a.id}')">
            Inspect Telemetry ↗
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function clearAssetSearch() {
  state.searchQuery = "";
  const input = document.getElementById("global-search-input");
  if (input) input.value = "";
  state.selectedSector = "ALL";
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  const allPill = document.querySelector(".filter-pill[data-sector='ALL']");
  if (allPill) allPill.classList.add("active");
  renderAssets();
}

function formatMetricKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function isMetricCritical(key, value) {
  if (key === "pressure_bar" && value > 6.0) return true;
  if (key === "server_cpu_pct" && value > 90) return true;
  if (key === "active_phase" && String(value).includes("CONFLICT")) return true;
  if (key === "breaker_status" && String(value).includes("TRIPPED")) return true;
  return false;
}

function renderAlerts() {
  const container = document.getElementById("alerts-container");
  if (!container) return;

  if (state.alerts.length === 0) {
    container.innerHTML = `
      <div class="map-panel" style="text-align:center; padding: 50px 20px; color: var(--text-dim);">
        <div style="font-size:2.8rem; margin-bottom:12px;">🛡️</div>
        <p style="font-size: 1.15rem; font-weight:700; color:var(--text-main); margin-bottom: 6px;">All Critical Infrastructure Systems Nominal</p>
        <p style="font-size: 0.85rem; color:var(--text-muted); max-width:440px; margin:0 auto;">
          No active cyber security anomalies, unmitigated threat alerts, or threshold breaches in the SOC triage queue.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.alerts.map(alert => `
    <div class="alert-item ${alert.threatLevel}">
      <div class="alert-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="asset-status-badge badge-${alert.threatLevel === 'CRITICAL' ? 'COMPROMISED' : 'WARNING'}">${alert.threatLevel} PRIORITY</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--brand-purple); font-weight:700;">${alert.incidentId}</span>
        </div>
        <span class="alert-score">Risk Score: ${alert.riskScore}</span>
      </div>
      <div class="alert-title">${alert.title}</div>
      <div class="alert-details">
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px; font-size:0.78rem;">
          <span>Target: <strong style="font-family:var(--font-mono);">${alert.targetAssetId}</strong></span>
          <span>Urgency: <strong>${alert.urgency}</strong></span>
        </div>
        <div><strong>Potential Impact:</strong> ${alert.potentialImpact}</div>
        <div style="margin-top:10px; font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); background:var(--bg-panel); padding:10px 14px; border-radius:6px; border:1px solid var(--border-subtle);">
          <strong style="color:var(--text-main);">Anomaly Evidence:</strong> ${alert.anomalyEvidence ? alert.anomalyEvidence[0] : 'Telemetry threshold exceeded'}
        </div>
      </div>
      <div class="alert-actions">
        <button class="btn-sm btn-primary" style="display:inline-flex; align-items:center; gap:8px;" onclick="investigateAlert('${alert.incidentId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          Open Analyst Terminal & Playbook
        </button>
      </div>
    </div>
  `).join("");
}

/**
 * Renders ONLY the Left Column of the Playbook Workspace.
 * The Right Column (Terminal CLI) is permanent in index.html,
 * so the user can type continuously without input focus loss!
 */
function renderPlaybook() {
  const container = document.getElementById("playbook-left-col");
  if (!container) return;

  if (state.activeIncidents.length === 0) {
    container.innerHTML = `
      <div class="playbook-card" style="text-align:center; padding: 48px 24px;">
        <div style="font-size:2.8rem; margin-bottom:14px;">🛡️</div>
        <h3 style="color:var(--text-main); font-size:1.15rem; margin-bottom: 8px;">All Critical Infrastructure Nominal</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; max-width:440px; margin: 0 auto 20px auto; line-height:1.6;">
          Zero active incidents detected across water, traffic, power, CAD, and IoT networks. Use the Red-Team simulator to inject single or multi-sector cyber attacks.
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button class="btn-sm btn-primary" onclick="switchTab('simulator')">Go to Attack Simulator</button>
          <button class="btn-sm btn-danger" onclick="triggerSimulation('ALL')">🔥 Launch Multi-Sector Warfare</button>
        </div>
      </div>
    `;
    updateQuickCommands(null);
    return;
  }

  // Multi-Incident Selector Pills
  let selectorHtml = "";
  if (state.activeIncidents.length > 1) {
    selectorHtml = `
      <div class="multi-incident-bar">
        <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); align-self:center;">Active Attacks (${state.activeIncidents.length}):</span>
        ${state.activeIncidents.map(inc => `
          <button class="incident-pill ${inc.incidentId === state.selectedIncidentId ? 'active' : ''}" 
                  onclick="selectIncidentInPlaybook('${inc.incidentId}')">
            <span>🚨 ${inc.incidentId}</span>
            <span style="font-size:0.75rem; color:#fca5a5;">${inc.sector.split(' ')[0]}</span>
            <span class="incident-pill-badge">${inc.riskScore}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  const inc = state.activeIncident || state.activeIncidents[0];
  const stepsHtml = (inc.playbook || []).map((step, idx) => {
    const isDone = step.status === "COMPLETED";
    return `
      <div class="playbook-step ${isDone ? 'COMPLETED' : ''}">
        <div class="step-num">${isDone ? '✓' : (idx + 1)}</div>
        <div class="step-content">
          <div class="step-title">${step.title}</div>
          <div class="step-desc">${step.description}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <div style="font-family:var(--font-mono); font-size:0.74rem; color:var(--accent-cyan); background:var(--bg-panel); padding:5px 10px; border-radius:4px; display:inline-block; border:1px solid var(--border-subtle);">
              Command: <strong>${step.command || 'isolate'}</strong>
            </div>
            <button class="copy-mini-btn" onclick="copyToClipboard('${step.command || step.id}', 'Command')">📋 Copy</button>
          </div>
          <div>
            ${isDone ? `
              <button class="step-btn done">✓ Executed at ${step.completedAt || 'Nominal'}</button>
            ` : `
              <button class="step-btn" onclick="executePlaybookStep('${step.id}')">
                ▶ Execute via GUI
              </button>
              <button class="step-btn" style="background:var(--bg-card); border:1px solid var(--border-subtle); color:var(--text-main); margin-left:8px;" onclick="runQuickCommand('${step.command || step.id}')">
                💻 Run in CLI Terminal
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const allCompleted = (inc.playbook || []).every(s => s.status === "COMPLETED");
  const completedCount = (inc.playbook || []).filter(s => s.status === 'COMPLETED').length;
  const totalCount = (inc.playbook || []).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  container.innerHTML = `
    <div class="playbook-card">
      ${selectorHtml}

      <div class="playbook-top">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-family:var(--font-mono); font-size:0.82rem; color:var(--accent-cyan); font-weight:700;">
            ACTIVE INCIDENT CASE: ${inc.incidentId} (${inc.targetAssetId})
          </span>
          <span class="asset-status-badge badge-COMPROMISED">${inc.threatLevel} PRIORITY</span>
        </div>
        <h2 style="font-size:1.25rem; font-weight:800; margin-bottom:8px; color:var(--text-main);">${inc.title}</h2>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px; line-height:1.5;">${inc.potentialImpact}</p>
        <div style="background:var(--bg-panel); border:1px solid var(--border-subtle); padding:10px 14px; border-radius:8px; font-size:0.75rem; font-family:var(--font-mono); color:var(--accent-cyan);">
          <strong>Public Continuity Protocol:</strong> ${inc.continuityPlan}
        </div>
      </div>

      <!-- Playbook Checklist -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:8px;">
            📋 Structured SOAR Response Actions (NIST SP 800-61 / ISA-99)
          </h4>
          <span style="font-size:0.78rem; font-family:var(--font-mono); color:var(--accent-cyan); font-weight:700;">
            ${completedCount} / ${totalCount} Done (${progressPct}%)
          </span>
        </div>
        <div class="playbook-steps">
          ${stepsHtml}
        </div>
      </div>

      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <span style="font-size:0.82rem; color:var(--text-muted);">
            Containment Status: ${allCompleted ? '<strong style="color:var(--status-healthy);">Ready for Official Resolution</strong>' : 'Steps Pending Execution'}
          </span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-sm btn-primary" ${allCompleted ? '' : 'disabled style="opacity:0.4; cursor:not-allowed;"'} onclick="openResolveModal('${inc.incidentId}')">
            🛡️ Sign Off & Mitigate Incident [${inc.incidentId}]
          </button>
        </div>
      </div>
    </div>
  `;

  updateQuickCommands(inc);
}

function updateQuickCommands(inc) {
  const bar = document.getElementById("quick-commands-bar");
  if (!bar) return;

  if (!inc || !inc.playbook) {
    bar.innerHTML = `
      <button class="command-quick-btn" onclick="runQuickCommand('status')">⚡ status</button>
      <button class="command-quick-btn" onclick="runQuickCommand('list')">⚡ list</button>
      <button class="command-quick-btn" onclick="runQuickCommand('help')">⚡ help</button>
      <button class="command-quick-btn" onclick="runQuickCommand('clear')">⚡ clear</button>
    `;
    return;
  }

  const buttonsHtml = inc.playbook.map(s => {
    const cmdStr = s.command || s.id;
    const label = cmdStr.split(" ")[0];
    return `
      <button class="command-quick-btn" onclick="runQuickCommand('${cmdStr}')">
        ⚡ ${label}
      </button>
    `;
  }).join("");

  bar.innerHTML = `
    ${buttonsHtml}
    <button class="command-quick-btn" onclick="runQuickCommand('status')">⚡ status</button>
    <button class="command-quick-btn" onclick="runQuickCommand('help')">⚡ help</button>
    <button class="command-quick-btn" onclick="runQuickCommand('clear')">⚡ clear</button>
  `;
}

// Terminal Log Management
function renderTerminalLogs() {
  const termBody = document.getElementById("soc-terminal-body");
  if (!termBody) return;
  termBody.innerHTML = state.terminalLogs.map(l => `
    <div class="terminal-line ${l.type}">${escapeHtml(l.text)}</div>
  `).join("");
  termBody.scrollTop = termBody.scrollHeight;
}

function appendTerminalLog(text, type = "line") {
  state.terminalLogs.push({ text, type });
  const termBody = document.getElementById("soc-terminal-body");
  if (termBody) {
    const lineEl = document.createElement("div");
    lineEl.className = `terminal-line ${type}`;
    lineEl.textContent = text;
    termBody.appendChild(lineEl);
    termBody.scrollTop = termBody.scrollHeight;
  }
}

async function sendTerminalCommand() {
  const inputEl = document.getElementById("terminal-cli-input");
  if (!inputEl) return;
  const cmd = inputEl.value.trim();
  if (!cmd) return;
  inputEl.value = "";
  await executeTerminalCommandString(cmd);
}

function runQuickCommand(cmd) {
  const inputEl = document.getElementById("terminal-cli-input");
  if (inputEl) inputEl.value = cmd;
  executeTerminalCommandString(cmd);
}

function copyTerminalOutput() {
  const termBody = document.getElementById("soc-terminal-body");
  if (!termBody) return;
  const text = termBody.innerText || "";
  navigator.clipboard.writeText(text).then(() => {
    showToast("Terminal logs copied to clipboard!", "success");
  }).catch(() => {
    showToast("Failed to copy logs.", "danger");
  });
}

function copyToClipboard(text, label = "Item") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copied to clipboard!`, "success");
  }).catch(() => {
    showToast(`Failed to copy ${label.toLowerCase()}.`, "danger");
  });
}

async function executeTerminalCommandString(cmd) {
  if (!cmd) return;
  
  // Track command history
  state.commandHistory.push(cmd);
  state.historyIndex = state.commandHistory.length;

  if (cmd.toLowerCase() === "clear") {
    state.terminalLogs = [
      { text: "[+] Terminal screen cleared.", type: "prompt" }
    ];
    renderTerminalLogs();
    const inputEl = document.getElementById("terminal-cli-input");
    if (inputEl) inputEl.focus();
    return;
  }

  // Add user prompt to logs
  appendTerminalLog(`soc-analyst@suraksha-soc:~$ ${cmd}`, "prompt");

  try {
    const res = await fetch(`${API_BASE}/api/terminal/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: cmd,
        incidentId: state.selectedIncidentId
      })
    });
    const data = await res.json();

    if (data.output && Array.isArray(data.output)) {
      data.output.forEach(line => {
        let type = "line";
        if (line.includes("[SUCCESS]") || line.includes("COMPLETED")) type = "success";
        else if (line.includes("[-]")) type = "error";
        else if (line.includes("[ALERT]") || line.includes("[?]")) type = "warn";
        appendTerminalLog(line, type);
      });
    }

    if (data.stepExecuted) {
      if (window.socAudio) window.socAudio.playIsolationClank();
      showToast(`CLI Executed: ${data.stepExecuted.title}`, "success");
      if (window.socAudio) window.socAudio.playSuccessChime();
    }

    if (data.incident) {
      const idx = state.activeIncidents.findIndex(i => i.incidentId === data.incident.incidentId);
      if (idx !== -1) state.activeIncidents[idx] = data.incident;
      state.activeIncident = data.incident;
    }

    await fetchDashboardData();
  } catch (err) {
    appendTerminalLog(`[-] Terminal Network Error: ${err}`, "error");
  } finally {
    // Preserve focus on the terminal input so analyst can keep typing seamlessly!
    const inputEl = document.getElementById("terminal-cli-input");
    if (inputEl) inputEl.focus();
  }
}

function selectIncidentInPlaybook(incidentId) {
  state.selectedIncidentId = incidentId;
  state.activeIncident = state.activeIncidents.find(i => i.incidentId === incidentId);
  renderPlaybook();
}

async function executePlaybookStep(stepId) {
  try {
    if (window.socAudio) window.socAudio.playIsolationClank();
    const res = await fetch(`${API_BASE}/api/playbook/execute-step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        stepId: stepId,
        incidentId: state.selectedIncidentId 
      })
    });
    const data = await res.json();
    if (data.incident) {
      const idx = state.activeIncidents.findIndex(i => i.incidentId === data.incident.incidentId);
      if (idx !== -1) {
        state.activeIncidents[idx] = data.incident;
      }
      state.activeIncident = data.incident;
      showToast(`Action Executed: "${data.step.title}"`, "success");
      
      appendTerminalLog(`[+] Action Executed via GUI: ${data.step.title} (${data.step.actionType})`, "success");

      renderPlaybook();
      fetchDashboardData();
      if (window.socAudio) window.socAudio.playSuccessChime();
    }
  } catch (err) {
    showToast("Error executing playbook action: " + err, "danger");
  }
}

function renderScenarios() {
  const container = document.getElementById("scenarios-grid");
  if (!container) return;

  const activeScenarioIds = new Set(state.activeIncidents.map(i => i.scenarioId));

  container.innerHTML = state.scenarios.map(sc => {
    const isCurrentlyActive = activeScenarioIds.has(sc.id);
    const ingress = sc.attackIngress || {};
    const payload = sc.maliciousPayload || {};
    const detection = sc.detectionEngine || {};
    const awareness = sc.awarenessLesson || {};

    return `
      <div class="scenario-card ${isCurrentlyActive ? 'active' : ''}">
        <div>
          <div class="scenario-top-row">
            <span class="scenario-category-pill">${sc.sector}</span>
            ${isCurrentlyActive ? `
              <span class="incident-pill-badge" style="animation:pulse-badge 1s infinite alternate;">ACTIVE ATTACK</span>
            ` : `
              <span class="asset-status-badge badge-${sc.threatLevel === 'CRITICAL' ? 'COMPROMISED' : 'WARNING'}">${sc.threatLevel}</span>
            `}
          </div>
          <div class="scenario-title">${sc.title}</div>
          <div class="scenario-mitre">MITRE ATT&CK: ${sc.mitreId}</div>
          <div class="scenario-desc">${sc.potentialImpact}</div>

          <!-- Dynamic Attack Anatomy & Detection Inspector -->
          <div class="scenario-anatomy-box">
            <div>
              <div style="display:flex; align-items:center; gap:6px; color:var(--status-critical); font-weight:700; margin-bottom:3px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>How Attack Enters (Ingress):</span>
              </div>
              <div style="color:var(--text-muted);">${ingress.origin || 'Remote Ingress'} (${ingress.technique || 'Protocol Injection'})</div>
            </div>

            <div>
              <div style="display:flex; align-items:center; gap:6px; color:var(--status-warning); font-weight:700; margin-bottom:3px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Malicious Payload:</span>
              </div>
              <div style="color:var(--text-muted);">${payload.protocol || 'SCADA'} • Target: ${payload.registerTarget || 'Registers'}</div>
              <div class="hex-dump-row">
                <div class="hex-dump">${payload.rawHexDump || '00 01 00 00 00 06'}</div>
                <button class="copy-mini-btn" onclick="copyToClipboard('${payload.rawHexDump || ''}', 'Hex Dump')">Copy</button>
              </div>
            </div>

            <div>
              <div style="display:flex; align-items:center; gap:6px; color:var(--status-healthy); font-weight:700; margin-bottom:3px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>How System Detects It:</span>
              </div>
              <div style="color:var(--text-muted);">${detection.method || 'DPI Protocol Engine'}</div>
              <div style="font-family:var(--font-mono); color:var(--brand-purple); font-size:0.72rem; margin-top:3px; font-weight:700;">${detection.triggerRule || 'RULE-ICS-ALERT'}</div>
            </div>

            <div style="background:var(--bg-active-nav); padding:10px 12px; border-radius:6px; border-left:3px solid var(--brand-purple); margin-top:4px;">
              <div style="display:flex; align-items:center; gap:6px; color:var(--brand-purple); font-weight:700; margin-bottom:2px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                <span>Cyber Analyst Takeaway:</span>
              </div>
              <div style="color:var(--text-main); font-size:0.74rem;">${awareness.analystGuideline || 'Verify fail-safes before isolating.'}</div>
            </div>
          </div>
        </div>

        <div>
          <div class="scenario-meta">
            <span>Target: <strong style="font-family:var(--font-mono);">${sc.targetAssetId}</strong></span>
            <span>Risk Score: <strong style="font-family:var(--font-mono);">${sc.riskScore}/100</strong></span>
          </div>
          <button class="btn-sm btn-danger" style="width:100%; margin-top:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px;" onclick="triggerSimulation('${sc.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            ${isCurrentlyActive ? 'Re-Inject Attack Spike' : 'Inject Simulated Attack'}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

async function triggerSimulation(scenarioId) {
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: scenarioId })
    });
    const data = await res.json();
    if (window.socAudio) window.socAudio.playAlertSiren();
    
    if (scenarioId === "ALL") {
      showToast("🔥 Coordinated Cyber Warfare Injected: All 5 Sectors Under Attack!", "danger");
      appendTerminalLog("[!] CRITICAL ALERT: Coordinated Multi-Sector Cyber Warfare Detected across 5 municipal grids!", "error");
    } else {
      showToast(`🚨 Simulated Attack Injected: ${data.activeIncident ? data.activeIncident.title : 'Target Compromised'}`, "danger");
      appendTerminalLog(`[!] ALERT: Security Anomaly detected on ${data.activeIncident ? data.activeIncident.targetAssetId : 'SCADA'}. Playbook Armed.`, "warn");
    }

    await fetchDashboardData();
    switchTab("playbook");
  } catch (err) {
    showToast("Failed to trigger simulation: " + err, "danger");
  }
}

function renderIncidentLogs(filterQuery = "") {
  const tbody = document.getElementById("incident-logs-tbody");
  if (!tbody) return;

  let list = state.incidents;
  if (filterQuery) {
    const q = filterQuery.toLowerCase();
    list = list.filter(i => 
      (i.incidentId && i.incidentId.toLowerCase().includes(q)) ||
      (i.sector && i.sector.toLowerCase().includes(q)) ||
      (i.threatCategory && i.threatCategory.toLowerCase().includes(q)) ||
      (i.operatorName && i.operatorName.toLowerCase().includes(q))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:34px; color:var(--text-dim);">No incidents found matching filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(inc => `
    <tr>
      <td style="font-family:var(--font-mono); font-weight:800; color:var(--accent-cyan);">${inc.incidentId}</td>
      <td>${inc.timestamp}</td>
      <td>${inc.sector}</td>
      <td><strong>${inc.threatCategory}</strong></td>
      <td><span class="asset-status-badge badge-${inc.status}">${inc.status}</span></td>
      <td>${inc.operatorName || 'Duty SOC Engineer'}</td>
      <td>
        <button class="btn-sm btn-primary" onclick="viewOfficialCertificate('${inc.incidentId}')">
          📜 View Audit Certificate
        </button>
      </td>
    </tr>
  `).join("");
}

function filterIncidentLogs(query) {
  renderIncidentLogs(query);
}

function openResolveModal(incidentId) {
  if (incidentId) {
    state.selectedIncidentId = incidentId;
  }
  const modal = document.getElementById("resolve-modal");
  if (modal) modal.classList.add("active");
}

function closeResolveModal() {
  const modal = document.getElementById("resolve-modal");
  if (modal) modal.classList.remove("active");
}

function handleModalOverlayClick(event, modalId) {
  if (event.target && event.target.id === modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }
}

async function submitResolveIncident() {
  const notes = document.getElementById("resolve-notes").value || "SOAR Playbook executed with zero service outage.";
  const operatorName = document.getElementById("resolve-operator-name").value || "Cyber Commander (Demmisto / Adani)";
  const incId = state.selectedIncidentId;

  try {
    const res = await fetch(`${API_BASE}/api/incidents/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        incidentId: incId,
        notes: notes, 
        operatorName: operatorName 
      })
    });
    const data = await res.json();
    closeResolveModal();
    if (window.socAudio) window.socAudio.playSuccessChime();
    
    showToast(`✅ Incident [${incId}] Mitigated & Archived to Audit Log!`, "success");
    appendTerminalLog(`[+] Incident [${incId}] successfully mitigated and certified by ${operatorName}.`, "success");

    await fetchDashboardData();
    await fetchIncidents();

    if (data.remainingIncidentsCount > 0) {
      showToast(`${data.remainingIncidentsCount} remaining active incident(s) require mitigation.`, "danger");
      switchTab("playbook");
    } else {
      switchTab("logs");
    }
  } catch (err) {
    showToast("Error resolving incident: " + err, "danger");
  }
}

async function viewOfficialCertificate(incidentId) {
  try {
    const res = await fetch(`${API_BASE}/api/export-report/${incidentId}`);
    const report = await res.json();
    const inc = report.incidentDetails;

    const modalContent = document.getElementById("report-modal-content");
    modalContent.innerHTML = `
      <div style="border: 2px solid var(--accent-cyan); border-radius: 12px; padding: 28px; background: var(--bg-card);">
        <div style="text-align:center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px; margin-bottom: 18px;">
          <h2 style="color:var(--accent-cyan); letter-spacing:1px; font-size:1.2rem; font-weight:800;">${report.reportHeader}</h2>
          <p style="font-size:0.78rem; color:var(--text-muted);">${report.eventJurisdiction}</p>
          <p style="font-size:0.75rem; color:var(--accent-cyan); font-family:var(--font-mono); margin-top:4px;">Timestamp: ${report.generatedAt}</p>
        </div>

        <div style="font-size:0.85rem; line-height:1.7; color:var(--text-main);">
          <p><strong>Incident Reference:</strong> <span style="color:var(--accent-cyan); font-family:var(--font-mono); font-weight:700;">${inc.incidentId}</span></p>
          <p><strong>Target Critical Sector:</strong> ${inc.sector}</p>
          <p><strong>Threat Classification:</strong> ${inc.threatCategory}</p>
          <p><strong>Calculated Risk Score:</strong> ${inc.riskScore} / 100 (${inc.threatLevel})</p>
          <p><strong>Resolution Status:</strong> <span style="color:var(--status-healthy); font-weight:800;">${inc.status}</span></p>
          <p><strong>Duty Officer / Operator:</strong> ${inc.operatorName}</p>
          <p><strong>Public Service Continuity:</strong> ${inc.continuityImpact}</p>
          
          <div style="margin-top:14px;">
            <strong>Mitigation Steps Executed (SOAR Playbook):</strong>
            <ul style="margin-left: 20px; font-size:0.8rem; margin-top:6px; color:var(--text-muted);">
              ${(inc.actionsTaken || []).map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:14px; background:var(--bg-panel); border:1px solid var(--border-subtle); padding:12px; border-radius:8px; font-size:0.78rem;">
            <strong>Operator Sign-Off Findings:</strong>
            <p style="color:var(--text-main); font-style:italic; margin-top:4px;">"${inc.operatorNotes}"</p>
          </div>

          <div style="margin-top:18px; border-top:1px dashed var(--border-subtle); padding-top:12px; font-size:0.72rem; color:var(--text-dim);">
            <strong>Regulatory Compliance Verification:</strong>
            ${(report.complianceStandards || []).map(s => `<div>✓ ${s}</div>`).join("")}
            <div style="margin-top:8px; color:var(--accent-cyan); font-weight:800;">${report.securityOfficerSignOff}</div>
          </div>
        </div>

        <div style="margin-top: 24px; display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn-sm btn-secondary" onclick="closeReportModal()">Close</button>
          <button class="btn-sm btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>
      </div>
    `;

    document.getElementById("report-modal").classList.add("active");
  } catch (err) {
    showToast("Error fetching report certificate: " + err, "danger");
  }
}

function closeReportModal() {
  document.getElementById("report-modal").classList.remove("active");
}

function openAssetDetailModal(assetId) {
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return;

  const content = document.getElementById("asset-modal-content");
  let metricsRows = Object.entries(asset.currentMetrics || {}).map(([k, v]) => `
    <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
      <span style="color:var(--text-muted);">${formatMetricKey(k)}:</span>
      <span style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan);">${v}</span>
    </div>
  `).join("");

  content.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:800; font-size:1.1rem;">${asset.id}</span>
        <span class="asset-status-badge badge-${asset.status}">${asset.status}</span>
      </div>
      <h3 style="margin-bottom:6px; font-weight:800; color:var(--text-main);">${asset.name}</h3>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px;">
        Location: ${asset.location} | Protocol: ${asset.protocol} | IP: ${asset.ip}
      </p>

      <div style="background:var(--bg-panel); border:1px solid var(--border-subtle); padding:14px; border-radius:8px; margin-bottom:18px;">
        <h4 style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); margin-bottom:10px; font-weight:800;">Live Sensor Telemetry</h4>
        ${metricsRows}
      </div>

      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn-sm btn-secondary" onclick="closeAssetModal()">Close</button>
        ${asset.status !== 'ISOLATED' ? `
          <button class="btn-sm btn-danger" onclick="quarantineSingleAsset('${asset.id}')">
            🔒 Emergency Quarantine Network Port
          </button>
        ` : `
          <button class="btn-sm btn-primary" onclick="restoreSingleAsset('${asset.id}')">
            🔓 Re-Authorize & Reconnect Asset
          </button>
        `}
      </div>
    </div>
  `;

  document.getElementById("asset-modal").classList.add("active");
}

function closeAssetModal() {
  document.getElementById("asset-modal").classList.remove("active");
}

async function quarantineSingleAsset(assetId) {
  try {
    for (let a of state.assets) {
      if (a.id === assetId) {
        a.status = "ISOLATED";
      }
    }
    if (window.socAudio) window.socAudio.playIsolationClank();
    closeAssetModal();
    renderAssets();
    if (state.cityMap) state.cityMap.render();
    showToast(`Asset ${assetId} network interface quarantined.`, "danger");
    appendTerminalLog(`[+] Manual Zero-Trust quarantine enforced on asset ${assetId}.`, "warn");
  } catch (e) {
    console.error(e);
  }
}

async function restoreSingleAsset(assetId) {
  try {
    for (let a of state.assets) {
      if (a.id === assetId) {
        a.status = "HEALTHY";
      }
    }
    if (window.socAudio) window.socAudio.playSuccessChime();
    closeAssetModal();
    renderAssets();
    if (state.cityMap) state.cityMap.render();
    showToast(`Asset ${assetId} reconnected and authorized.`, "success");
    appendTerminalLog(`[+] Asset ${assetId} reconnected to municipal OT backbone.`, "success");
  } catch (e) {
    console.error(e);
  }
}

function toggleAudio() {
  if (!window.socAudio) return;
  const isEnabled = window.socAudio.toggleSound();
  const btn = document.getElementById("audio-toggle-btn");
  if (btn) {
    btn.innerHTML = isEnabled 
      ? `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg><span>Siren: ON</span>`
      : `<svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg><span>Siren: OFF</span>`;
  }
  showToast(isEnabled ? "Audio siren alerts enabled." : "Audio muted.", "success");
}

function investigateAlert(incidentId) {
  if (incidentId) {
    state.selectedIncidentId = incidentId;
    state.activeIncident = state.activeIncidents.find(i => i.incidentId === incidentId);
  }
  switchTab("playbook");
  renderPlaybook();
}

function showToast(message, type = "success") {
  const t = document.getElementById("toast-notify");
  if (!t) return;
  t.className = `toast-notification ${type} show`;
  t.innerHTML = `<span>${type === 'danger' ? '🚨' : '✅'}</span> <span>${message}</span>`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    t.classList.remove("show");
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
