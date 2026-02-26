import type { QueryClient } from '@tanstack/react-query';

/** Invalidates all recitation plan-related query keys. */
export function invalidateRecitationPlanQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['recitation-plans'] });
  queryClient.invalidateQueries({ queryKey: ['recitation-plan'] });
  queryClient.invalidateQueries({ queryKey: ['recitation-plan-default'] });
}
