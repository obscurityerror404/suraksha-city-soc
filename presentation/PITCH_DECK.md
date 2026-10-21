# SURAKSHA-CITY: Smart City & Critical Infrastructure Cyber Resilience Center
## 5-Minute Hackathon Pitch Deck & Jury Presentation Script
**Event:** Cyber Samvad Hackathon 2026  
**Organizers:** Adani University & Demmisto Technologies Pvt. Ltd.  
**Problem Statement 4:** Smart City and Critical Infrastructure Cybersecurity  

---

### Slide 1: Problem & Affected Stakeholders (Time: 0:00 – 1:00)
**Presenter:** Team Leader (SOC Strategist)

> *"Good morning, respected judges from Adani University and Demmisto Technologies. Today, our cities are getting smarter, but they are also getting dangerously vulnerable. 
> 
> In modern smart cities, physical infrastructure—our water pumping stations, arterial traffic signals, 11kV power substations, and emergency 112 dispatch servers—are all digitally interconnected. When a cyber attack hits this Operational Technology (OT), it doesn't just corrupt files; it causes immediate physical catastrophe:
> - Water pipes rupture or drinking water is chemically compromised for 250,000 residents.
> - Traffic lights simultaneously turn green at major junctions, causing lethal collisions.
> - Hospital power feeders are tripped, blacking out intensive care units.
> 
> The people affected are urban citizens, emergency first-responders, and municipal operators who are overwhelmed by false alarms and lack a unified way to contain attacks without shutting down public services entirely."*

---

### Slide 2: Practical Solution: SURAKSHA-CITY (Time: 1:00 – 2:00)
**Presenter:** Student 2 (System Architect & Security Engineer)

> *"To solve this, we built **SURAKSHA-CITY**: an enterprise-grade, lightweight Smart City Cyber Operations Center and Interactive Cyber Range designed specifically for municipal cybersecurity analysts.
> 
> Our platform delivers four core innovations:
> 1. **Cross-Sector Geospatial Visibility:** Consolidates 5 critical sectors—Water SCADA, Traffic ITMS, Power Grid, 112 Dispatch, and Public Lighting IoT—into a single live command pane.
> 2. **Deep Attack Anatomy & Detection:** Reveals exactly how the adversary infiltrates (VPN/cabinet taps), dissects raw packet hex dumps, and explains the DPI/sensor detection rules.
> 3. **Hands-On SOC Analyst Command Terminal (CLI):** Moves beyond passive clicking—analysts type and execute real containment commands like `isolate --asset PLC-WTR-01` and `failsafe --mode prv-bypass` in an interactive operational terminal!
> 4. **Built-in Cyber Awareness Hub:** Teaches operators and students the difference between IT and OT security and enforces the 5 Golden Rules of Infrastructure Cyber Defense."*

---

### Slide 3: Live System Demonstration (Time: 2:00 – 3:30)
**Presenter:** Student 3 (Lead Frontend & Demo Specialist) & Student 4 (Threat Simulation Specialist)

> *(Switch to the live running application dashboard at `http://127.0.0.1:5000`)*
> 
> 1. **Baseline State:** *"Here is our city geospatial dashboard. All 12 critical assets across the 5 zones are currently green, and our City Resilience Index is at 98.4%."*
> 2. **Inject Attack & Inspect Anatomy:** *"Now, we simulate an adversary injecting unauthorized Modbus TCP commands into our Central Water Pumping Station PLC (PLC-WTR-01). 
>    - Notice the **Attack Anatomy Inspector**: It shows the ingress entry via a compromised vendor VPN, the raw Modbus FC16 hex payload forcing register 40104 to 10.0 Bar, and how the DPI engine caught the anomaly using physical pressure derivative thresholds ($dP/dt > 1.6\text{ Bar/s}$).
>    - The siren triggers, the threat posture jumps to CRITICAL, and the map pulses red over Zone A."*
> 3. **Interactive SOC Terminal Mitigation:** *"Now, as the duty cybersecurity analyst, I open the terminal. Instead of just clicking a button, I type:
>    - `isolate --asset PLC-WTR-01`: Instantly revokes 802.1X port authorization, severing attacker access.
>    - `failsafe --asset PRS-VALV-03`: Directly commands pneumatic mechanical relief bypass, dropping pressure safely back to 4.4 Bar.
>    - `dispatch --team water-scada`: Sends encrypted dispatch tickets to municipal engineers and the CERT-In OT Cell.
>    - `forensics --pcap-dump`: Cryptographically locks the SHA-256 evidence hash.
>    - `verify-continuity`: Confirms secondary gravity reservoir feeds ensure ZERO water loss for citizens."*
> 4. **Official Audit Certification:** *Finally, we sign off on the incident. The ledger generates an official, print-ready CERT-In compliant Incident Audit Certificate with cryptographic verification."*

---

### Slide 4: Real-World Resilience & Impact (Time: 3:30 – 4:15)
**Presenter:** Student 4 (Resilience & Compliance Lead)

> *"What makes our solution truly win for citizens is **Graceful Degradation**:
> - When a traffic controller is attacked, it doesn't leave cars in crossfire—it defaults to flashing amber within 200ms.
> - When a power feeder trips, hospital microgrids automatically island in 1.4 seconds.
> - We reduce Mean Time to Respond (MTTR) from **45 minutes to under 2 minutes**, preventing loss of life, structural infrastructure damage, and panic."*

---

### Slide 5: Responsible Design, Ethics & Next Steps (Time: 4:15 – 5:00)
**Presenter:** Team Leader (Concluding)

> *"We strictly adhered to the hackathon's ethical guidelines:
> - **Zero-Risk Simulation:** We never scan or attack real infrastructure; all data runs in an isolated synthetic telemetry sandbox.
> - **Privacy Preserving:** We process zero citizen personal data or CCTV facial recognition.
> - **Human-in-the-Loop:** Automation guides the operator, but human authorization is mandatory for critical quarantine actions.
> 
> **Next Steps:** We plan to integrate hardware-in-the-loop Raspberry Pi micro-PLCs, hardware security modules (HSM) for encrypted telemetry, and federated anomaly detection across neighboring municipal councils.
> 
> Thank you, and we are now eager to take your questions!"*
