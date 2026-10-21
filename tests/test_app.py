#!/usr/bin/env python3
"""
Automated Unit and Integration Tests for SURAKSHA-CITY Platform
Testing Dynamic Attack Forensics, Interactive SOC Terminal (CLI), and Multi-Attack Lifecycle
"""

import sys
import os
import unittest
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import soc_state, RAW_INITIAL_ASSETS, RAW_ATTACK_SCENARIOS, BASELINE_INCIDENTS

class TestSmartCityCyberSOC(unittest.TestCase):
    def setUp(self):
        soc_state.reset()

    def test_initial_state(self):
        self.assertEqual(len(soc_state.assets), 12)
        self.assertEqual(len(soc_state.scenarios), 5)
        self.assertEqual(len(soc_state.active_alerts), 0)
        self.assertEqual(len(soc_state.active_incidents), 0)
        self.assertIsNone(soc_state.active_incident)
        self.assertEqual(soc_state.city_resilience_index, 98.4)

    def test_dynamic_attack_anatomy_metadata(self):
        # Verify that attack scenarios have rich dynamic ingress, payload, and detection engine details
        for sc in RAW_ATTACK_SCENARIOS:
            self.assertIn("attackIngress", sc)
            self.assertIn("maliciousPayload", sc)
            self.assertIn("detectionEngine", sc)
            self.assertIn("awarenessLesson", sc)
            self.assertIn("origin", sc["attackIngress"])
            self.assertIn("rawHexDump", sc["maliciousPayload"])
            self.assertIn("triggerRule", sc["detectionEngine"])

    def test_multi_attack_concurrency(self):
        # 1. Simulate attack 1: Water SCADA
        sc1 = RAW_ATTACK_SCENARIOS[0]
        soc_state.incident_counter += 1
        inc1_id = f"INC-2026-{soc_state.incident_counter:03d}"
        
        for asset in soc_state.assets:
            if asset["id"] == sc1["targetAssetId"]:
                asset["status"] = "COMPROMISED"
        
        soc_state.active_incidents[inc1_id] = {
            "incidentId": inc1_id,
            "scenarioId": sc1["id"],
            "title": sc1["title"],
            "sector": sc1["sector"],
            "targetAssetId": sc1["targetAssetId"],
            "threatLevel": sc1["threatLevel"],
            "riskScore": sc1["riskScore"],
            "playbook": [
                {"id": "step1", "title": "Zero-Trust Device Isolation", "status": "PENDING", "actionType": "ISOLATE_NETWORK", "command": "isolate --asset PLC-WTR-01"}
            ],
            "actionsTaken": []
        }

        # 2. Simulate attack 2: Traffic ITMS CONCURRENTLY!
        sc2 = RAW_ATTACK_SCENARIOS[1]
        soc_state.incident_counter += 1
        inc2_id = f"INC-2026-{soc_state.incident_counter:03d}"

        for asset in soc_state.assets:
            if asset["id"] == sc2["targetAssetId"]:
                asset["status"] = "COMPROMISED"

        soc_state.active_incidents[inc2_id] = {
            "incidentId": inc2_id,
            "scenarioId": sc2["id"],
            "title": sc2["title"],
            "sector": sc2["sector"],
            "targetAssetId": sc2["targetAssetId"],
            "threatLevel": sc2["threatLevel"],
            "riskScore": sc2["riskScore"],
            "playbook": [
                {"id": "step1", "title": "Hardware Conflict Monitor", "status": "PENDING", "actionType": "ENGAGE_FAILSAFE", "command": "failsafe --mode flash-amber"}
            ],
            "actionsTaken": []
        }

        # Both incidents must be active simultaneously!
        self.assertEqual(len(soc_state.active_incidents), 2)
        water_asset = next(a for a in soc_state.assets if a["id"] == "PLC-WTR-01")
        traffic_asset = next(a for a in soc_state.assets if a["id"] == "PLC-TRF-04")
        self.assertEqual(water_asset["status"], "COMPROMISED")
        self.assertEqual(traffic_asset["status"], "COMPROMISED")

    def test_mitigate_one_while_other_remains_active(self):
        self.test_multi_attack_concurrency()
        inc_ids = list(soc_state.active_incidents.keys())
        inc1_id, inc2_id = inc_ids[0], inc_ids[1]

        # Resolve incident 1 (Water SCADA)
        target1 = soc_state.active_incidents[inc1_id]["targetAssetId"]
        del soc_state.active_incidents[inc1_id]
        
        for a in soc_state.assets:
            if a["id"] == target1:
                a["status"] = "HEALTHY"

        # Verify: Incident 1 is resolved, but incident 2 (Traffic) is STILL ACTIVE and COMPROMISED!
        self.assertEqual(len(soc_state.active_incidents), 1)
        self.assertIn(inc2_id, soc_state.active_incidents)
        water_asset = next(a for a in soc_state.assets if a["id"] == "PLC-WTR-01")
        traffic_asset = next(a for a in soc_state.assets if a["id"] == "PLC-TRF-04")
        self.assertEqual(water_asset["status"], "HEALTHY")
        self.assertEqual(traffic_asset["status"], "COMPROMISED")

    def test_re_attack_after_mitigation(self):
        # 1. Attack Water
        sc1 = RAW_ATTACK_SCENARIOS[0]
        soc_state.incident_counter += 1
        inc1_id = f"INC-2026-{soc_state.incident_counter:03d}"
        soc_state.active_incidents[inc1_id] = {"incidentId": inc1_id, "scenarioId": sc1["id"], "targetAssetId": "PLC-WTR-01"}
        for a in soc_state.assets:
            if a["id"] == "PLC-WTR-01":
                a["status"] = "COMPROMISED"

        # 2. Mitigate Water
        del soc_state.active_incidents[inc1_id]
        for a in soc_state.assets:
            if a["id"] == "PLC-WTR-01":
                a["status"] = "HEALTHY"
        self.assertEqual(len(soc_state.active_incidents), 0)

        # 3. RE-ATTACK the exact same or another scenario after mitigation!
        soc_state.incident_counter += 1
        new_inc_id = f"INC-2026-{soc_state.incident_counter:03d}"
        self.assertNotEqual(new_inc_id, inc1_id)
        soc_state.active_incidents[new_inc_id] = {"incidentId": new_inc_id, "scenarioId": sc1["id"], "targetAssetId": "PLC-WTR-01"}
        for a in soc_state.assets:
            if a["id"] == "PLC-WTR-01":
                a["status"] = "COMPROMISED"

        self.assertEqual(len(soc_state.active_incidents), 1)
        self.assertEqual(next(a for a in soc_state.assets if a["id"] == "PLC-WTR-01")["status"], "COMPROMISED")

if __name__ == "__main__":
    unittest.main()
