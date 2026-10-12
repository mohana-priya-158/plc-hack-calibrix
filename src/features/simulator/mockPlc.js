// MOCK PLC — fixed demonstration logic (conveyor latch, tank pump, alarm, object counter).
// It does NOT interpret the user's ladder program. Replace via services/plcService.js.
export const INPUTS = [
  { key: 'START', addr: 'I0.0', label: 'START push button', type: 'push' },
  { key: 'STOP', addr: 'I0.1', label: 'STOP push button', type: 'push' },
  { key: 'ESTOP', addr: 'I0.2', label: 'Emergency stop', type: 'toggle', danger: true },
  { key: 'PROX', addr: 'I0.3', label: 'Proximity sensor', type: 'toggle' },
  { key: 'OBJ', addr: 'I0.4', label: 'Object detection sensor', type: 'toggle' },
  { key: 'LOW', addr: 'I0.5', label: 'Tank low-level sensor', type: 'toggle' },
  { key: 'HIGH', addr: 'I0.6', label: 'Tank high-level sensor', type: 'toggle' },
  { key: 'FAULT', addr: 'I0.7', label: 'Fault signal', type: 'toggle', danger: true },
];
export const OUTPUTS = [
  { key: 'motor', addr: 'Q0.0', label: 'Conveyor motor' },
  { key: 'pump', addr: 'Q0.1', label: 'Pump motor' },
  { key: 'green', addr: 'Q0.2', label: 'Green indicator lamp' },
  { key: 'red', addr: 'Q0.3', label: 'Red alarm lamp', danger: true },
  { key: 'buzzer', addr: 'Q0.4', label: 'Buzzer', danger: true },
  { key: 'running', addr: 'M0.0', label: 'Conveyor running status' },
];
export const initialInputs = () => Object.fromEntries(INPUTS.map((i) => [i.key, false]));
export const initialMemory = () => ({ motor: false, pump: false, prevObj: false, count: 0 });

export function mockScan(inputs, memory) {
  const i = inputs;
  const motor = (i.START || memory.motor) && !i.STOP && !i.ESTOP && !i.FAULT;
  let pump = memory.pump;
  if (i.LOW) pump = true;
  if (i.HIGH || i.ESTOP) pump = false;
  const count = memory.count + (i.OBJ && !memory.prevObj ? 1 : 0);
  return {
    outputs: { motor, pump, green: motor, red: i.FAULT || i.ESTOP, buzzer: i.FAULT, running: motor },
    memory: { motor, pump, prevObj: i.OBJ, count },
  };
}
