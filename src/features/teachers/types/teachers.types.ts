import type { Tables } from '@/types/database.types';

export interface TeacherWithClasses {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  classes: Array<{ id: string; name: string }>;
}

export interface TeacherFilters {
  searchQuery?: string;
}
