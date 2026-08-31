export type Category = {
  id: number;
  name: string;
  icon?: string;
};

export type Subject = {
  id: number;
  name: string;
  icon?: string;
};

export type Module = {
  id: number;
  title: string;
  desc: string;
  status: string; // 'locked' | 'unlocked' | 'completed'
  isDeleted?: boolean;
  category_id?: number;
  subject_id?: number;
  subject?: string;
  material: {
    objectives: string[];
    theory: string;
    keyTerms: { term: string; def: string }[];
  } | null;
  games: { id: number; title: string; desc: string; path?: string }[];
  duration: string;
  level: string;
  gameCount: number;
  banner_url?: string;
  questionCount?: number;
  is_restricted?: boolean;
};

export type User = { 
  id?: number | string; 
  name: string; 
  username?: string; 
  email: string; 
  role: string; 
  category_ids?: number[]; 
  subject_ids?: number[];
  avatar?: string;
  isGuest?: boolean;
};

export type Toast = {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
};
