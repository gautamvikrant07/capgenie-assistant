
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: UserRole[];
};

export type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRole, 'id' | 'user_id'>>;
      };
    };
  };
};
