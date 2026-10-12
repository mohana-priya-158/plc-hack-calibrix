import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getChallenges } from '../services/challengeService';
import { runPublicTests } from '../services/evaluationService';
import { scanSync } from '../services/plcService';
import { emptyProgram } from '../features/ladder-editor/ladderModel';
import { INPUTS, initialInputs, initialMemory } from '../features/simulator/mockPlc';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const readStore = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
export const writeStore = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
const progKey = (id) => `plc.program.${id}`;
const DEFAULT_SETTINGS = { speed: 500, autosave: true, defaultChallenge: 'c1' };
const ago = (days) => new Date(Date.now() - days * 864e5).toISOString();
const seedHistory = () => [
  { at: ago(6), challenge: 'Emergency Stop Simulation', score: 100, passed: 5, failed: 0, demo: true },
  { at: ago(5), challenge: 'Motor Interlocking System', score: 80, passed: 4, failed: 1, demo: true },
  { at: ago(3), challenge: 'Water Tank Level Control', score: 60, passed: 3, failed: 2, demo: true },
  { at: ago(2), challenge: 'Object Counting Using a Sensor', score: 100, passed: 5, failed: 0, demo: true },
  { at: ago(1), challenge: 'Timer-Based Motor Control', score: 40, passed: 2, failed: 3, demo: true },
];

const stamp = () => new Date().toLocaleTimeString();
const initSim = () => ({ inputs: initialInputs(), outputs: {}, memory: initialMemory(), scan: 0, status: 'stopped', log: [{ t: stamp(), msg: 'Simulator ready (mock PLC).' }], changes: [] });
function scanOnce(s) {
  const r = scanSync(s.inputs, s.memory);
  const diff = Object.keys(r.outputs).filter((k) => !!r.outputs[k] !== !!s.outputs[k]);
  const log = diff.length ? [...s.log, ...diff.map((k) => ({ t: stamp(), msg: `Scan ${s.scan + 1}: ${k} → ${r.outputs[k] ? 'ON' : 'OFF'}` }))].slice(-60) : s.log;
  return { ...s, scan: s.scan + 1, outputs: r.outputs, memory: r.memory, log };
}

export function AppProvider({ children }) {
  const [init] = useState(() => {
    const settings = { ...DEFAULT_SETTINGS, ...readStore('plc.settings', {}) };
    return { settings, id: readStore('plc.challengeId', settings.defaultChallenge) };
  });
  const [settings, setSettingsState] = useState(init.settings);
  const [challenges, setChallenges] = useState([]);
  const [challengeId, setCid] = useState(init.id);
  const [hist, setHist] = useState(() => ({ present: readStore(progKey(init.id), emptyProgram()), past: [], future: [] }));
  const [lastSaved, setLastSaved] = useState(null);
  const [results, setResults] = useState(() => readStore(`plc.results.${init.id}`, {}));
  const [history, setHistory] = useState(() => readStore('plc.history', null) || seedHistory());
  const [sim, setSim] = useState(initSim);
  const [running, setRunning] = useState(false);

  const settingsRef = useRef(settings); settingsRef.current = settings;
  const idRef = useRef(challengeId); idRef.current = challengeId;

  useEffect(() => { getChallenges().then(setChallenges); }, []);
  useEffect(() => { writeStore('plc.history', history); }, [history]);
  useEffect(() => {
    if (sim.status !== 'running') return undefined;
    const t = setInterval(() => setSim(scanOnce), settings.speed);
    return () => clearInterval(t);
  }, [sim.status, settings.speed]);

  const persist = (p) => { if (settingsRef.current.autosave) writeStore(progKey(idRef.current), p); };
  const setProgram = useCallback((updater) => setHist((h) => {
    const next = typeof updater === 'function' ? updater(h.present) : updater;
    persist(next);
    return { present: next, past: [...h.past.slice(-49), h.present], future: [] };
  }), []);
  const undo = () => setHist((h) => { if (!h.past.length) return h; const p = h.past[h.past.length - 1]; persist(p); return { present: p, past: h.past.slice(0, -1), future: [h.present, ...h.future] }; });
  const redo = () => setHist((h) => { if (!h.future.length) return h; const p = h.future[0]; persist(p); return { present: p, past: [...h.past, h.present], future: h.future.slice(1) }; });
  const save = () => { writeStore(progKey(challengeId), hist.present); setLastSaved(new Date().toLocaleTimeString()); };

  const setChallenge = (id) => {
    setCid(id); writeStore('plc.challengeId', id);
    setHist({ present: readStore(progKey(id), emptyProgram()), past: [], future: [] });
    setResults(readStore(`plc.results.${id}`, {}));
  };
  const setSettings = (patch) => setSettingsState((s) => { const n = { ...s, ...patch }; writeStore('plc.settings', n); return n; });

  const challenge = challenges.find((c) => c.id === challengeId) || null;

  const runTests = async (ids) => {
    setRunning(true);
    try {
      const res = await runPublicTests(challengeId, hist.present, ids);
      const merged = { ...(ids ? results : {}), ...Object.fromEntries(res.map((r) => [r.id, { ...r, at: new Date().toISOString() }])) };
      setResults(merged); writeStore(`plc.results.${challengeId}`, merged);
      if (!ids) {
        const passed = res.filter((r) => r.status === 'PASS').length;
        setHistory((h) => [...h, { at: new Date().toISOString(), challenge: challenge?.title || challengeId, score: res.length ? Math.round((passed / res.length) * 100) : 0, passed, failed: res.length - passed }].slice(-30));
      }
      return res;
    } finally { setRunning(false); }
  };
  const resetResults = () => { setResults({}); writeStore(`plc.results.${challengeId}`, {}); };

  const simApi = {
    run: () => setSim((s) => ({ ...s, status: 'running', log: [...s.log, { t: stamp(), msg: 'RUN' }].slice(-60) })),
    pause: () => setSim((s) => ({ ...s, status: 'paused', log: [...s.log, { t: stamp(), msg: 'PAUSE' }].slice(-60) })),
    step: () => setSim((s) => scanOnce({ ...s, status: 'paused' })),
    reset: () => setSim(initSim()),
    setInput: (key, val) => setSim((s) => {
      if (s.inputs[key] === val) return s;
      let n = { ...s, inputs: { ...s.inputs, [key]: val }, changes: [{ t: stamp(), key, val }, ...s.changes].slice(0, 10) };
      const meta = INPUTS.find((i) => i.key === key);
      if (val && meta.type === 'push' && s.status !== 'stopped') n = scanOnce(n); // catch short button presses
      return n;
    }),
  };

  const clearPrograms = () => {
    Object.keys(localStorage).filter((k) => k.startsWith('plc.program.')).forEach((k) => localStorage.removeItem(k));
    setHist({ present: emptyProgram(), past: [], future: [] });
  };
  const resetDemo = () => {
    Object.keys(localStorage).filter((k) => k.startsWith('plc.results.')).forEach((k) => localStorage.removeItem(k));
    setResults({}); setHistory(seedHistory()); setSim(initSim());
  };
  const savedCount = () => Object.keys(localStorage).filter((k) => k.startsWith('plc.program.')).length;

  const value = {
    challenges, challenge, challengeId, setChallenge, settings, setSettings,
    program: hist.present, setProgram, undo, redo, canUndo: hist.past.length > 0, canRedo: hist.future.length > 0, save, lastSaved,
    results, runTests, resetResults, running, history, sim, simApi, clearPrograms, resetDemo, savedCount,
  };
  return <Ctx.Provider value={useMemo(() => value, [value])}>{children}</Ctx.Provider>;
}
