# Ascend — VALORANT performance analysis demo

## Map-based agent recommendations

The primary Agent picks view uses a trained logistic regression classifier to rank eight supported agents across six maps. `node scripts/train-recommender.mjs` reproduces training; `node scripts/verify-recommender.mjs` checks inference and filtering. `dist/recommender.js` shares feature extraction between training and browser inference.

Training uses 10,450 simulated matches from 190 players; evaluation uses 2,750 matches from 50 separate players. Each feature vector uses only earlier matches: map/agent pair, agent experience, smoothed prior win rate, prior ADR and preferred-role match. Generated outcomes deliberately include fictional map preferences. The model is not evidence of the real meta. The UI reports test log loss and Brier score against a constant training-win-rate baseline, along with exact learned log-odds contributions and low-history notices. Real probability calibration and causal agent-selection benefits remain unvalidated. Maps and agents are an illustrative subset, not the live ranked rotation.

Enter **NOX01**, **SAGE02** or **ROOKIE03** to load distinct fictional player histories. No Riot account, API key or external login is required for the app's demo profiles.

## Run

With Node.js installed: `node scripts/serve.mjs`, then open http://127.0.0.1:4173. Reproduce training with `node scripts/train.mjs`; verify with `node scripts/verify.mjs`. No dependencies are needed.

## What ML does

K-means clustering standardises four features (ADR, K/D, opening-death rate and ADR standard deviation), then learns three centres from 600 generated player histories. At runtime, the selected profile's match window is assigned to the nearest learned centre. Descriptive labels are attached after inspecting cluster characteristics: high-impact/high-variance, consistent contributor, and developing fundamentals. They describe simulated patterns, not rank or esports readiness. No future-match prediction remains.

The cohort is fictional Diamond 2 duelists. Training uses 20-match windows; 10- and 40-match windows are also supported for exploratory inference and may change assignments. Percentiles use reference windows of the same length. Higher percentiles favour more damage and K/D, fewer opening deaths and less variability. These are descriptive statistics, not ML outputs. Lower variability is not necessarily better without considering impact.

Advice uses explicit rules: pick the two lowest comparative percentiles and map them to practice exercises. It is not a causal explanation. Checklist state is stored on this device separately by ID, match window and selected plan.

## Limitations and evaluation

All player data is synthetic; generation intentionally includes three styles. This validates software behaviour rather than discovering real-world archetypes. Clustering has no supervised accuracy score. Automated checks verify distinct sample assignments, valid percentiles, metric formulas, and reduced within-cluster dispersion versus a single-centre baseline. Real use requires permitted real data, stability checks across seeds/windows, external validation and expert interpretation. No professional-readiness score, global rank or hidden MMR estimate is claimed.

The website includes optional WebMCP tools for reading the visible analysis, navigating views and loading demo IDs. This is an independent fan project, not affiliated with Riot Games.
