/**
 * Interactive City Infrastructure Topology & Asset Map
 * Renders dynamic SVG nodes, OT bus connections, and live alert telemetry
 * Theme-aware (supports Dark & Light SaaS modes)
 */

class CityMap {
  constructor(containerId, onNodeClick) {
    this.container = document.getElementById(containerId);
    this.onNodeClick = onNodeClick;
    this.assets = [];
    this.render();
  }

  updateAssets(assets) {
    this.assets = assets;
    this.render();
  }

  render() {
    if (!this.container) return;

    const isLight = document.documentElement.getAttribute("data-theme") !== "dark";
    const mapBg = isLight ? "#F8F9FD" : "#0A0E1A";
    const gridStroke = isLight ? "#E7E9F1" : "rgba(255, 255, 255, 0.05)";
    const nodeLabelColor = isLight ? "#20243A" : "#F8FAFC";
    const busStroke = isLight ? "rgba(148, 124, 245, 0.55)" : "rgba(148, 124, 245, 0.4)";

    // SVG Layout dimensions: 900 x 480
    const w = 900;
    const h = 480;

    // Fixed coordinates mapped inside 900x480 canvas for each asset ID
    const coords = {
      // Water Sector (Top Left)
      "PLC-WTR-01": { x: 160, y: 110, sector: "Water & Sanitation" },
      "CHEM-CL-08": { x: 260, y: 80, sector: "Water & Sanitation" },
      "PRS-VALV-03": { x: 190, y: 190, sector: "Water & Sanitation" },

      // Traffic Sector (Center)
      "PLC-TRF-04": { x: 450, y: 220, sector: "Traffic ITMS" },
      "GW-EMP-01": { x: 370, y: 310, sector: "Traffic ITMS" },
      "ANPR-CAM-12": { x: 550, y: 320, sector: "Traffic ITMS" },

      // Power Grid (Top Right)
      "IED-PWR-07": { x: 740, y: 110, sector: "Power Grid" },
      "INV-SLR-04": { x: 670, y: 190, sector: "Power Grid" },

      // Public Safety & CAD (Bottom Center)
      "DISP-SRV-02": { x: 450, y: 390, sector: "Public Safety" },
      "SRV-EGOV-01": { x: 340, y: 420, sector: "Public Safety" },

      // IoT & Lighting (Bottom Right)
      "GW-IOT-99": { x: 760, y: 370, sector: "Lighting & IoT" },
      "ENV-AIR-05": { x: 670, y: 420, sector: "Lighting & IoT" }
    };

    let svgHtml = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:${mapBg}; user-select:none; transition:background 0.3s ease;">
        <defs>
          <!-- Grid Pattern -->
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${gridStroke}" stroke-width="1"/>
          </pattern>
          <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-red" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="${w}" height="${h}" fill="url(#grid)" />

        <!-- Sector Backdrop Zones -->
        <!-- Water Zone -->
        <path d="M 60 40 Q 220 30 310 110 L 260 240 Q 120 230 60 160 Z" fill="rgba(79, 125, 243, 0.05)" stroke="rgba(79, 125, 243, 0.3)" stroke-dasharray="4 4" />
        <text x="80" y="70" fill="rgba(79, 125, 243, 0.85)" font-size="11" font-weight="800" letter-spacing="1">ZONE A: WATER SCADA</text>

        <!-- Power Zone -->
        <path d="M 600 40 Q 780 30 840 120 L 800 240 Q 640 230 580 150 Z" fill="rgba(233, 162, 59, 0.05)" stroke="rgba(233, 162, 59, 0.3)" stroke-dasharray="4 4" />
        <text x="630" y="70" fill="rgba(233, 162, 59, 0.85)" font-size="11" font-weight="800" letter-spacing="1">ZONE B: 11kV SUBSTATION</text>

        <!-- Traffic Arterial Corridor -->
        <path d="M 320 200 L 590 200 L 590 350 L 320 350 Z" fill="rgba(117, 87, 232, 0.05)" stroke="rgba(117, 87, 232, 0.3)" stroke-dasharray="4 4" />
        <text x="340" y="225" fill="rgba(117, 87, 232, 0.85)" font-size="11" font-weight="800" letter-spacing="1">ZONE C: TRAFFIC CORRIDOR (ITMS)</text>

        <!-- Public Safety Command -->
        <path d="M 280 365 L 500 365 L 500 460 L 280 460 Z" fill="rgba(24, 167, 122, 0.05)" stroke="rgba(24, 167, 122, 0.3)" stroke-dasharray="4 4" />
        <text x="295" y="385" fill="rgba(24, 167, 122, 0.85)" font-size="11" font-weight="800" letter-spacing="1">ZONE D: 112 DISPATCH CAD</text>

        <!-- IoT & Lighting -->
        <path d="M 620 350 L 840 350 L 840 460 L 620 460 Z" fill="rgba(148, 124, 245, 0.05)" stroke="rgba(148, 124, 245, 0.3)" stroke-dasharray="4 4" />
        <text x="640" y="375" fill="rgba(148, 124, 245, 0.85)" font-size="11" font-weight="800" letter-spacing="1">ZONE E: SMART IOT & LIGHTING</text>

        <!-- Optical Ring Backbone Bus (Connecting Sectors) -->
        <path d="M 200 130 L 450 220 L 740 120 L 730 380 L 450 390 L 200 130" 
              fill="none" stroke="${busStroke}" stroke-width="2.5" stroke-dasharray="6 6" />
    `;

    // Render Assets Nodes
    this.assets.forEach(asset => {
      const pos = coords[asset.id] || { x: 450, y: 240, sector: "General" };
      const status = asset.status || "HEALTHY";
      let fillColor = "#18A77A"; // Healthy Green
      let strokeColor = isLight ? "#B4EADB" : "#18A77A";
      let filterTag = '';
      let ringAnim = '';

      if (status === "COMPROMISED") {
        fillColor = "#E5485D"; // Red
        strokeColor = isLight ? "#FCD3D9" : "#E5485D";
        filterTag = 'filter="url(#glow-red)"';
        ringAnim = `
          <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="none" stroke="#E5485D" stroke-width="2.5" opacity="0.8">
            <animate attributeName="r" values="14;34" dur="1.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite"/>
          </circle>
        `;
      } else if (status === "WARNING") {
        fillColor = "#E9A23B"; // Amber
        strokeColor = isLight ? "#FADBB0" : "#E9A23B";
      } else if (status === "ISOLATED") {
        fillColor = "#947CF5"; // Secondary Purple
        strokeColor = isLight ? "#DCD3FA" : "#947CF5";
        ringAnim = `
          <circle cx="${pos.x}" cy="${pos.y}" r="20" fill="none" stroke="#947CF5" stroke-width="2" stroke-dasharray="4 4" />
        `;
      }

      svgHtml += `
        <g class="map-node" style="cursor:pointer;" onclick="window.handleNodeClick('${asset.id}')">
          ${ringAnim}
          <circle cx="${pos.x}" cy="${pos.y}" r="14" fill="${isLight ? '#FFFFFF' : '#11172A'}" stroke="${strokeColor}" stroke-width="2.5" ${filterTag} />
          <circle cx="${pos.x}" cy="${pos.y}" r="7" fill="${fillColor}" />
          
          <text x="${pos.x}" y="${pos.y - 19}" fill="${nodeLabelColor}" font-size="10" font-weight="800" text-anchor="middle" font-family="ui-monospace, monospace">
            ${asset.id}
          </text>
          <text x="${pos.x}" y="${pos.y + 26}" fill="${status === 'COMPROMISED' ? '#E5485D' : (isLight ? '#737B91' : '#94A3B8')}" font-size="9" font-weight="600" text-anchor="middle">
            ${asset.name.length > 20 ? asset.name.substring(0, 18) + '...' : asset.name}
          </text>
        </g>
      `;
    });

    svgHtml += `</svg>`;
    this.container.innerHTML = svgHtml;
  }
}

window.CityMap = CityMap;
