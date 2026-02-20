export const colors = {
  primary: '#4A90D9',
  primaryLight: '#7BB3E8',
  primaryDark: '#2E6CB5',

  secondary: '#FF8C42',
  secondaryLight: '#FFB07A',
  secondaryDark: '#E06E1F',

  success: '#4CAF50',
  successLight: '#81C784',
  error: '#EF5350',
  warning: '#FFC107',

  background: '#F0F4FF',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textOnPrimary: '#FFFFFF',

  gradientStart: '#A8D8EA',
  gradientEnd: '#D4B5E6',

  pastel: {
    pink: '#FFD1DC',
    blue: '#B5E7F5',
    green: '#C8F7C5',
    yellow: '#FFF3B0',
    purple: '#E8D5F5',
    orange: '#FFE0C2',
  },
} as const;

export const ageGroupColors: Record<string, { primary: string; background: string; gradient: [string, string] }> = {
  '4-6': {
    primary: '#FF6B9D',
    background: '#FFF0F5',
    gradient: ['#FF6B9D', '#FF8E72'],
  },
  '7-9': {
    primary: '#4A90D9',
    background: '#F0F4FF',
    gradient: ['#4A90D9', '#7C4DFF'],
  },
  '10-12': {
    primary: '#26A69A',
    background: '#F0FFF4',
    gradient: ['#26A69A', '#2196F3'],
  },
};

export const difficultyColors: Record<string, string> = {
  kolay: '#4CAF50',
  orta: '#FF9800',
  zor: '#F44336',
};
