#!/usr/bin/env python3
"""
SURAKSHA-CITY: Smart City & Critical Infrastructure Cybersecurity Operations Center (SOC)
Developed for Cyber Samvad Hackathon 2026 (Adani University & Demmisto Technologies)
Problem Statement 4: Smart City and Critical Infrastructure Cybersecurity
"""

import json
import os
import sys
import time
import copy
import threading
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Load baseline datasets
def load_json(filepath, default_val):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[ERROR] Failed to load {filepath}: {e}")
    return default_val

def save_json(filepath, data):
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[ERROR] Failed to save {filepath}: {e}")

# In-memory baseline copies to guarantee pristine resets
RAW_INITIAL_ASSETS = load_json(os.path.join(DATA_DIR, "initial_assets.json"), [])
RAW_ATTACK_SCENARIOS = load_json(os.path.join(DATA_DIR, "attack_scenarios.json"), [])

# Baseline incident log history
BASELINE_INCIDENTS = [
  {
    "incidentId": "INC-2026-001",
    "timestamp": "2026-10-17 08:14:22",
    "sector": "Power & Energy Grid",
    "assetId": "IED-PWR-07",
    "assetName": "Substation 11kV Feeder Protection Relay",
    "threatCategory": "IEC 61850 Port Scan & Routine Probe",
    "threatLevel": "LOW",
    "riskScore": 24,
    "status": "RESOLVED",
    "operatorNotes": "Automated network intrusion sensor detected Nmap SYN scan from municipal test IP. Verified as scheduled routine vulnerability scan. Port filter rules validated.",
    "operatorName": "Duty Operator S. Verma (Badge #SOC-402)",
    "actionsTaken": [
      "Verified IP against authorized vulnerability scan schedule",
      "Confirmed Zero-Trust firewall ACL blocks direct relay modification",
      "Closed ticket with status Normal"
    ],
    "continuityImpact": "No impact on power distribution. Grid operations 100% stable."
  },
  {
    "incidentId": "INC-2026-002",
    "timestamp": "2026-10-17 09:30:15",
    "sector": "Public Lighting & IoT",
    "assetId": "ENV-AIR-05",
    "assetName": "Urban Air Quality & Weather Telemetry Node",
    "threatCategory": "CoAP Malformed Payload Flood",
    "threatLevel": "MEDIUM",
    "riskScore": 48,
    "status": "RESOLVED",
    "operatorNotes": "Anomalous telemetry packet burst caused buffer overrun in CoAP parser. Node temporarily quarantined and reset remotely.",
    "operatorName": "Duty Operator A. Patel (Badge #SOC-108)",
    "actionsTaken": [
      "Quarantined CoAP UDP stream at IoT edge router",
      "Pushed firmware integrity check to environmental mast",
      "Restored nominal telemetry reporting at 60s intervals"
    ],
    "continuityImpact": "Weather dashboard delayed by 8 minutes. No impact on public safety."
  }
]

state_lock = threading.Lock()

class CitySOCState:
    def __init__(self):
        self.incident_counter = 2
        self.reset()

    def reset(self):
        with state_lock:
            # Deep copy pristine assets and scenarios
            self.assets = copy.deepcopy(RAW_INITIAL_ASSETS)
            self.scenarios = copy.deepcopy(RAW_ATTACK_SCENARIOS)
            self.incidents = copy.deepcopy(BASELINE_INCIDENTS)
            
            # Multi-incident support
            self.active_incidents = {}  # incident_id -> incident_dict
            self.active_incident_id = None
            self.active_alerts = []
            
            self.simulated_telemetry_history = {}
            self.start_time = time.time()
            self.city_resilience_index = 98.4
            self.system_mode = "NORMAL_SUPERVISORY"
            
            # Save baseline clean logs to disk
            save_json(os.path.join(DATA_DIR, "incident_logs.json"), self.incidents)
            
            # Initialize telemetry history for each asset
            for asset in self.assets:
                aid = asset["id"]
                val = list(asset["currentMetrics"].values())[0]
                val_num = float(val) if isinstance(val, (int, float)) else 50.0
                self.simulated_telemetry_history[aid] = [
                    {"time": time.strftime("%H:%M:%S", time.localtime(time.time() - (10 - i) * 5)), 
                     "value": val_num}
                    for i in range(10)
                ]

    def recalculate_resilience(self):
        compromised = sum(1 for a in self.assets if a["status"] == "COMPROMISED")
        warning = sum(1 for a in self.assets if a["status"] == "WARNING")
        isolated = sum(1 for a in self.assets if a["status"] == "ISOLATED")
        
        if compromised == 0 and warning == 0 and isolated == 0:
            self.city_resilience_index = 98.4
        else:
            penalty = (compromised * 18.5) + (warning * 8.0) + (isolated * 4.0)
            self.city_resilience_index = max(28.0, round(98.4 - penalty, 1))

    @property
    def active_incident(self):
        if not self.active_incidents:
            return None
        if self.active_incident_id and self.active_incident_id in self.active_incidents:
            return self.active_incidents[self.active_incident_id]
        # Return the incident with highest risk score
        return max(self.active_incidents.values(), key=lambda x: x.get("riskScore", 0))

soc_state = CitySOCState()

# Background telemetry updater for realistic live fluctuations
def telemetry_background_worker():
    import random
    while True:
        time.sleep(3)
        with state_lock:
            for asset in soc_state.assets:
                aid = asset["id"]
                status = asset.get("status", "HEALTHY")
                metrics = asset.get("currentMetrics", {})
                
                if status == "HEALTHY":
                    if "pressure_bar" in metrics:
                        metrics["pressure_bar"] = round(4.1 + random.uniform(-0.15, 0.15), 2)
                        metrics["flow_rate_lps"] = int(450 + random.uniform(-15, 15))
                    elif "chlorine_ppm" in metrics:
                        metrics["chlorine_ppm"] = round(1.8 + random.uniform(-0.05, 0.05), 2)
                    elif "cycle_time_sec" in metrics:
                        metrics["cycle_time_sec"] = 90
                        metrics["packet_rate_sec"] = int(24 + random.uniform(-3, 3))
                    elif "grid_frequency_hz" in metrics:
                        metrics["grid_frequency_hz"] = round(50.0 + random.uniform(-0.04, 0.04), 2)
                    elif "server_cpu_pct" in metrics:
                        metrics["server_cpu_pct"] = int(22 + random.uniform(-4, 6))
                        metrics["req_per_sec"] = int(140 + random.uniform(-20, 20))
                    elif "lux_average" in metrics:
                        metrics["lux_average"] = int(28 + random.uniform(-2, 2))
                elif status == "COMPROMISED":
                    # Add subtle jitter around the compromised values to feel alive!
                    if "pressure_bar" in metrics:
                        metrics["pressure_bar"] = round(max(8.5, metrics["pressure_bar"] + random.uniform(-0.1, 0.1)), 2)
                    elif "server_cpu_pct" in metrics:
                        metrics["server_cpu_pct"] = min(99, max(92, int(metrics["server_cpu_pct"] + random.uniform(-2, 2))))
                    elif "packet_rate_sec" in metrics:
                        metrics["packet_rate_sec"] = int(max(120, metrics["packet_rate_sec"] + random.uniform(-10, 10)))
                
                # Push into history
                if aid in soc_state.simulated_telemetry_history and metrics:
                    first_val = list(metrics.values())[0]
                    val_num = float(first_val) if isinstance(first_val, (int, float)) else 50.0
                    soc_state.simulated_telemetry_history[aid].append({
                        "time": time.strftime("%H:%M:%S"),
                        "value": val_num
                    })
                    if len(soc_state.simulated_telemetry_history[aid]) > 20:
                        soc_state.simulated_telemetry_history[aid].pop(0)

telemetry_thread = threading.Thread(target=telemetry_background_worker, daemon=True)
telemetry_thread.start()


class SOCHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def _send_json_response(self, data, status_code=200):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            self.handle_api_get(path, urllib.parse.parse_qs(parsed.query))
            return

        if path == "/" or path == "":
            self.path = "/index.html"
            return super().do_GET()

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            req_data = json.loads(body.decode("utf-8")) if body else {}
        except Exception:
            req_data = {}

        if path.startswith("/api/"):
            self.handle_api_post(path, req_data)
            return

        self._send_json_response({"error": "Unknown POST route"}, status_code=404)

    def handle_api_get(self, path, query_params):
        with state_lock:
            if path == "/api/status":
                uptime_sec = int(time.time() - soc_state.start_time)
                compromised_count = sum(1 for a in soc_state.assets if a["status"] == "COMPROMISED")
                isolated_count = sum(1 for a in soc_state.assets if a["status"] == "ISOLATED")
                warning_count = sum(1 for a in soc_state.assets if a["status"] == "WARNING")
                
                overall_risk = "LOW"
                if compromised_count > 0:
                    overall_risk = "CRITICAL"
                elif warning_count > 0:
                    overall_risk = "MEDIUM"
                elif isolated_count > 0:
                    overall_risk = "ELEVATED_CONTAINED"

                data = {
                    "systemName": "SURAKSHA-CITY Unified Defense Center",
                    "edition": "Cyber Samvad 2026 Edition",
                    "status": "OPERATIONAL",
                    "uptime_sec": uptime_sec,
                    "cityResilienceScore": round(soc_state.city_resilience_index, 1),
                    "overallRiskLevel": overall_risk,
                    "activeAlertsCount": len(soc_state.active_alerts),
                    "activeIncidentsCount": len(soc_state.active_incidents),
                    "hasActiveIncident": len(soc_state.active_incidents) > 0,
                    "assetsSummary": {
                        "total": len(soc_state.assets),
                        "healthy": sum(1 for a in soc_state.assets if a["status"] == "HEALTHY"),
                        "compromised": compromised_count,
                        "isolated": isolated_count,
                        "warning": warning_count
                    },
                    "sectors": [
                        "Water & Sanitation SCADA",
                        "Traffic Management (ITMS)",
                        "Power & Energy Grid",
                        "Public Safety & Governance",
                        "Public Lighting & IoT"
                    ]
                }
                self._send_json_response(data)
                return

            elif path == "/api/assets":
                sector_filter = query_params.get("sector", [None])[0]
                assets_list = soc_state.assets
                if sector_filter:
                    assets_list = [a for a in assets_list if a["sector"].lower() == sector_filter.lower()]
                self._send_json_response(assets_list)
                return

            elif path.startswith("/api/assets/"):
                asset_id = path.replace("/api/assets/", "").strip()
                for asset in soc_state.assets:
                    if asset["id"].lower() == asset_id.lower():
                        history = soc_state.simulated_telemetry_history.get(asset["id"], [])
                        self._send_json_response({"asset": asset, "telemetryHistory": history})
                        return
                self._send_json_response({"error": "Asset not found"}, status_code=404)
                return

            elif path == "/api/alerts":
                sorted_alerts = sorted(soc_state.active_alerts, key=lambda x: x.get("riskScore", 0), reverse=True)
                self._send_json_response(sorted_alerts)
                return

            elif path == "/api/scenarios":
                # Mark which scenarios are currently active
                active_scenario_ids = set(inc["scenarioId"] for inc in soc_state.active_incidents.values())
                result_scenarios = []
                for sc in RAW_ATTACK_SCENARIOS:
                    sc_copy = copy.deepcopy(sc)
                    sc_copy["isActive"] = sc["id"] in active_scenario_ids
                    result_scenarios.append(sc_copy)
                self._send_json_response(result_scenarios)
                return

            elif path == "/api/active-incidents":
                incidents_list = list(soc_state.active_incidents.values())
                incidents_list.sort(key=lambda x: x.get("riskScore", 0), reverse=True)
                self._send_json_response(incidents_list)
                return

            elif path == "/api/active-incident":
                inc_id = query_params.get("id", [None])[0]
                if inc_id and inc_id in soc_state.active_incidents:
                    self._send_json_response(soc_state.active_incidents[inc_id])
                    return
                # Return current selected or highest
                self._send_json_response(soc_state.active_incident or {})
                return

            elif path == "/api/incidents":
                self._send_json_response(soc_state.incidents)
                return

            elif path.startswith("/api/export-report/"):
                inc_id = path.replace("/api/export-report/", "").strip()
                target_inc = None
                for inc in soc_state.incidents:
                    if inc["incidentId"].lower() == inc_id.lower():
                        target_inc = inc
                        break
                
                if not target_inc and inc_id in soc_state.active_incidents:
                    target_inc = soc_state.active_incidents[inc_id]

                if target_inc:
                    report = {
                        "reportHeader": "MUNICIPAL CYBER SECURITY INCIDENT AUDIT CERTIFICATE",
                        "eventJurisdiction": "City Smart Infrastructure Cyber Defense Cell & Demmisto CERT Hub",
                        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC+05:30"),
                        "incidentDetails": target_inc,
                        "complianceStandards": [
                            "CERT-In Cyber Security Incident Reporting Guidelines 2026",
                            "ISO/IEC 27001 & ISA/IEC 62443 Critical Infrastructure Security",
                            "National Critical Information Infrastructure Protection Centre (NCIIPC) Directives"
                        ],
                        "securityOfficerSignOff": "Digitally Authenticated by SOC Chief Officer (ID: ADANI-CYBER-2026)"
                    }
                    self._send_json_response(report)
                    return
                self._send_json_response({"error": "Incident ID not found"}, status_code=404)
                return

            self._send_json_response({"error": "Endpoint not found"}, status_code=404)

    def handle_api_post(self, path, req_data):
        with state_lock:
            if path == "/api/simulate":
                scenario_id = req_data.get("scenarioId")
                
                # Check for "ALL" to launch multi-attack cyber warfare!
                scenarios_to_run = []
                if scenario_id == "ALL":
                    scenarios_to_run = copy.deepcopy(RAW_ATTACK_SCENARIOS)
                else:
                    target_scenario = None
                    for s in RAW_ATTACK_SCENARIOS:
                        if s["id"] == scenario_id or s["id"].lower().startswith(scenario_id.lower()):
                            target_scenario = copy.deepcopy(s)
                            break
                    if not target_scenario:
                        self._send_json_response({"error": f"Invalid scenario ID '{scenario_id}'"}, status_code=400)
                        return
                    scenarios_to_run = [target_scenario]

                created_incidents = []
                for scenario in scenarios_to_run:
                    soc_state.incident_counter += 1
                    incident_number = f"INC-2026-{soc_state.incident_counter:03d}"
                    alert_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    target_id = scenario["targetAssetId"]
                    secondary_id = scenario.get("secondaryAssetId")

                    # Mutate target asset status and telemetry
                    for asset in soc_state.assets:
                        if asset["id"] == target_id:
                            asset["status"] = "COMPROMISED"
                            asset["riskScore"] = scenario["riskScore"]
                            for k, v in scenario["telemetryChanges"].items():
                                asset["currentMetrics"][k] = v
                        elif secondary_id and asset["id"] == secondary_id:
                            if asset["status"] != "COMPROMISED":
                                asset["status"] = "WARNING"
                                asset["riskScore"] = max(asset.get("riskScore", 0), 65)

                    # Fresh playbook with all steps PENDING
                    fresh_playbook = copy.deepcopy(scenario["playbook"])
                    for step in fresh_playbook:
                        step["status"] = "PENDING"
                        if "completedAt" in step:
                            del step["completedAt"]

                    new_alert = {
                        "alertId": f"ALT-{int(time.time())}-{incident_number}",
                        "incidentId": incident_number,
                        "title": scenario["title"],
                        "sector": scenario["sector"],
                        "category": scenario["category"],
                        "targetAssetId": target_id,
                        "mitreId": scenario["mitreId"],
                        "threatLevel": scenario["threatLevel"],
                        "riskScore": scenario["riskScore"],
                        "urgency": scenario["urgency"],
                        "timestamp": alert_time,
                        "potentialImpact": scenario["potentialImpact"],
                        "anomalyEvidence": scenario["anomalyEvidence"],
                        "status": "ACTIVE_INVESTIGATION"
                    }

                    # Push alert to list (avoid duplicates for same incident)
                    soc_state.active_alerts.insert(0, new_alert)

                    # Create and store in active_incidents dictionary
                    new_incident = {
                        "incidentId": incident_number,
                        "scenarioId": scenario["id"],
                        "title": scenario["title"],
                        "sector": scenario["sector"],
                        "targetAssetId": target_id,
                        "secondaryAssetId": secondary_id,
                        "threatLevel": scenario["threatLevel"],
                        "riskScore": scenario["riskScore"],
                        "urgency": scenario["urgency"],
                        "alertTime": alert_time,
                        "potentialImpact": scenario["potentialImpact"],
                        "anomalyEvidence": scenario["anomalyEvidence"],
                        "continuityPlan": scenario.get("continuityPlan", "Automatic failover active"),
                        "playbook": fresh_playbook,
                        "actionsTaken": [],
                        "operatorNotes": "",
                        "status": "OPEN",
                        "startTime": time.time()
                    }

                    soc_state.active_incidents[incident_number] = new_incident
                    soc_state.active_incident_id = incident_number
                    created_incidents.append(new_incident)

                soc_state.recalculate_resilience()

                self._send_json_response({
                    "message": f"Successfully launched {len(created_incidents)} simulated attack(s).",
                    "incidents": created_incidents,
                    "activeIncident": soc_state.active_incident
                })
                return

            elif path == "/api/playbook/select-incident":
                inc_id = req_data.get("incidentId")
                if inc_id in soc_state.active_incidents:
                    soc_state.active_incident_id = inc_id
                    self._send_json_response({
                        "message": f"Selected incident {inc_id}",
                        "activeIncident": soc_state.active_incidents[inc_id]
                    })
                    return
                self._send_json_response({"error": "Incident ID not found in active incidents"}, status_code=404)
                return

            elif path == "/api/playbook/execute-step":
                step_id = req_data.get("stepId")
                inc_id = req_data.get("incidentId") or soc_state.active_incident_id

                if not soc_state.active_incidents:
                    self._send_json_response({"error": "No active incidents to mitigate"}, status_code=400)
                    return

                target_incident = None
                if inc_id and inc_id in soc_state.active_incidents:
                    target_incident = soc_state.active_incidents[inc_id]
                else:
                    target_incident = soc_state.active_incident

                if not target_incident:
                    self._send_json_response({"error": "Target incident not found"}, status_code=404)
                    return

                executed_step = None
                for step in target_incident["playbook"]:
                    if step["id"] == step_id:
                        step["status"] = "COMPLETED"
                        step["completedAt"] = datetime.now().strftime("%H:%M:%S")
                        executed_step = step
                        break

                if not executed_step:
                    self._send_json_response({"error": "Step not found in active playbook"}, status_code=404)
                    return

                action_type = executed_step.get("actionType")
                target_asset_id = executed_step.get("assetId") or target_incident["targetAssetId"]

                # Perform actual simulated mitigation on asset
                if action_type == "ISOLATE_NETWORK":
                    for asset in soc_state.assets:
                        if asset["id"] == target_asset_id:
                            asset["status"] = "ISOLATED"
                            asset["riskScore"] = max(10, asset["riskScore"] - 50)
                            asset["failSafeStatus"] = "AIR_GAPPED (Quarantined)"
                    target_incident["actionsTaken"].append(f"Network isolated asset {target_asset_id} to halt cyber infection vector.")

                elif action_type == "ENGAGE_FAILSAFE":
                    for asset in soc_state.assets:
                        if asset["id"] == target_asset_id:
                            asset["failSafeStatus"] = "ENGAGED_MANUAL_BYPASS"
                            if "pressure_bar" in asset["currentMetrics"]:
                                asset["currentMetrics"]["pressure_bar"] = 4.4
                            if "active_phase" in asset["currentMetrics"]:
                                asset["currentMetrics"]["active_phase"] = "FLASHING_AMBER_SAFE"
                                asset["currentMetrics"]["conflict_monitor"] = "INTERLOCKED_SAFE"
                            if "breaker_status" in asset["currentMetrics"]:
                                asset["currentMetrics"]["breaker_status"] = "ISLAND_MICROGRID_ACTIVE"
                            if "server_cpu_pct" in asset["currentMetrics"]:
                                asset["currentMetrics"]["server_cpu_pct"] = 35
                                asset["currentMetrics"]["req_per_sec"] = 280
                            if "lux_average" in asset["currentMetrics"]:
                                asset["currentMetrics"]["lux_average"] = 25
                    target_incident["actionsTaken"].append(f"Engaged physical/hardware fail-safe for asset {target_asset_id}.")

                elif action_type == "DISPATCH_TEAM":
                    team = executed_step.get("team", "Specialized Field Response Unit")
                    target_incident["actionsTaken"].append(f"Dispatched {team} via secure municipal automated dispatch.")

                elif action_type == "LOG_FORENSICS":
                    target_incident["actionsTaken"].append(f"Preserved digital forensic evidence & cryptographic PCAP hash.")

                elif action_type == "VERIFY_CONTINUITY":
                    target_incident["actionsTaken"].append(f"Verified secondary public service redundancy: ZERO disruption to citizens.")

                soc_state.recalculate_resilience()

                all_done = all(s["status"] == "COMPLETED" for s in target_incident["playbook"])
                if all_done:
                    target_incident["status"] = "READY_TO_RESOLVE"

                self._send_json_response({
                    "message": f"Step '{executed_step['title']}' executed successfully.",
                    "step": executed_step,
                    "allCompleted": all_done,
                    "incident": target_incident
                })
                return

            elif path == "/api/incidents/resolve":
                inc_id = req_data.get("incidentId") or soc_state.active_incident_id
                operator_notes = req_data.get("notes", "Incident neutralized through SOAR playbook response.")
                operator_name = req_data.get("operatorName", "Cyber Operations Commander")

                if not soc_state.active_incidents:
                    self._send_json_response({"error": "No active incidents to resolve"}, status_code=400)
                    return

                target_incident = None
                if inc_id and inc_id in soc_state.active_incidents:
                    target_incident = soc_state.active_incidents[inc_id]
                else:
                    target_incident = soc_state.active_incident

                if not target_incident:
                    self._send_json_response({"error": "Incident to resolve not found"}, status_code=404)
                    return

                resolved_id = target_incident["incidentId"]
                target_asset_id = target_incident["targetAssetId"]
                secondary_asset_id = target_incident.get("secondaryAssetId")

                incident_record = {
                    "incidentId": resolved_id,
                    "timestamp": target_incident["alertTime"],
                    "resolvedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "sector": target_incident["sector"],
                    "assetId": target_asset_id,
                    "threatCategory": target_incident["title"],
                    "threatLevel": target_incident["threatLevel"],
                    "riskScore": target_incident["riskScore"],
                    "status": "RESOLVED",
                    "operatorNotes": operator_notes,
                    "operatorName": operator_name,
                    "actionsTaken": target_incident["actionsTaken"],
                    "continuityImpact": target_incident.get("continuityPlan", "Public service continuity maintained 100%.")
                }

                # Save into historical log
                soc_state.incidents.insert(0, incident_record)
                save_json(os.path.join(DATA_DIR, "incident_logs.json"), soc_state.incidents)

                # Remove from active incidents
                del soc_state.active_incidents[resolved_id]

                # Clear alerts for this resolved incident
                soc_state.active_alerts = [a for a in soc_state.active_alerts if a.get("incidentId") != resolved_id]

                # Restore the assets affected by this specific incident (if no other active incident targets them)
                remaining_target_ids = set(inc["targetAssetId"] for inc in soc_state.active_incidents.values())
                remaining_sec_ids = set(inc.get("secondaryAssetId") for inc in soc_state.active_incidents.values() if inc.get("secondaryAssetId"))

                for asset in soc_state.assets:
                    aid = asset["id"]
                    if aid in [target_asset_id, secondary_asset_id]:
                        if aid not in remaining_target_ids and aid not in remaining_sec_ids:
                            asset["status"] = "HEALTHY"
                            asset["riskScore"] = 10
                            asset["failSafeStatus"] = "ARMED"
                            for base in RAW_INITIAL_ASSETS:
                                if base["id"] == aid:
                                    asset["currentMetrics"] = copy.deepcopy(base["currentMetrics"])

                # Select next active incident if available
                if soc_state.active_incidents:
                    soc_state.active_incident_id = list(soc_state.active_incidents.keys())[0]
                else:
                    soc_state.active_incident_id = None

                soc_state.recalculate_resilience()

                self._send_json_response({
                    "message": f"Incident {resolved_id} resolved and archived successfully.",
                    "resolvedIncident": incident_record,
                    "remainingIncidentsCount": len(soc_state.active_incidents),
                    "nextActiveIncident": soc_state.active_incident
                })
                return

            elif path == "/api/terminal/execute":
                cmd = req_data.get("command", "").strip()
                inc_id = req_data.get("incidentId") or soc_state.active_incident_id
                
                target_incident = None
                if inc_id and inc_id in soc_state.active_incidents:
                    target_incident = soc_state.active_incidents[inc_id]
                else:
                    target_incident = soc_state.active_incident

                cmd_lower = cmd.lower()
                response_lines = []
                step_executed = None

                if cmd_lower in ["help", "?", "commands"]:
                    response_lines = [
                        "[+] SURAKSHA-CITY SOC Analyst Terminal v2.6",
                        "Available Infrastructure Defense Commands:",
                        "  isolate --asset <ID>      : Zero-Trust network containment & quarantine port",
                        "  failsafe --asset <ID>     : Force mechanical/hardware fail-safe interlock",
                        "  dispatch --team <NAME>    : Route automated high-priority emergency dispatch",
                        "  forensics --pcap-dump     : Freeze volatile memory, capture PCAP & SHA-256 hash",
                        "  verify-continuity         : Audit backup redundancy (gravity feed/island microgrid)",
                        "  status                    : Display current city defense posture & active threats",
                        "  clear                     : Clear terminal screen output"
                    ]
                elif cmd_lower == "status":
                    response_lines = [
                        f"[+] System Resilience Score: {soc_state.city_resilience_index}%",
                        f"[+] Threat Level Posture  : {('CRITICAL' if soc_state.active_incidents else 'LOW')}",
                        f"[+] Active Cyber Attacks  : {len(soc_state.active_incidents)}",
                        f"[+] Monitored Asset Nodes : {len(soc_state.assets)} total"
                    ]
                    for inc in soc_state.active_incidents.values():
                        title = inc.get("title") or inc.get("threatCategory", "Active Attack")
                        risk = inc.get("riskScore", 80)
                        target = inc.get("targetAssetId", "SCADA")
                        inc_id = inc.get("incidentId", "INC-2026")
                        response_lines.append(f"  -> [{inc_id}] {title} (Risk: {risk}/100, Target: {target})")
                elif cmd_lower in ["list", "assets"]:
                    response_lines = [
                        "[+] Monitored SCADA / IT Infrastructure Inventory (12 Nodes):"
                    ]
                    for a in soc_state.assets:
                        response_lines.append(f"  {a['id']:<14} | {a['sector']:<24} | Status: {a['status']:<11} | IP: {a['ip']}")
                elif cmd_lower.startswith("ping"):
                    parts = cmd.split()
                    target = parts[1] if len(parts) > 1 else "192.168.10.1"
                    matched_asset = next((a for a in soc_state.assets if a["id"].lower() == target.lower() or a["ip"] == target), None)
                    if matched_asset:
                        response_lines = [
                            f"[+] PING {matched_asset['id']} ({matched_asset['ip']}) with 32 bytes of Modbus/TCP echo:",
                            f"    Reply from {matched_asset['ip']}: bytes=32 time=1.4ms TTL=64 Status={matched_asset['status']}",
                            f"    Reply from {matched_asset['ip']}: bytes=32 time=1.2ms TTL=64 Status={matched_asset['status']}",
                            f"[+] Ping statistics for {matched_asset['id']}: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)"
                        ]
                    else:
                        response_lines = [
                            f"[+] PING {target} with 32 bytes of ICMP data:",
                            f"    Reply from {target}: bytes=32 time=2.1ms TTL=58",
                            f"[+] Host {target} is reachable via municipal OT optical backbone."
                        ]
                elif not target_incident:
                    if "isolate" in cmd_lower:
                        # Find specified asset if any
                        parts = cmd.split()
                        target_aid = None
                        for p in parts:
                            clean_p = p.replace("--asset", "").replace("=", "").strip()
                            for a in soc_state.assets:
                                if clean_p.lower() == a["id"].lower():
                                    target_aid = a["id"]
                                    break
                        if target_aid:
                            for a in soc_state.assets:
                                if a["id"] == target_aid:
                                    a["status"] = "ISOLATED"
                                    a["failSafeStatus"] = "AIR_GAPPED (Quarantined)"
                            soc_state.recalculate_resilience()
                            response_lines = [
                                f"[+] [SUCCESS] Zero-Trust network containment manually enforced on {target_aid}.",
                                f"[+] Port 802.1X AUTH_REVOKED. Node quarantined."
                            ]
                        else:
                            response_lines = [
                                "[-] Specify asset ID to isolate, e.g.: isolate --asset PLC-WTR-01"
                            ]
                    elif "restore" in cmd_lower:
                        parts = cmd.split()
                        target_aid = None
                        for p in parts:
                            clean_p = p.replace("--asset", "").replace("=", "").strip()
                            for a in soc_state.assets:
                                if clean_p.lower() == a["id"].lower():
                                    target_aid = a["id"]
                                    break
                        if target_aid:
                            for a in soc_state.assets:
                                if a["id"] == target_aid:
                                    a["status"] = "HEALTHY"
                                    a["failSafeStatus"] = "ARMED"
                            soc_state.recalculate_resilience()
                            response_lines = [
                                f"[+] [SUCCESS] Asset {target_aid} re-authorized and reconnected to optical OT ring."
                            ]
                        else:
                            response_lines = [
                                "[-] Specify asset ID to restore, e.g.: restore --asset PLC-WTR-01"
                            ]
                    else:
                        response_lines = [
                            "[-] No active cyber incident selected.",
                            "    Type 'help' for commands, 'status' for system health, 'list' for assets,",
                            "    or trigger an attack simulation from the 'Attack Simulation Sandbox' tab."
                        ]
                else:
                    # Match against playbook actions or commands
                    executed_step = None
                    target_asset_id = target_incident["targetAssetId"]
                    action_type = None

                    if "isolate" in cmd_lower:
                        action_type = "ISOLATE_NETWORK"
                    elif "failsafe" in cmd_lower or "cmu" in cmd_lower or "prv" in cmd_lower or "amber" in cmd_lower:
                        action_type = "ENGAGE_FAILSAFE"
                    elif "dispatch" in cmd_lower:
                        action_type = "DISPATCH_TEAM"
                    elif "forensics" in cmd_lower or "pcap" in cmd_lower or "sha256" in cmd_lower or "fir" in cmd_lower:
                        action_type = "LOG_FORENSICS"
                    elif "verify" in cmd_lower or "continuity" in cmd_lower or "reroute" in cmd_lower:
                        action_type = "VERIFY_CONTINUITY"

                    # Find matching step in playbook
                    for step in target_incident["playbook"]:
                        if (action_type and step.get("actionType") == action_type) or (cmd_lower in step.get("command", "").lower()) or (step.get("command", "").lower() in cmd_lower):
                            step["status"] = "COMPLETED"
                            step["completedAt"] = datetime.now().strftime("%H:%M:%S")
                            executed_step = step
                            break

                    if executed_step:
                        step_executed = executed_step
                        atype = executed_step.get("actionType")
                        aid = executed_step.get("assetId") or target_asset_id

                        if atype == "ISOLATE_NETWORK":
                            for asset in soc_state.assets:
                                if asset["id"] == aid:
                                    asset["status"] = "ISOLATED"
                                    asset["riskScore"] = max(10, asset["riskScore"] - 50)
                                    asset["failSafeStatus"] = "AIR_GAPPED (Quarantined)"
                            target_incident["actionsTaken"].append(f"[CLI] Zero-Trust network port severed on {aid}.")
                            response_lines = [
                                f"[+] [SUCCESS] Command: '{cmd}'",
                                f"[+] Zero-Trust policy enforced on asset {aid}.",
                                f"[+] Port status: 802.1X AUTH_REVOKED. Lateral ingress blocked.",
                                f"[+] Playbook step '{executed_step['title']}' marked COMPLETED."
                            ]
                        elif atype == "ENGAGE_FAILSAFE":
                            for asset in soc_state.assets:
                                if asset["id"] == aid:
                                    asset["failSafeStatus"] = "ENGAGED_MANUAL_BYPASS"
                                    if "pressure_bar" in asset["currentMetrics"]:
                                        asset["currentMetrics"]["pressure_bar"] = 4.4
                                    if "active_phase" in asset["currentMetrics"]:
                                        asset["currentMetrics"]["active_phase"] = "FLASHING_AMBER_SAFE"
                                        asset["currentMetrics"]["conflict_monitor"] = "INTERLOCKED_SAFE"
                                    if "breaker_status" in asset["currentMetrics"]:
                                        asset["currentMetrics"]["breaker_status"] = "ISLAND_MICROGRID_ACTIVE"
                                    if "server_cpu_pct" in asset["currentMetrics"]:
                                        asset["currentMetrics"]["server_cpu_pct"] = 35
                                    if "lux_average" in asset["currentMetrics"]:
                                        asset["currentMetrics"]["lux_average"] = 25
                            target_incident["actionsTaken"].append(f"[CLI] Mechanical/hardware fail-safe engaged on {aid}.")
                            response_lines = [
                                f"[+] [SUCCESS] Command: '{cmd}'",
                                f"[+] Hardware fail-safe interlock successfully engaged on {aid}.",
                                f"[+] Telemetry returned to physical safe operational boundaries.",
                                f"[+] Playbook step '{executed_step['title']}' marked COMPLETED."
                            ]
                        elif atype == "DISPATCH_TEAM":
                            team = executed_step.get("team", "Specialized Field Response Unit")
                            target_incident["actionsTaken"].append(f"[CLI] Automated dispatch ticket sent to {team}.")
                            response_lines = [
                                f"[+] [SUCCESS] Command: '{cmd}'",
                                f"[+] Emergency encrypted dispatch ticket dispatched to: {team}.",
                                f"[+] Response SLA timer active. Step '{executed_step['title']}' marked COMPLETED."
                            ]
                        elif atype == "LOG_FORENSICS":
                            target_incident["actionsTaken"].append(f"[CLI] PCAP traffic dump & cryptographic SHA-256 seal captured.")
                            response_lines = [
                                f"[+] [SUCCESS] Command: '{cmd}'",
                                f"[+] Raw PCAP frames dumped to forensic vault.",
                                f"[+] SHA-256 Evidence Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                                f"[+] Evidence locked into immutable compliance ledger. Step COMPLETED."
                            ]
                        elif atype == "VERIFY_CONTINUITY":
                            target_incident["actionsTaken"].append(f"[CLI] Verified public service redundancy.")
                            response_lines = [
                                f"[+] [SUCCESS] Command: '{cmd}'",
                                f"[+] Secondary infrastructure audit: Gravity line / Backup ATS verified nominal.",
                                f"[+] Public service continuity: 100% uninterrupted. Step COMPLETED."
                            ]

                        soc_state.recalculate_resilience()
                        all_done = all(s["status"] == "COMPLETED" for s in target_incident["playbook"])
                        if all_done:
                            target_incident["status"] = "READY_TO_RESOLVE"
                            response_lines.append("[+] [ALERT] All playbook actions executed! Ready for official operator sign-off.")
                    else:
                        response_lines = [
                            f"[?] Command '{cmd}' executed in sandboxed terminal.",
                            "[-] No matching pending playbook action found. Type 'help' to view valid commands."
                        ]

                self._send_json_response({
                    "command": cmd,
                    "output": response_lines,
                    "stepExecuted": step_executed,
                    "incident": target_incident
                })
                return

            self._send_json_response({"error": "Unknown POST route"}, status_code=404)


def run(port=5000, host="127.0.0.1"):
    candidate_ports = [port, 5050, 8080, 8888, 3000]
    httpd = None
    actual_port = port
    for p in candidate_ports:
        try:
            server_address = (host, p)
            httpd = ThreadingHTTPServer(server_address, SOCHandler)
            actual_port = p
            break
        except Exception:
            continue

    if not httpd:
        print("[CRITICAL] Could not bind server to any standard port.")
        sys.exit(1)

    print(f"\n=======================================================")
    print(f"  SURAKSHA-CITY: Smart City Cyber Defense Center")
    print(f"  Organized by Adani University & Demmisto Technologies")
    print(f"  Problem Statement 4: Smart City & Infrastructure Security")
    print(f"=======================================================")
    print(f"  SOC Dashboard running at: http://{host}:{actual_port}")
    print(f"  Press Ctrl+C to stop the server\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...")
        httpd.shutdown()

if __name__ == "__main__":
    port_to_use = 5000
    if len(sys.argv) > 1:
        try:
            port_to_use = int(sys.argv[1])
        except ValueError:
            pass
    run(port=port_to_use)
