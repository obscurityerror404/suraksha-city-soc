# SURAKSHA-CITY: Smart City & Critical Infrastructure Cybersecurity Operations Center (SOC)

[![Problem Statement 4](https://img.shields.io/badge/Track-PS--4%20Smart%20City%20Cybersecurity-red.svg)](#)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#)

> **SURAKSHA-CITY** is an enterprise-grade, lightweight Cyber Resilience Operations Center (SOC) designed specifically for municipal operators to identify, prioritize, and neutralize cyber threats affecting critical smart city infrastructure while guaranteeing 100% public service continuity.

---

## 🏛️ Project Context & Problem Statement Alignment

Developed strictly in accordance with **Problem Statement 4: Smart City and Critical Infrastructure Cybersecurity**

| Requirement | SURAKSHA-CITY Implementation |
| :--- | :--- |
| **Build a mock dashboard for sample assets (traffic signals, water sensors, public-service servers)** | Interactive geospatial topology and telemetry grid covering **12 critical assets** across Water SCADA, Traffic ITMS, 11kV Power Grid, 112 Dispatch CAD, and Smart Streetlights. |
| **Display simulated alerts, asset status, and a simple risk level** | Real-time health statuses (`HEALTHY`, `WARNING`, `COMPROMISED`, `ISOLATED`) and composite **Risk Score (1–100)** with dynamic Threat Postures. Supports **multiple concurrent attacks** simultaneously. |
| **Prioritise alerts by potential impact and urgency** | Multi-factor prioritization algorithm evaluating **Asset Criticality Tier $\times$ Anomaly Confidence $\times$ Civic Urgency**. |
| **Provide a basic response checklist (isolate device, notify team, record incident)** | Step-by-step interactive **SOAR Playbook**: 1-click Zero-Trust device quarantine, mechanical fail-safe engage, automated CERT-In dispatch, cryptographic forensics seal, and continuity verification. Multi-incident selector tabs allow managing multiple ongoing crises. |
| **Include an incident log showing alert time, status, and action taken** | Immutable chronological audit ledger with one-click **CERT-In compliant Incident Audit Certificate export** (printable/PDF). |
| **Demonstrate simulated event trigger & continuity of public services** | 5 realistic attack scenarios mapped to **MITRE ATT&CK for ICS** with graceful degradation modes (traffic flashing amber, secondary gravity water feed). Includes **"🔥 Launch All 5 Attacks Simultaneously"** Coordinated Warfare mode. |
| **Re-attack & Resilient Nominal Reset** | Instant, non-blocking **Nominal Reset** and full ability to trigger multiple attacks concurrently or re-attack after mitigation. |
| **Important: Use only a simulated environment** | **100% safe synthetic simulation sandbox**. Zero connection to or scanning of real municipal networks. |

---

## 🚀 Quick Start Guide

### 1. Requirements
- Python 3.10 or higher.
- Modern web browser (Chrome, Edge, Firefox, Safari).
- **Zero external packages required** (runs entirely using Python standard library with zero installation overhead!).

### 2. Launch the Application
```powershell
# Navigate to the project directory
cd C:\Users\Admin\.gemini\antigravity\scratch\smart_city_cybersecurity

# Launch the SOC server
python app.py
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

*(Note: If port 5000 is occupied, the server automatically binds to port 5050, 8080, or 8888 as printed in your console).*

---

## 📂 Project Directory Structure

```
smart_city_cybersecurity/
│
├── app.py                      # Core multithreaded backend server & REST API
├── README.md                   # Complete master documentation
│
├── data/
│   ├── initial_assets.json     # 12 critical assets across 5 municipal sectors
│   ├── attack_scenarios.json   # 5 realistic MITRE ATT&CK for ICS attack vectors
│   └── incident_logs.json      # Immutable historical incident log ledger
│
├── static/
│   ├── index.html              # Main glassmorphic SOC dashboard & pitch deck
│   ├── css/
│   │   └── styles.css          # Modern dark-mode cyber SOC styling & print styles
│   └── js/
│       ├── app.js              # Application controller, polling, and modal logic
│       ├── map.js              # Dynamic SVG geospatial city topology visualizer
│       └── audio.js            # Synthesized Web Audio API sirens & chimes
│
├── tests/
│   └── test_app.py             # Automated unit & integration tests (100% passing)
│
└── presentation/
    ├── PITCH_DECK.md           # 5-minute slide-by-slide script for the jury
    ├── DEMO_SCRIPT.md          # Step-by-step click guide for live demonstration
    ├── TEAM_ROLES_AND_QA.md    # 4-student role distribution & defense Q&A
    └── EXECUTIVE_SUMMARY.md    # Executive briefing on problem, impact & ethics
```

---

## 🔬 Monitored Infrastructure Sectors & Asset Topology

| Sector | Asset ID | Asset Name | Protocol | Criticality Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Water SCADA** | `PLC-WTR-01` | Central Water Pumping Station PLC | Modbus TCP (Port 502) | Tier-1 Critical |
| **Water SCADA** | `CHEM-CL-08` | Water Chlorination Dosing Analyzer | Modbus RTU / SCADA Bus | Tier-1 Critical |
| **Water SCADA** | `PRS-VALV-03` | Arterial Water Pressure Transducer | DNP3 / Serial RTU | Tier-2 High |
| **Traffic ITMS** | `PLC-TRF-04` | Junction-4 Central Traffic Controller | NTCIP / Ethernet | Tier-1 Critical |
| **Traffic ITMS** | `GW-EMP-01` | Emergency Corridor V2X Preemptor | DSRC / V2X 802.11p | Tier-1 Critical |
| **Traffic ITMS** | `ANPR-CAM-12` | Highway ANPR Surveillance Gateway | RTSP / TLS 1.3 | Tier-3 Moderate |
| **Power Grid** | `IED-PWR-07` | Substation 11kV Feeder Protection Relay | IEC 61850 / DNP3 | Tier-1 Critical |
| **Power Grid** | `INV-SLR-04` | Municipal Solar Microgrid Inverter | SunSpec Modbus / TLS | Tier-2 High |
| **Public Safety** | `DISP-SRV-02` | Emergency 112 Dispatch CAD Server | HTTPS / WSS / REST | Tier-1 Critical |
| **Public Safety** | `SRV-EGOV-01` | Smart Citizen e-Governance Portal | HTTPS (Port 443) | Tier-2 High |
| **Lighting & IoT**| `GW-IOT-99` | Smart Streetlight LoRaWAN Gateway | MQTT / LoRaWAN 868MHz | Tier-3 Moderate |
| **Lighting & IoT**| `ENV-AIR-05` | Urban Air Quality Telemetry Mast | CoAP / 6LoWPAN | Tier-4 Low |

---

## ⚡ Attack Scenarios & Mitigations (MITRE ATT&CK for ICS)

1. **SCN-01: Stuxnet-Style Water SCADA Overpressure Manipulation**
   - *Target:* `PLC-WTR-01` (Water Pumping Station)
   - *Technique:* MITRE T0836 (Modify Parameter) & T0855 (Unauthorized Command)
   - *Anomaly:* Unauthorized Modbus FC16 write; pressure spikes from 4.2 Bar to 9.8 Bar.
   - *Mitigation:* Air-gap PLC Ethernet -> Trip pneumatic mechanical PRV -> Engage secondary gravity feed -> Dispatch Water SCADA team & CERT-In.
2. **SCN-02: Traffic Signal MitM & All-Green Collision Exploit**
   - *Target:* `PLC-TRF-04` (Junction-4 Crossing)
   - *Technique:* MITRE T0803 (Block Command Message) & T0816 (Device Modification)
   - *Anomaly:* Injected NTCIP packets hold all four directions green simultaneously.
   - *Mitigation:* Force hardware conflict monitor to Flashing Amber within 200ms -> Reroute hospital ambulances -> Quarantine roadside switch port.
3. **SCN-03: Substation 11kV Feeder DNP3 Trip (Blackout Attack)**
   - *Target:* `IED-PWR-07` (Civil Hospital Substation)
   - *Technique:* MITRE T0855 (Unauthorized Command)
   - *Anomaly:* 75 unauthorized DNP3 Select-Before-Operate trips per second.
   - *Mitigation:* Quarantine rogue MAC -> Engage Hospital ATS diesel/solar microgrid islanding.
4. **SCN-04: Emergency 112 CAD Server Volumetric DDoS & API Exhaustion**
   - *Target:* `DISP-SRV-02` (Emergency 112 CAD)
   - *Technique:* MITRE T0814 (Denial of Service)
   - *Anomaly:* 14,900 req/sec SYN flood depleting server worker threads.
   - *Mitigation:* BGP Anycast scrubbing center reroute -> Failover to isolated copper CAD backup.
5. **SCN-05: Smart Streetlight LoRaWAN Gateway Credential Brute-Force**
   - *Target:* `GW-IOT-99` (Zone 4 Smart Corridor)
   - *Technique:* MITRE T0812 (Default Credentials) & T0866 (Exploit Remote Services)
   - *Anomaly:* 1,480 failed SSH logins within 3 minutes; lateral pivot attempt to water PLC.
   - *Mitigation:* Quarantine WAN -> Engage autonomous astronomical clock fallback -> Rotate credentials.

---

## 🧪 Automated Testing
Run the automated test suite anytime with:
```powershell
python tests/test_app.py
```
*Outputs: 6 passed test cases verifying asset integrity, simulation triggers, playbook state transitions, and resilience calculations.*

---

## 🛡️ Responsible Design & Safety Statement
In strict adherence to the student instructions:
> *"Use only a simulated environment or systems you are authorised to test. Do not scan, access, disrupt, or attack real city infrastructure."*
All assets, sensor telemetry, and threat injections are safely emulated in a local, sandboxed environment. No real-world networks or citizen data are ever collected, processed, or affected.
