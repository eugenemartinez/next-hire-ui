import { type ButtonHTMLAttributes, forwardRef } from 'react'
import type { ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  iconOnly?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  ...props
}, ref) => {
  // Base classes - Added transition-all for broader hover effects
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  // Size classes - adjusted for icon-only buttons
  const sizeClasses = {
    sm: iconOnly ? 'h-8 w-8 p-0' : 'h-8 px-3 text-xs',
    md: iconOnly ? 'h-10 w-10 p-0' : 'h-10 px-4 text-sm',
    lg: iconOnly ? 'h-12 w-12 p-0' : 'h-12 px-6 text-base'
  }
  
  // Variant classes using our theme variables - Enhanced hover states
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-md',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105 hover:shadow-md',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:border-primary/70 hover:shadow-sm',
    ghost: 'hover:bg-accent hover:text-accent-foreground hover:scale-105',
    destructive: 'bg-destructive text-white hover:bg-destructive/90 hover:scale-105 hover:shadow-md'
  }
  
  // Disabled and loading state
  const stateClasses = (disabled || isLoading)
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer' // Hover effects will apply if not disabled/loading
  
  // Helper to render icon + loading spinner with proper spacing
  const renderIconWithSpacing = () => {
    if (isLoading) {
      return (
        <svg 
          className="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" cy="12" r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }
    
    return icon;
  }
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses} ${className}`}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    >
      {/* Icon-only button */}
      {iconOnly && renderIconWithSpacing()}
      
      {/* Button with icon and text */}
      {!iconOnly && (
        <>
          {/* Left-positioned icon */}
          {icon && iconPosition === 'left' && (
            <span className="mr-2 flex items-center">
              {renderIconWithSpacing()}
            </span>
          )}
          
          {/* Text content */}
          {children}
          
          {/* Right-positioned icon */}
          {icon && iconPosition === 'right' && (
            <span className="ml-2 flex items-center">
              {renderIconWithSpacing()}
            </span>
          )}
          
          {/* Loading spinner without icon */}
          {isLoading && !icon && (
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button