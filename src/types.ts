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
};

export type User = { id?: number; name: string; username?: string; email: string; role: string; category_ids?: number[]; subject_ids?: number[] };

export type Toast = {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
};
