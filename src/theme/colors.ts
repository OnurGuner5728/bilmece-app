export const colors = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',

  secondary: '#F59E0B',
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',

  success: '#10B981',
  successLight: '#6EE7B7',
  error: '#EF4444',
  warning: '#F59E0B',

  background: '#F8FAFF',
  surface: '#FFFFFF',

  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#CBD5E1',
  textOnPrimary: '#FFFFFF',

  gradientStart: '#93C5FD',
  gradientEnd: '#C4B5FD',

  pastel: {
    pink: '#FECDD3',
    blue: '#BFDBFE',
    green: '#BBF7D0',
    yellow: '#FEF08A',
    purple: '#DDD6FE',
    orange: '#FED7AA',
  },
} as const;

export const ageGroupColors: Record<string, { primary: string; background: string; gradient: [string, string] }> = {
  '4-6': {
    primary: '#F472B6',
    background: '#FFF1F2',
    gradient: ['#F472B6', '#FB923C'],
  },
  '7-9': {
    primary: '#2563EB',
    background: '#EFF6FF',
    gradient: ['#3B82F6', '#8B5CF6'],
  },
  '10-12': {
    primary: '#10B981',
    background: '#ECFDF5',
    gradient: ['#10B981', '#3B82F6'],
  },
};

export const difficultyColors: Record<string, string> = {
  kolay: '#10B981',
  orta: '#F59E0B',
  zor: '#EF4444',
};

export const categoryColors: Record<string, string> = {
  hayvanlar: '#F472B6',
  yiyecek: '#FB923C',
  'do\u011Fa': '#10B981',
  'e\u015Fyalar': '#3B82F6',
  'v\u00FCcut': '#8B5CF6',
  'ara\u00E7lar': '#EF4444',
};
