import { USE_MOCK, delay, request } from './api';
import { validateLadder } from '../features/ladder-editor/ladderModel';
import { mockScan } from '../features/simulator/mockPlc';

export async function validateProgram(program) {
  if (!USE_MOCK) return request('/plc/validate', { method: 'POST', body: { program } });
  await delay(100);
  return validateLadder(program);
}

/** One PLC scan. MOCK: fixed demo behaviour, NOT an interpreter of the user's ladder program. */
export async function simulateProgram(program, inputs, memory) {
  if (!USE_MOCK) return request('/plc/simulate', { method: 'POST', body: { program, inputs, memory } });
  return mockScan(inputs, memory);
}

/** Synchronous scan used by the live simulator loop. Swap for a WebSocket/polling client later. */
export const scanSync = mockScan;
