import { USE_MOCK, delay, request } from './api';
import { challenges } from '../data/challenges';

export async function getChallenges() {
  if (!USE_MOCK) return request('/challenges');
  await delay(100);
  return challenges;
}
export async function getChallengeById(id) {
  if (!USE_MOCK) return request(`/challenges/${id}`);
  await delay(100);
  return challenges.find((c) => c.id === id) || null;
}
