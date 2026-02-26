import { getAttendanceBadge } from './attendance-badge';

const mockT = (key: string) => key;

describe('getAttendanceBadge', () => {
  it('returns success variant for "present"', () => {
    const result = getAttendanceBadge('present', mockT);
    expect(result.variant).toBe('success');
    expect(result.label).toBe('admin.attendance.status.present');
  });

  it('returns error variant for "absent"', () => {
    const result = getAttendanceBadge('absent', mockT);
    expect(result.variant).toBe('error');
    expect(result.label).toBe('admin.attendance.status.absent');
  });

  it('returns warning variant for "late"', () => {
    const result = getAttendanceBadge('late', mockT);
    expect(result.variant).toBe('warning');
    expect(result.label).toBe('admin.attendance.status.late');
  });

  it('returns info variant for "excused"', () => {
    const result = getAttendanceBadge('excused', mockT);
    expect(result.variant).toBe('info');
    expect(result.label).toBe('admin.attendance.status.excused');
  });

  it('returns default variant for null status', () => {
    const result = getAttendanceBadge(null, mockT);
    expect(result.variant).toBe('default');
    expect(result.label).toBe('parent.dashboard.notMarked');
  });

  it('returns default variant for undefined status', () => {
    const result = getAttendanceBadge(undefined, mockT);
    expect(result.variant).toBe('default');
  });

  it('returns default variant for unknown status string', () => {
    const result = getAttendanceBadge('unknown_status', mockT);
    expect(result.variant).toBe('default');
    expect(result.label).toBe('parent.dashboard.notMarked');
  });

  it('returns default variant for empty string', () => {
    const result = getAttendanceBadge('', mockT);
    expect(result.variant).toBe('default');
  });
});
