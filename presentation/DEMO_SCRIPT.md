# SURAKSHA-CITY: Step-by-Step Live Demo Script for Judges
**Cyber Samvad Hackathon 2026** • Problem Statement 4: Smart City Cybersecurity

Follow these exact steps when demonstrating the live prototype to the judges from Adani University & Demmisto Technologies.

---

### Step 1: Walk the Judges Through the Smart City Dashboard (30 Seconds)
- Open browser at `http://127.0.0.1:5000`.
- Show the **Geospatial City Topology Map**:
  - Point out the 5 critical municipal sectors:
    1. **Water SCADA** (`PLC-WTR-01`, `CHEM-CL-08`, `PRS-VALV-03`)
    2. **Traffic ITMS** (`PLC-TRF-04`, `GW-EMP-01`, `ANPR-CAM-12`)
    3. **11kV Power Grid** (`IED-PWR-07`, `INV-SLR-04`)
    4. **Public Safety & 112 CAD** (`DISP-SRV-02`, `SRV-EGOV-01`)
    5. **Smart Lighting & IoT** (`GW-IOT-99`, `ENV-AIR-05`)
- Show live telemetry readings: Water pressure is normal at 4.2 Bar, traffic cycles smoothly at 90s, and resilience is at 98.4%.

---

### Step 2: Showcase the Dynamic Attack Anatomy (45 Seconds)
- Switch to the **"⚡ Attack Simulation Sandbox"** tab.
- Walk judges through the **Forensic Attack Anatomy** cards:
  - Explain **How the Attack Enters (Ingress):** e.g., Compromised technician maintenance VPN or roadside cabinet tap.
  - Explain **What the Malicious Payload Specifically Does:** Show the raw protocol hex dump (`00 01 00 00 00 0B 01 10 9C A8 00 01 02 03 E8`) forcing setpoint register 40104 to 10.0 Bar.
  - Explain **How the System Detects It:** Deep Packet Inspection (DPI) rule `RULE-ICS-WTR-402` combined with real-time physical pressure derivative $dP/dt > 1.6\text{ Bar/s}$.
  - Explain **Cyber Awareness Takeaway:** Legacy Modbus has zero authentication, requiring pneumatic mechanical interlocks before device isolation.
- Click **"⚡ Inject Simulated Attack"** (or click **"🔥 Launch All 5 Attacks Simultaneously"** to demonstrate multi-sector cyber warfare!).

---

### Step 3: Immediate Alert Triage & Risk Prioritization (30 Seconds)
- The siren sounds! The threat posture leaps to **CRITICAL**.
- The City Map immediately lights up with pulsing red alarm rings around compromised assets.
- Show the **"⚠️ Prioritized Alert Queue"**: Alerts are dynamically ranked by Composite Risk Score (`Impact × Urgency × Likelihood`).
- Click **"💻 Open Analyst Terminal & Playbook"**.

---

### Step 4: Interactive SOC Analyst CLI Command Terminal (60 Seconds)
*(This is the high-impact interactive demonstration)*
- Point out the **Interactive SOC Command Terminal (CLI)** at the top of the playbook.
- Show that analysts can either type real commands in the prompt:
  ```bash
  soc-analyst@suraksha-city:~$ isolate --asset PLC-WTR-01
  ```
  or click the **"⚡ Suggested Analyst Commands"** shortcut buttons!
- Type or click:
  1. `isolate --asset PLC-WTR-01`: Terminal displays `[+] Zero-Trust policy enforced. Port status: 802.1X AUTH_REVOKED. Lateral ingress blocked.` (Step 1 turns green).
  2. `failsafe --asset PRS-VALV-03`: Terminal displays `[+] Hardware fail-safe interlock engaged. Telemetry returned to safe physical limits.` (Step 2 turns green).
  3. `dispatch --team water-scada`: Automated encrypted dispatch ticket sent to State SCADA engineers and CERT-In OT Cell (Step 3 turns green).
  4. `forensics --pcap-dump`: PCAP frames captured; SHA-256 evidence hash generated (Step 4 turns green).
  5. `verify-continuity`: Confirms secondary gravity reservoir line maintains 100% water supply to hospitals and households (Step 5 turns green).
- Observe that the incident status shifts to `READY_TO_RESOLVE`.

---

### Step 5: Official Sign-Off & Audit Certification (30 Seconds)
- Click **"🛡️ Sign Off & Mitigate Incident"**.
- Confirm sign-off: Success chime plays, and the system opens the **"📜 Incident Audit Logs & Certs"** tab.
- Click **"📜 View Audit Certificate"**: Show the print-ready CERT-In / ISO 27001 compliance certificate with officer signature.

---

### Step 6: Cyber Security Awareness & Training Guide (30 Seconds)
- Switch to the **"🎓 Awareness & Analyst Hub"** tab.
- Show the judges the structured educational curriculum:
  - IT vs. OT differences (Confidentiality vs Life Safety & Availability).
  - Why legacy industrial protocols lack encryption.
  - The 5 Golden Rules for Infrastructure SOC Analysts (e.g. why pulling the power cord can cause water hammer pipe bursts).
- Conclude: *"SURAKSHA-CITY is not just a dashboard; it is an active cyber range that trains analysts, explains the anatomy of attacks, and provides hands-on command-line mitigation for smart city resilience."*
