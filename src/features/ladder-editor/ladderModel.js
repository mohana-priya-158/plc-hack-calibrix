let counter = 0;
export const uid = () => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

export const ELEMENT_TYPES = {
  NO:   { label: 'Normally Open Contact',   short: 'NO',  side: 'input',  address: 'I0.0' },
  NC:   { label: 'Normally Closed Contact', short: 'NC',  side: 'input',  address: 'I0.1' },
  COIL: { label: 'Output Coil',             short: 'OUT', side: 'output', address: 'Q0.0' },
  SET:  { label: 'Set Coil (Latch)',        short: 'SET', side: 'output', address: 'Q0.0' },
  RST:  { label: 'Reset Coil (Unlatch)',    short: 'RST', side: 'output', address: 'Q0.0' },
  TON:  { label: 'Timer TON (on-delay)',    short: 'TON', side: 'output', address: 'T0', preset: 5, unit: 's' },
  TOF:  { label: 'Timer TOF (off-delay)',   short: 'TOF', side: 'output', address: 'T1', preset: 5, unit: 's' },
  CTU:  { label: 'Counter CTU (count up)',  short: 'CTU', side: 'output', address: 'C0', preset: 10, unit: 'cnt' },
};
export const isOutput = (el) => ELEMENT_TYPES[el.type].side === 'output';

export const makeElement = (type, patch = {}) => ({
  id: uid(), type, address: ELEMENT_TYPES[type].address, name: '', parallel: [],
  ...(ELEMENT_TYPES[type].preset !== undefined ? { preset: ELEMENT_TYPES[type].preset } : {}), ...patch,
});
export const makeRung = (elements = []) => ({ id: uid(), elements });
export const emptyProgram = () => ({ rungs: [makeRung()] });

// ---- immutable tree helpers ------------------------------------------------
const mapElements = (els, fn) => els.flatMap((el) => {
  const out = fn(el);
  return out === null ? [] : [{ ...out, parallel: mapElements(out.parallel || [], fn) }];
});
export const mapProgram = (p, fn) => ({ ...p, rungs: p.rungs.map((r) => ({ ...r, elements: mapElements(r.elements, fn) })) });

export const updateElement = (p, id, patch) => mapProgram(p, (e) => (e.id === id ? { ...e, ...patch } : e));
export const removeElement = (p, id) => mapProgram(p, (e) => (e.id === id ? null : e));
export const addParallel = (p, id, el) => mapProgram(p, (e) => (e.id === id ? { ...e, parallel: [...e.parallel, el] } : e));
export const removeRung = (p, rungId) => ({ ...p, rungs: p.rungs.filter((r) => r.id !== rungId) });

/** Outputs go at the end of the rung; inputs go before the first output instruction. */
export function addElement(p, rungId, el) {
  return {
    ...p,
    rungs: p.rungs.map((r) => {
      if (r.id !== rungId) return r;
      if (isOutput(el)) return { ...r, elements: [...r.elements, el] };
      const firstOut = r.elements.findIndex(isOutput);
      const at = firstOut === -1 ? r.elements.length : firstOut;
      return { ...r, elements: [...r.elements.slice(0, at), el, ...r.elements.slice(at)] };
    }),
  };
}

export function findInfo(p, id) {
  for (const rung of p.rungs) {
    for (const el of rung.elements) {
      if (el.id === id) return { rung, el, isBranch: false };
      const b = el.parallel.find((x) => x.id === id);
      if (b) return { rung, el: b, isBranch: true, parent: el };
    }
  }
  return null;
}

// ---- validation --------------------------------------------------------------
const ADDRESS_RULES = {
  NO: /^([IQM]\d+\.\d+|[TC]\d+)$/, NC: /^([IQM]\d+\.\d+|[TC]\d+)$/,
  COIL: /^[QM]\d+\.\d+$/, SET: /^[QM]\d+\.\d+$/, RST: /^[QM]\d+\.\d+$/, TON: /^T\d+$/, TOF: /^T\d+$/, CTU: /^C\d+$/,
};
export const isValidAddress = (type, address) => ADDRESS_RULES[type].test(address || '');
export const addressHint = (type) => (type === 'TON' || type === 'TOF' ? 'T0, T1…' : type === 'CTU' ? 'C0, C1…' : ['COIL', 'SET', 'RST'].includes(type) ? 'Q0.0 or M0.0' : 'I0.0, Q0.0, M0.0…');

export function validateLadder(p) {
  const errors = []; const warnings = []; const coilUse = {};
  if (!p.rungs.length) errors.push('Program has no rungs.');
  p.rungs.forEach((rung, i) => {
    const n = i + 1;
    if (!rung.elements.length) { warnings.push(`Rung ${n} is empty.`); return; }
    if (!rung.elements.some(isOutput)) errors.push(`Rung ${n} has no output instruction.`);
    if (rung.elements.every(isOutput)) warnings.push(`Rung ${n} has no input condition (always energised).`);
    const firstOut = rung.elements.findIndex(isOutput);
    if (rung.elements.slice(firstOut).some((e) => !isOutput(e))) errors.push(`Rung ${n}: contacts must be placed before output instructions.`);
    rung.elements.forEach((el) => {
      [el, ...el.parallel].forEach((x) => {
        if (!isValidAddress(x.type, x.address)) errors.push(`Rung ${n}: "${x.address || '(empty)'}" is not a valid address for ${x.type} (use ${addressHint(x.type)}).`);
      });
      if (isOutput(el)) { (coilUse[el.address] ||= new Set()).add(n); }
    });
  });
  Object.entries(coilUse).forEach(([addr, rungs]) => {
    if (rungs.size > 1) warnings.push(`Output ${addr} is written in several rungs (${[...rungs].join(', ')}).`);
  });
  return { valid: errors.length === 0, errors, warnings };
}

// ---- sample program -----------------------------------------------------------
export function sampleConveyorProgram() {
  return {
    rungs: [
      makeRung([
        makeElement('NO', { address: 'I0.0', name: 'START', parallel: [makeElement('NO', { address: 'Q0.0', name: 'CONVEYOR_MOTOR' })] }),
        makeElement('NC', { address: 'I0.1', name: 'STOP' }),
        makeElement('NC', { address: 'I0.2', name: 'EMERGENCY_STOP' }),
        makeElement('COIL', { address: 'Q0.0', name: 'CONVEYOR_MOTOR' }),
      ]),
      makeRung([makeElement('NO', { address: 'Q0.0', name: 'CONVEYOR_MOTOR' }), makeElement('COIL', { address: 'Q0.2', name: 'GREEN_LAMP' })]),
    ],
  };
}
