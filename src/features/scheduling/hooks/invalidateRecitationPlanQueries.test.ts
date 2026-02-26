import { invalidateRecitationPlanQueries } from './invalidateRecitationPlanQueries';

describe('invalidateRecitationPlanQueries', () => {
  it('invalidates all three recitation plan query keys', () => {
    const mockQueryClient = {
      invalidateQueries: jest.fn(),
    };

    invalidateRecitationPlanQueries(mockQueryClient as never);

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(3);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['recitation-plans'],
    });
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['recitation-plan'],
    });
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['recitation-plan-default'],
    });
  });
});
