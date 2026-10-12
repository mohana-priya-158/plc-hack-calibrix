# PLC Logic Arena – Industrial Automation Test Bench (Frontend)

React + Vite + Tailwind CSS + React Router + Lucide. Frontend only: all simulation, testing and scoring use **mock logic** and local data.

## Run
```bash
npm install
cp .env.example .env     # optional
npm run dev              # http://localhost:5173
npm run build            # production build
```

## Demo flow
Dashboard → Challenges → Start "Conveyor Belt Start/Stop Control" → Editor → **Load Example** → Validate → Run Simulation → toggle inputs → Test Results → Run All Tests → Evaluation Report → Export CSV.
(Run the tests with an empty program to see FAIL states.)

## Structure
```
src/
  components/ui.jsx            shared UI (Card, Button, Modal, Badge…)
  layouts/AppLayout.jsx        sidebar + top bar
  pages/                       Dashboard, Challenges, EditorPage, SimulatorPage, TestsPage, ReportPage, HelpPage, SettingsPage
  context/AppContext.jsx       app state: program + undo/redo, simulator, results, localStorage
  features/ladder-editor/      ladderModel.js (data model, validation, sample), LadderCanvas.jsx (SVG symbols)
  features/simulator/mockPlc.js        MOCK PLC scan (replace with backend)
  features/evaluation/mockEvaluator.js MOCK evaluator (structural heuristic)
  services/                    api.js, plcService.js, challengeService.js, evaluationService.js
  data/                        challenges.js, publicTestCases.js (public tests only)
  utils/csv.js                 CSV export
```

## Backend integration
Set `VITE_API_BASE_URL` (default `http://localhost:5000/api`) and `VITE_USE_MOCK=false`. Services then call:
`GET /challenges`, `GET /challenges/:id`, `GET /challenges/:id/public-tests`, `POST /plc/validate`, `POST /plc/simulate`, `POST /tests/run`, `POST /evaluation/submit`.
Programs are plain JSON: `{ rungs: [{ id, elements: [{ id, type, address, name, preset?, parallel: [...] }] }] }`.
Hidden test cases must live on the server only.

## Known limits
Mock engines do not execute the user's ladder program; no theme switcher; only the conveyor challenge has public tests.
