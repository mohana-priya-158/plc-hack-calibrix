// MOCK evaluator for the conveyor challenge. It runs a fixed motor model gated by simple
// structural checks of the user's program (a heuristic, NOT real ladder execution).
const all = (p) => p.rungs.flatMap((r) => r.elements.flatMap((e) => [e, ...(e.parallel || [])]));

export function inspectProgram(program) {
  const els = all(program || { rungs: [] });
  const has = (type, address) => els.some((e) => e.type === type && e.address === address);
  const latch = (program?.rungs || []).some((r) => r.elements.some((e) => (e.parallel || []).some((b) => b.type === 'NO' && b.address === 'Q0.0')));
  return { coil: has('COIL', 'Q0.0'), start: has('NO', 'I0.0'), stop: has('NC', 'I0.1'), estop: has('NC', 'I0.2'), latch };
}

const scan = (f, i, prev) =>
  f.coil && ((i.START && f.start) || (f.latch && prev)) && !(f.stop && i.STOP) && !(f.estop && i.ESTOP);

const label = (m) => (m ? 'Motor ON' : 'Motor OFF');

export function evaluateMock(cases, program) {
  const flags = inspectProgram(program);
  return cases.map((tc) => {
    let prev = false; let motor = false; let note = '';
    for (const step of tc.steps) {
      motor = scan(flags, step.in, prev); prev = motor;
      if (step.check && step.check.motor !== motor) { note = `Checkpoint failed: expected ${label(step.check.motor)} mid-sequence.`; break; }
    }
    const pass = !note && motor === tc.expected.motor;
    return {
      id: tc.id, name: tc.name, condition: tc.condition, expected: label(tc.expected.motor), actual: label(motor),
      status: pass ? 'PASS' : 'FAIL', timeMs: tc.steps.length * 10, note, simulated: true,
    };
  });
}
