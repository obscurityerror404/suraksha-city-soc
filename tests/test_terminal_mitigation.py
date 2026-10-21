import unittest
import json
import urllib.request
import urllib.parse
import threading
import time
from app import run, soc_state, RAW_INITIAL_ASSETS

PORT = 5099
BASE_URL = f"http://127.0.0.1:{PORT}"

def post_json(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(endpoint):
    url = f"{BASE_URL}{endpoint}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode("utf-8"))

class TestTerminalAndMitigation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_thread = threading.Thread(target=run, kwargs={"port": PORT, "host": "127.0.0.1"}, daemon=True)
        cls.server_thread.start()
        time.sleep(0.5)

    def setUp(self):
        soc_state.active_incidents.clear()
        soc_state.active_alerts.clear()
        soc_state.active_incident_id = None
        soc_state.city_resilience_index = 98.4

    def test_01_terminal_general_commands_when_idle(self):
        # Test help
        res = post_json("/api/terminal/execute", {"command": "help"})
        self.assertIn("output", res)
        self.assertTrue(any("Available Infrastructure Defense Commands" in line for line in res["output"]))

        # Test status
        res = post_json("/api/terminal/execute", {"command": "status"})
        self.assertTrue(any("System Resilience Score" in line for line in res["output"]))

        # Test list
        res = post_json("/api/terminal/execute", {"command": "list"})
        self.assertTrue(any("PLC-WTR-01" in line for line in res["output"]))

        # Test ping
        res = post_json("/api/terminal/execute", {"command": "ping PLC-WTR-01"})
        self.assertTrue(any("Reply from 10.240.12.10" in line for line in res["output"]))

    def test_02_attack_and_terminal_step_by_step_mitigation(self):
        # Inject Water Attack (SCN-01)
        sim_res = post_json("/api/simulate", {"scenarioId": "SCN-01"})
        self.assertIn("activeIncident", sim_res)
        inc = sim_res["activeIncident"]
        inc_id = inc["incidentId"]

        # Step 1: isolate
        term_res = post_json("/api/terminal/execute", {"command": "isolate --asset PLC-WTR-01", "incidentId": inc_id})
        self.assertTrue(any("Zero-Trust policy enforced" in line for line in term_res["output"]))
        self.assertIsNotNone(term_res.get("stepExecuted"))

        # Step 2: failsafe
        term_res = post_json("/api/terminal/execute", {"command": "failsafe --asset PRS-VALV-03", "incidentId": inc_id})
        self.assertTrue(any("Hardware fail-safe interlock successfully engaged" in line for line in term_res["output"]))

        # Step 3: dispatch
        term_res = post_json("/api/terminal/execute", {"command": "dispatch --team WaterSCADA_Unit", "incidentId": inc_id})
        self.assertTrue(any("Emergency encrypted dispatch ticket dispatched" in line for line in term_res["output"]))

        # Step 4: forensics
        term_res = post_json("/api/terminal/execute", {"command": "forensics --pcap-dump", "incidentId": inc_id})
        self.assertTrue(any("Raw PCAP frames dumped" in line for line in term_res["output"]))

        # Step 5: verify
        term_res = post_json("/api/terminal/execute", {"command": "verify-continuity", "incidentId": inc_id})
        self.assertTrue(any("Secondary infrastructure audit" in line for line in term_res["output"]))

        # Check all steps completed
        self.assertEqual(term_res["incident"]["status"], "READY_TO_RESOLVE")

        # Resolve incident
        resolve_res = post_json("/api/incidents/resolve", {
            "incidentId": inc_id,
            "notes": "Quarantined rogue packets via CLI",
            "operatorName": "SOC Analyst"
        })
        self.assertEqual(resolve_res["resolvedIncident"]["status"], "RESOLVED")

    def test_03_multi_attack_simultaneous_mitigation(self):
        # Launch ALL 5 attacks
        all_res = post_json("/api/simulate", {"scenarioId": "ALL"})
        self.assertEqual(len(all_res["incidents"]), 5)

        # Get active incidents
        active = get_json("/api/active-incidents")
        self.assertEqual(len(active), 5)

        # Resolve each one
        for inc in active:
            inc_id = inc["incidentId"]
            # Fast execute all steps for this incident
            for s in inc["playbook"]:
                step_res = post_json("/api/playbook/execute-step", {"stepId": s["id"], "incidentId": inc_id})
                self.assertIsNotNone(step_res.get("step"))
            # Resolve
            res = post_json("/api/incidents/resolve", {"incidentId": inc_id, "operatorName": "Duty Commander"})
            self.assertIn("resolvedIncident", res)

        # Verify all incidents are cleared
        final_active = get_json("/api/active-incidents")
        self.assertEqual(len(final_active), 0)

if __name__ == "__main__":
    unittest.main()
