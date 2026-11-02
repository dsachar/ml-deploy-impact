# GSF Community Pull Request Template

> **Instructions**: Use this description when submitting the Pull Request to [`Green-Software-Foundation/reference-implementations`](https://github.com/Green-Software-Foundation/reference-implementations).

---

### PR Title
```text
feat(tools/community): add ml-deploy-impact simulator
```

---

### PR Body

```markdown
## Summary
Adds **ML Deploy Impact** as a community tool under `tools/community/ml-deploy-impact/`.

- **Proposal Issue**: Closes #<PROPOSAL_ISSUE_NUMBER>
- **Target Path**: `tools/community/ml-deploy-impact/`
- **Live Demo**: https://dsachar.net/ml-deploy-impact

## What this tool does
**ML Deploy Impact** is an interactive, zero-build educational simulator designed to evaluate the multi-month lifecycle energy and carbon footprint of candidate machine learning models under continuous distribution drift and retraining.

It demonstrates why traditional AutoML heuristics (selecting models based solely on static offline benchmark accuracy) can lead to deploying architectures that degrade rapidly and trigger frequent, energy-heavy retraining cycles. It incorporates:
- **ISO/IEC 21031:2024 principles**: Strict zero-offsets rule excluding market-based offsets/RECs.
- **GSF SCI for AI framing**: Modeling operational electricity ($O$, including PUE and location-based grid intensity) and embodied hardware carbon ($M$).
- **Consumer SCI (QA)**: Functional units adapted for operational prediction quality ($R = \text{correct predictions} / 1{,}000$), penalizing models for inaccurate predictions under drift.

## Submission Checklist
Per [CONTRIBUTING.md](https://github.com/Green-Software-Foundation/reference-implementations/blob/main/CONTRIBUTING.md):

- [x] **Proposal issue opened and referenced**: References #<PROPOSAL_ISSUE_NUMBER>
- [x] **Lives in its own subdirectory**: Placed in `tools/community/ml-deploy-impact/`
- [x] **Project-local README included**: Explains scope, methodology choices, exclusions, calibration guidance, and how to run.
- [x] **LICENSE file present**: MIT License included.
- [x] **Fully runnable locally**: Zero-build static web app running in any browser via `python3 -m http.server` or direct file open.
- [x] **Offline tests pass**: Standalone unit test suite verified via Node's built-in test runner (`npm test` / `node --test tests/simulation-core.test.js`).
- [x] **No sensitive credentials committed**: Zero API keys, tokens, or proprietary credentials.
- [x] **DCO Signed-off**: Commits signed with `git commit -s`.

## Maintainers
- Dimitris Sacharidis (@dsachar)
- Antonios Kontaxakis
```
