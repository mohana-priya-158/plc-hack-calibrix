import { USE_MOCK, delay, request } from './api';
import { publicTestCases } from '../data/publicTestCases';
import { evaluateMock } from '../features/evaluation/mockEvaluator';

export async function getPublicTests(challengeId) {
  if (!USE_MOCK) return request(`/challenges/${challengeId}/public-tests`);
  return (publicTestCases[challengeId] || []).map(({ id, name, condition, expected }) => ({ id, name, condition, expected }));
}

export async function runPublicTests(challengeId, program, ids) {
  if (!USE_MOCK) return request('/tests/run', { method: 'POST', body: { challengeId, program, ids } });
  await delay(350);
  const cases = (publicTestCases[challengeId] || []).filter((c) => !ids || ids.includes(c.id));
  return evaluateMock(cases, program);
}

export async function submitForEvaluation(challengeId, program) {
  if (!USE_MOCK) return request('/evaluation/submit', { method: 'POST', body: { challengeId, program } });
  const results = await runPublicTests(challengeId, program);
  const passed = results.filter((r) => r.status === 'PASS').length;
  return { simulated: true, results, total: results.length, passed, failed: results.length - passed,
    score: results.length ? Math.round((passed / results.length) * 100) : 0 };
}
