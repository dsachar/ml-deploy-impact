# GSF Community Submission Guide

This guide describes the complete process for proposing and contributing **ML Deploy Impact** to the Green Software Foundation's [`reference-implementations`](https://github.com/Green-Software-Foundation/reference-implementations) repository under `tools/community/ml-deploy-impact/`.

---

## 🌿 Overview of Branch Organization

- **`main`**: The primary branch for the live web application and standalone repository. It remains completely clean of GSF proposal issue drafts and monorepo submission scripts.
- **`gsf-submission`**: This branch. Contains all submission-specific documentation, proposal templates, PR checklists, and packaging scripts.

---

## 📋 Step-by-Step Submission Process

### Phase 1: Open the Proposal Issue (Pre-requisite)
GSF requires opening a proposal issue first before submitting a PR to confirm fit and alignment.

1. Go to [Green-Software-Foundation/reference-implementations/issues/new](https://github.com/Green-Software-Foundation/reference-implementations/issues/new).
2. Title the issue:
   ```text
   [Tool Proposal]: ML Deploy Impact — Educational ML Lifecycle Assessment & Model Selection Simulator
   ```
3. Copy the markdown content from [`PROPOSAL_ISSUE.md`](PROPOSAL_ISSUE.md) into the issue description.
4. Submit the issue and note the issue number (e.g., `#42`).

---

### Phase 2: Wait for Community / Maintainer Acknowledgment
GSF maintainers will review the proposal. Since this is a tool (not a normative specification measurement), it does not require formal working-group ratification, but maintainers may ask brief questions regarding scope or framing.

---

### Phase 3: Prepare the Pull Request

Once maintainers indicate you may proceed:

1. **Fork** [`Green-Software-Foundation/reference-implementations`](https://github.com/Green-Software-Foundation/reference-implementations) on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/reference-implementations.git
   cd reference-implementations
   git checkout -b add-ml-deploy-impact
   ```
3. **Export the files** from this repo into the fork:
   From within this repository (`ml-deploy-impact` on branch `gsf-submission`), run:
   ```bash
   ./gsf-submission/export-to-gsf.sh /path/to/reference-implementations
   ```
   This will verify that tests pass and copy the relevant files directly into `tools/community/ml-deploy-impact/`.
4. **Verify tests pass** in the fork:
   ```bash
   cd /path/to/reference-implementations/tools/community/ml-deploy-impact
   npm test
   ```
5. **Commit with DCO sign-off (`-s`)**:
   GSF requires sign-off (`Signed-off-by: Your Name <your.email@example.com>`):
   ```bash
   cd /path/to/reference-implementations
   git add tools/community/ml-deploy-impact
   git commit -s -m "feat(tools/community): add ml-deploy-impact simulator"
   git push origin add-ml-deploy-impact
   ```

---

### Phase 4: Submit the Pull Request
1. Open a pull request against `Green-Software-Foundation/reference-implementations` (`main` branch).
2. Copy the template from [`PULL_REQUEST.md`](PULL_REQUEST.md), filling in your proposal issue number.
3. Submit the PR!
