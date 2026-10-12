// Public test cases only. Hidden test cases must never live in the frontend.
// steps: ordered scans; "in" = inputs held during that scan; "check" = optional mid-sequence expectation.
export const publicTestCases = {
  c1: [
    { id: 'T1', name: 'Start Conveyor', condition: 'START active, STOP inactive, E-STOP inactive',
      expected: { motor: true }, steps: [{ in: { START: true } }] },
    { id: 'T2', name: 'Stop Conveyor', condition: 'Motor running, then STOP activated',
      expected: { motor: false }, steps: [{ in: { START: true } }, { in: {}, check: { motor: true } }, { in: { STOP: true } }] },
    { id: 'T3', name: 'Emergency Stop', condition: 'Motor running, then E-STOP activated',
      expected: { motor: false }, steps: [{ in: { START: true } }, { in: {}, check: { motor: true } }, { in: { ESTOP: true } }] },
    { id: 'T4', name: 'Unsafe Start', condition: 'E-STOP active and START activated',
      expected: { motor: false }, steps: [{ in: { ESTOP: true, START: true } }] },
    { id: 'T5', name: 'Restart', condition: 'E-STOP cleared, then a new START issued (no auto-restart)',
      expected: { motor: true }, steps: [{ in: { START: true } }, { in: { ESTOP: true } }, { in: {}, check: { motor: false } }, { in: { START: true } }] },
  ],
};
