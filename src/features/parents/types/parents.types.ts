export interface ParentWithChildren {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  phone: string | null;
  students: Array<{
    id: string;
    profiles: { full_name: string } | null;
    is_active: boolean;
  }>;
}

export interface ParentFilters {
  searchQuery?: string;
}
