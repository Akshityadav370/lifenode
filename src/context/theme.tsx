const ThemeContext = ({ children, theme }) => {
  const colors = theme;

  const style = {
    '--primary': colors.primary,
    '--secondary': colors.secondary,
    '--accent': colors.accent,
    '--background': colors.background,
    '--surface': colors.surface,
    '--text': colors.text,
    '--text-muted': colors.textMuted,
    '--border': colors.border,
    '--success': colors.success,
    '--warning': colors.warning,
    '--error': colors.error,
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: '100vh',
    fontFamily: "'Livvic', sans-serif",
  };

  return (
    <div style={style} className="transition-all duration-300">
      {children}
    </div>
  );
};

export default ThemeContext;
