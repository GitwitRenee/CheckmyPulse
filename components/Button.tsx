import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all duration-300 rounded-xl group focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-ember text-white hover:bg-opacity-90 shadow-lg shadow-ember/30 focus:ring-ember",
    secondary: "bg-white text-mahogany hover:bg-stone-50 border border-stone-200 shadow-sm focus:ring-stone-200 dark:bg-mahogany dark:text-white dark:border-mahogany/50 dark:hover:bg-mahogany/80",
    ghost: "bg-transparent text-stone-600 hover:text-ember hover:bg-ember/5 dark:text-stone-400 dark:hover:text-gold dark:hover:bg-gold/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {children}
          {icon && <span className="transition-transform group-hover:translate-x-1">{icon}</span>}
        </span>
      )}
    </button>
  );
};