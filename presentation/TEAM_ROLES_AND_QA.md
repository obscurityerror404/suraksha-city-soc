# SURAKSHA-CITY: Team Role Division & Jury Q&A Defense Guide
**Cyber Samvad Hackathon 2026** • Problem Statement 4

---

## 1. Team Role Allocation (For 4 Team Members)

| Member | Title / Role | Primary Responsibilities | During Presentation |
| :--- | :--- | :--- | :--- |
| **Student 1 (Leader)** | **SOC Strategist & Threat Modeling Lead** | Overall project vision, cross-sector threat modeling, MITRE ATT&CK for ICS mapping, composite risk scoring algorithm. | Delivers Opening (Problem Statement, affected citizens) & Conclusion (Impact & Next Steps). |
| **Student 2** | **Backend & ICS Telemetry Architect** | Python REST API architecture, synthetic SCADA telemetry engine, multithreaded simulation state machine, data persistence. | Explains API architecture, Modbus/DNP3/NTCIP protocol simulation, and data flows. |
| **Student 3** | **Frontend & Geospatial UX Lead** | Dark-mode glassmorphic interface, SVG City Infrastructure topology visualization, Web Audio synthesis, interactive filters. | Drives the live screen demo, showcases UI interactions, alert pulses, and node telemetry inspection. |
| **Student 4** | **Incident Response (SOAR) & Compliance Lead** | Zero-Trust isolation mechanics, physical fail-safe logic, automated notification workflows, CERT-In compliance report generation. | Explains the 5-step SOAR playbook, service continuity / graceful degradation, and compliance audit certificates. |

*(Note: If you have a 2-person or 3-person team, combine Member 1+4 and Member 2+3 seamlessly).*

---

## 2. Anticipated Jury Questions & Winning Answers

### Q1 (From Demmisto Security Engineers): *"Why did you build an interactive response checklist rather than fully automating the shutdown of compromised devices?"*
**Answer (Student 4 / Student 1):**
> *"In traditional IT environments, full automation is common (e.g. terminating a user session). However, in Critical Infrastructure (OT/ICS), automated shutdown can be lethal. If an automated system suddenly cuts off a water pumping PLC or shuts off a traffic controller, the shutdown itself can cause pipeline water hammer ruptures or multiple arterial collisions. 
> 
> Therefore, SURAKSHA-CITY employs **Supervised SOAR with Human-in-the-Loop**: our system automates the telemetry correlation and prepares immediate quarantine actions, but requires operator verification to engage physical mechanical fail-safes (e.g. switching traffic lights to flashing amber rather than total blackout). This ensures safety, accountability, and legal compliance."*

---

### Q2 (From Adani University Engineering Faculty): *"How do you calculate your Composite Risk Score and prioritize alerts?"*
**Answer (Student 1 / Student 2):**
> *"Our Risk Prioritization Engine uses a multi-factor formula:
> $$\text{Risk Score} = \text{Asset Criticality Tier} \times \text{Anomaly Confidence} \times \text{Potential Civic Urgency}$$
> - **Asset Criticality:** Tier 1 (Water Pumping PLC, 11kV Hospital Power Relay, Junction-4 Traffic Signal) has a base weight of 1.0; Tier 3 (Streetlight Gateway) has 0.4.
> - **Anomaly Confidence:** Deviations in safety setpoints (e.g. pressure exceeding 6.0 Bar or conflicting green phases) yield high confidence (>0.9).
> - **Urgency:** Life-safety hazards rank as 'Immediate', whereas lateral IoT credential probes rank as 'Medium'.
> This ensures that an operator never misses a dangerous valve tampering event because of a flurry of minor IoT port scans."*

---

### Q3 (From SCADA/OT Domain Judges): *"How does the prototype guarantee public service continuity when an asset is under attack?"*
**Answer (Student 4):**
> *"We designed our architecture around **Graceful Degradation and Fail-Safe Fallbacks**:
> 1. **Water SCADA:** When `PLC-WTR-01` is isolated, mechanical pressure relief valves physically vent excess pressure, while automated secondary gravity-fed bypass lines maintain drinking water to hospitals and homes at nominal 3.5 Bar.
> 2. **Traffic Control:** When `PLC-TRF-04` is attacked with an all-green exploit, the Conflict Monitor Unit (CMU) trips into hardware-enforced Flashing Amber within 200 milliseconds, slowing vehicles safely and preventing intersection collisions while emergency vehicles are rerouted.
> 3. **Power Grid:** When an 11kV breaker trips, hospital Automatic Transfer Switches (ATS) engage isolated diesel generators and solar microgrids in under 1.5 seconds.
> Public services never experience total collapse."*

---

### Q4: *"Did your team scan or test against real municipal infrastructure?"*
**Answer (All Team Members):**
> *"No, absolutely not. In strict compliance with the hackathon guidelines ('Use only a simulated environment or systems you are authorised to test. Do not scan, access, disrupt, or attack real city infrastructure'), we developed an internal synthetic ICS/SCADA telemetry and protocol simulation engine. All telemetry, packet anomalies, and Modbus/DNP3 commands run inside an isolated, ethical sandbox."*

---

### Q5: *"What are the limitations of your prototype today, and what would you build if you had 3 more months?"*
**Answer (Student 1 / Student 2):**
> *"Currently, our prototype simulates 12 assets across 5 sectors and uses rule-based anomaly heuristics. If given 3 more months, we would:
> 1. **Hardware-in-the-Loop (HIL):** Connect physical Arduino/Raspberry Pi micro-PLCs running actual OpenPLC to demonstrate physical relay triggers on miniature scale models.
> 2. **AI/ML Anomaly Baselines:** Train lightweight LSTM autoencoders on nominal SCADA time-series telemetry to detect subtle zero-day sensor spoofing before thresholds are crossed.
> 3. **Federated Threat Intelligence:** Connect multiple city municipal corporations (e.g. Ahmedabad, Surat, Vadodara) via decentralized STIX/TAXII threat intelligence sharing."*
