import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered'
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  className = '',
  variant = 'default',
  children,
  ...props
}, ref) => {
  const baseClasses = 'bg-card text-card-foreground rounded-lg shadow-sm'
  
  const variantClasses = {
    default: '',
    bordered: 'border border-border'
  }
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card