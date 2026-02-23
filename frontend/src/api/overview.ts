import { api } from './client';
import type { Overview } from '../types';

export const overviewApi = {
  get: () =>
    api.get<Overview>('/api/overview'),
};
