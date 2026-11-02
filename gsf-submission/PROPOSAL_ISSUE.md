# GSF Community Proposal Issue

> **Instructions**: When ready to submit, go to [Green-Software-Foundation/reference-implementations/issues/new](https://github.com/Green-Software-Foundation/reference-implementations/issues/new) and paste the title and body below.

---

### Issue Title
```text
[Tool Proposal]: ML Deploy Impact — Educational ML Lifecycle Assessment & Model Selection Simulator
```

---

### Issue Body

```markdown
### 1. Tool Summary & Form
- **Name**: ML Deploy Impact
- **Form**: Client-side, zero-build interactive web simulator (HTML5 / CSS3 / ES6+ JavaScript) and a standalone dependency-free calculation engine (`simulation-core.js`) with an offline test suite.
- **Repository / Demo**: [Live Simulator](https://dsachar.net/ml-deploy-impact) · [Source Code](https://github.com/dsachar/ml-deploy-impact)
- **License**: MIT License
- **Proposed Placement**: `tools/community/ml-deploy-impact/`

### 2. Intended Workload & Use Case
In production machine learning and Automated Machine Learning (AutoML), candidate models are traditionally selected based strictly on offline validation accuracy over static benchmarks (a heuristic characteristic of *Red AI*).

In live production, however:
- **Models respond differently to data drift**: Brittle architectures degrade rapidly and trigger frequent, energy-heavy retraining cycles that can dwarf their initial training footprint. Robust architectures maintain stability.
- **Operational serving compounds**: Inference latency and host electrical power draw accumulate across millions of streaming predictions.
- **Mistakes carry environmental costs**: An inaccurate prediction wastes the compute and carbon expended to generate it.

**ML Deploy Impact** simulates multi-month operational deployments (1–36 months) across competing candidate models. It enables ML engineers, MLOps practitioners, and sustainability researchers to evaluate the trade-offs between static benchmark accuracy, operational drift stability, retraining energy, and quality-adjusted carbon intensity before selecting a model for production.

### 3. Scope & System Boundaries
- **In Scope**:
  - Development stage: Initial model training runtime and offline test evaluation.
  - Operational serving: Continuous daily streaming inference volume ($R_{\text{total}}$).
  - Performance drift: Continuous accuracy decay modeled over incoming query volumes.
  - Retraining policies: Fixed calendar retraining, drift-threshold-triggered retraining ($\tau$), and sub-threshold fallbacks.
  - Full lifecycle emissions: Operational electricity emissions ($O$) and embodied server manufacturing carbon ($M$) across both development and deployment phases.
  - Quality-Adjusted Functional Units:
    - **Consumer SCI**: Operational carbon rate per 1,000 queries served ($R = R_{\text{total}} / 1{,}000$).
    - **Consumer SCI (QA)**: Operational carbon rate per 1,000 *correct* predictions delivered ($R = R_{\text{correct}} / 1{,}000$), directly penalizing models for inaccurate predictions under drift:
      $$\text{Consumer SCI (QA)} = \frac{\text{Consumer SCI}}{\overline{Acc} / 100}$$
- **Out of Scope (Explicit Exclusions)**:
  - Network transmission / API gateway transfer energy.
  - Persistent storage / feature stores / model artifact registries.
  - GPU dynamic voltage/frequency scaling and thermal throttling profiles (uses average active instance power draw for CPU workloads).
  - Client / edge end-user devices (scopes server-side datacenter infrastructure only).
  - Stochastic drift detection noise (assumes a deterministic continuous drift rate per prediction, abstracting away detector latency and false-alarm retrains).

### 4. Methodology Choices & Relationship to GSF Standards
- **Framing**: **SCI-for-AI-informed framing** (an educational model-selection simulator, not an authoritative telemetry measurement or compliance audit tool).
- **Standards Aligned**: Principles of **ISO/IEC 21031:2024** and the **GSF SCI for AI** specification (`Green-Software-Foundation/sci-ai`).
- **Zero-Offsets Rule**: Market-based carbon offsets and unbundled RECs are strictly excluded per ISO/IEC 21031:2024.
- **Embodied Emissions ($M$)**: Calibrated using [Boavizta](https://dataviz.boavizta.org/) reference data ($1{,}200\text{ kg CO}_2\text{e}$ per 48-vCPU server over 4 years), amortized across CPU runtime and server utilization ($U$).
- **Operational Emissions ($O$)**: Workload energy scaled by datacenter PUE ($1.20$) and regional marginal grid carbon intensity ($I$).
- **Telemetry Calibration**: Default inputs are illustrative educational defaults; the tool documents clear guidance on calibrating parameters with real profiler, power meter (IPMI/RAPL/PDU), and historical drift logs.

### 5. Relationship to Existing GSF Entries
- **Comparison to `tools/gsf/agentic-ai-impact-explorer`**: Both are browser-based, interactive educational simulators using documented assumptions. While the Agentic AI Impact Explorer addresses multi-step LLM agent reasoning loops and tool invocations, **ML Deploy Impact** addresses the traditional ML / AutoML lifecycle, specifically highlighting **continuous data drift, repeated retraining, and quality-adjusted functional units (Consumer SCI QA)**.
- **Comparison to `specifications/`**: This is a developer-facing tool and educational simulator that helps teams make greener deployment decisions early in the model development cycle, rather than a normative measurement implementation connecting to live telemetry agents.

### 6. Testing & Runnability
- **Run Locally**: Zero-build static application. Can be launched by opening `index.html` in any browser or running `python3 -m http.server`.
- **Offline Test Suite**: Includes a standalone test suite covering retraining logic, operational/embodied carbon math, PUE scaling, and Consumer SCI (QA) penalty math using the built-in Node test runner (`npm test` / `node --test tests/simulation-core.test.js`).

### 7. Maintainers & Governance
- **Maintainers**: Dimitris Sacharidis ([@dsachar](https://github.com/dsachar)) and Antonios Kontaxakis.
- **License**: MIT License.
```
