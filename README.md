# ML Deploy Impact: Educational ML Lifecycle Assessment & Model-Selection Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero Build](https://img.shields.io/badge/Build-Zero--build%20Vanilla%20JS-blue.svg)](index.html)
[![Tests](https://img.shields.io/badge/Tests-node%20--test%20(9%20passing)-brightgreen.svg)](tests/simulation-core.test.js)
[![Framing: SCI-for-AI Informed](https://img.shields.io/badge/Framing-SCI--for--AI%20Informed-success.svg)](https://grnsft.org/sci)

An interactive, zero-build educational simulator designed to evaluate the multi-month lifecycle energy and carbon footprint of candidate machine learning models under continuous distribution drift and retraining.

> 🚀 **Live Simulator**: [https://dsachar.net/ml-deploy-impact](https://dsachar.net/ml-deploy-impact)

---

## 🌟 Overview & Purpose

In traditional Automated Machine Learning (AutoML) and MLOps model registries, candidate architectures are conventionally selected based solely on offline validation accuracy over static benchmarks (a heuristic characteristic of *Red AI*). 

In real-world production environments, however:
- **Models respond differently to data drift**: Brittle architectures degrade rapidly and trigger repeated, energy-heavy retraining cycles that quickly dwarf their initial training footprint. Robust architectures maintain predictive stability.
- **Inference compounds over scale**: Serving latency and power draw accumulate across millions of operational requests.
- **Inaccuracies carry environmental costs**: An inaccurate prediction wastes the compute and carbon expended to generate it.

**ML Deploy Impact** acts as an educational model-selection simulator that exposes these multi-month lifecycle trade-offs before code is deployed.

---

## 📐 Relationship to GSF Standards (SCI-for-AI-Informed Framing)

This tool uses an **SCI-for-AI-informed framing** modeled on the principles of:
- **[ISO/IEC 21031:2024](https://www.iso.org/standard/86612.html)** (Information technology — Software carbon intensity specification)
- **[Green Software Foundation (GSF) SCI Specification](https://grnsft.org/sci)** and the **[GSF SCI for AI Working Group](https://github.com/Green-Software-Foundation/sci-ai)**
- **Green AI Paradigm** ([Schwartz et al., 2020](https://doi.org/10.1145/3381831))

### Key Methodology Choices:
1. **Zero Offsets Policy**: In strict adherence to ISO/IEC 21031:2024, market-based carbon offsets and unbundled Renewable Energy Certificates (RECs) cannot be deducted. Carbon values reflect physical energy consumption and regional location-based grid intensities.
2. **Operational Carbon ($O$)**: Accounts for compute execution time scaled by host power draw, datacenter facility Power Usage Effectiveness (PUE default: `1.20`), and location-specific grid emission intensity ($I$).
3. **Embodied Carbon ($M$)**: Quantifies Scope 3 server manufacturing carbon (calibrated from [Boavizta](https://dataviz.boavizta.org/) reference data: 1,200 kgCO₂e per 48-vCPU server over 4 years), amortized across CPU runtime and hardware utilization ($U$).
4. **Persona Boundaries**:
   - **Provider SCI**: Pre-deployment development carbon per trained model ($R = 1\text{ candidate model}$).
   - **Consumer SCI**: Operational carbon rate per 1,000 streaming inferences delivered ($R = R_{\text{total}} / 1{,}000$).
   - **Consumer SCI (QA)**: Quality-Adjusted Consumer SCI, measuring carbon per 1,000 *correct* predictions delivered ($R = R_{\text{correct}} / 1{,}000$). When continuous drift degrades operational accuracy, $R_{\text{correct}}$ drops, applying an exact mathematical penalty:
     $$\text{Consumer SCI (QA)} = \frac{\text{Consumer SCI}}{\overline{Acc} / 100}$$

> ⚠️ **Educational Simulator Framing**: This project is an illustrative, educational model-selection simulator. It is **not** an authoritative SCI measurement agent, compliance audit tool, or procurement certification platform.

---

## 🎯 Scope & Capabilities

The simulation engine models candidate model comparisons across:
- **Development stage**: Initial training compute time and offline benchmark evaluation.
- **Operational serving**: Daily incoming inference volume over customizable lifecycles (1 to 36 months).
- **Continuous drift**: Piecewise-linear performance degradation modeled over streaming predictions.
- **Retraining policies**:
  - `None`: No retraining; model accuracy degrades continuously toward an asymptotic floor.
  - `Fixed`: Periodic calendar retraining (e.g. every 1–12 months).
  - `Threshold`: Accuracy-triggered retraining when live accuracy drops below threshold $\tau$, with optional sub-threshold fallback intervals.
- **Full lifecycle emissions**: Direct sum of operational electricity ($O$) and embodied server manufacturing carbon ($M$) across development, inference serving, and retraining events.
- **Selection heuristics**: Directly compares Traditional AutoML selection (Highest Benchmark Accuracy), Operational Accuracy (Highest Time-Averaged Accuracy), and Green AI selection (Lowest Consumer SCI QA).

---

## 🚫 Explicit Exclusions & Simplifications

To maintain transparency, the following elements are intentionally excluded or simplified:
- **Network transmission**: Ingress/egress bandwidth, API gateway overhead, and WAN network transport energy are not modeled.
- **Persistent storage**: Feature stores, dataset replication, historical checkpoints, and artifact storage are excluded.
- **GPU dynamic power curves**: Uses average active instance power draw (Watts) for CPU workloads rather than dynamic frequency scaling (DVFS) or GPU thermal throttling profiles.
- **Client / edge devices**: Scopes server-side datacenter infrastructure only; does not model client-side device battery/power.
- **Stochastic drift detection**: Assumes a deterministic continuous drift rate per prediction rather than modeling statistical detector delay or false-alarm retrain triggers.

---

## ⚙️ Editable Assumptions & Telemetry Calibration

Default simulator inputs (latencies, power draw, drift robustness, and grid intensities) are **illustrative educational defaults**.

For production evaluation, practitioners should calibrate the simulator with real operational telemetry:
1. **Runtimes**: Profile true inference latency ($t_{\text{inf}}$) and training time ($t_{\text{train}}$) on your target hardware.
2. **Electrical Power**: Measure host server wattage ($P_{\text{machine}}$) under load via IPMI, Intel RAPL, or datacenter PDU meters.
3. **Drift Degradation**: Measure empirical accuracy loss ($\text{robustness}$) across historical streaming validation slices.
4. **Grid Carbon Intensity**: Use actual location-based marginal carbon factors ($I$) for your cloud region (e.g., from [IEA](https://www.iea.org/), [Ember](https://ember-energy.org/), or [Electricity Maps](https://electricitymaps.com/)).

---

## 🚀 Quick Start

The user interface is a zero-build static application that runs directly in any modern browser without npm dependencies, bundlers, or toolchains.

### Option 1: Serve Locally
```bash
# Clone the repository
git clone https://github.com/dsachar.net/ml-deploy-impact.git
cd ml-deploy-impact

# Run any static file server (Python 3)
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.

### Option 2: Direct File Open
Double-click `index.html` or open it directly in Firefox, Chrome, Edge, or Safari.

---

## 🧪 Offline Calculation Test Suite

A standalone, dependency-free test suite verifies the calculation engine using Node.js's built-in test runner:

```bash
# Run tests via npm
npm test

# Or run directly with Node.js (v18+)
node --test tests/simulation-core.test.js
```

### Test Coverage Includes:
- **Retraining count mechanics**: Fixed calendar cycles, threshold-triggered cycles under drift, sub-threshold fallback intervals, and no-retraining floor degradation.
- **Energy & PUE math**: CPU second conversions, Joule accounting, and facility kWh scaling.
- **Operational ($O$) and Embodied ($M$) carbon**: Verification of formula conservation ($C_{\text{total}} = O_{\text{total}} + M_{\text{total}}$) and hardware utilization scaling.
- **Consumer SCI (QA)**: Mathematical validation that inaccurate predictions properly inflate the QA carbon penalty relative to standard Consumer SCI.
- **Boundary conditions**: Zero-drift ($m = 0$), immediate threshold breaches, and performance floor plateaus.

---

## 📁 Repository Structure

```text
ml-deploy-impact/
├── index.html              # Multi-tab interactive user interface & methodology guide
├── styles.css              # Field-notebook responsive design system & carbon slips
├── app.js                  # UI controllers, scenario state, and interactive SVG charts
├── simulation-core.js      # Dependency-free closed-form O(1) simulation calculation engine
├── i18n.js                 # Client-side localization engine (English / French)
├── package.json            # Node metadata & test runner script
├── info.md                 # Complete mathematical specification, formulas & notation
├── LICENSE                 # MIT License
├── locales/
│   ├── en.js               # English translation dictionary
│   └── fr.js               # French translation dictionary
└── tests/
    └── simulation-core.test.js # Offline unit test suite for calculation engine
```

---

## 👥 Authors & Contributors

Created by:
- **[Dimitris Sacharidis](https://dsachar.net)**
- **Antonios Kontaxakis**

*Developed with assistance from GenAI coding tools.*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
