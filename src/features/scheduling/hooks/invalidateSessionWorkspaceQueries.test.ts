import { invalidateSessionWorkspaceQueries } from './invalidateSessionWorkspaceQueries';

const EXPECTED_KEYS = [
  'scheduled-sessions',
  'teacher-upcoming-sessions',
  'teacher-session-history',
  'sessions',
  'attendance',
  'class-attendance',
  'teacher-dashboard',
  'student-dashboard',
  'scheduled-session',
  'recitations',
  'memorization-progress',
  'memorization-stats',
  'revision-schedule',
  'recitation-plans',
  'assignments',
];

describe('invalidateSessionWorkspaceQueries', () => {
  it('invalidates all session workspace query keys', () => {
    const mockQueryClient = {
      invalidateQueries: jest.fn(),
    };

    invalidateSessionWorkspaceQueries(mockQueryClient as never);

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(EXPECTED_KEYS.length);

    for (const key of EXPECTED_KEYS) {
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: [key],
      });
    }
  });
});
