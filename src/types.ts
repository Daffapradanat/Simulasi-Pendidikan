export type Module = {
  id: number;
  title: string;
  desc: string;
  status: string; // 'locked' | 'unlocked' | 'completed'
  isDeleted?: boolean;
  material: {
    objectives: string[];
    theory: string;
    keyTerms: { term: string; def: string }[];
  } | null;
  games: { id: number; title: string; desc: string; path?: string }[];
  duration: string;
  level: string;
  gameCount: number;
};

export type User = { name: string; email: string; role: string };

export type Toast = {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
};
