import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'

type FormInputProps = {
  name: string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'url' | 'number'
  helperText?: string
  disabled?: boolean
  required?: boolean
  pattern?: {
    value: RegExp
    message: string
  }
  maxLength?: {
    value: number
    message: string
  }
  minLength?: {
    value: number
    message: string
  }
}

const FormInput = ({ 
  name, 
  label, 
  placeholder = '', 
  type = 'text',
  helperText,
  disabled = false,
  required = false,
}: FormInputProps) => {
  const { control, formState: { errors } } = useFormContext()
  const [showPassword, setShowPassword] = useState(false)
  
  // Determine the actual input type (for password toggling)
  const inputType = type === 'password' && showPassword ? 'text' : type
  
  // Format error message
  const errorMessage = errors[name]?.message as string
  const hasError = !!errors[name]
  
  // Update the application_info handling to match backend expectations

  const formatApplicationInfoValue = (value: string, fieldName: string) => {
    // Only process application_info field
    if (fieldName !== 'application_info' || !value) return value;
    
    // If it looks like an email, just return the email without mailto:
    if (value.includes('@') && !value.includes(' ')) {
      // Remove mailto: if it was added
      return value.replace('mailto:', '');
    }
    
    // For URLs, ensure they have the http/https prefix
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return `https://${value}`;
    }
    
    return value;
  };
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            // Ensure field value is never undefined
            const safeValue = field.value ?? '';
            
            // Create a custom onChange handler for application_info field
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (name === 'application_info') {
                field.onChange(e.target.value); // Store raw value when typing
              } else {
                field.onChange(e); // Default behavior for other fields
              }
            };
            
            // Create a custom onBlur handler to format application_info when focus leaves
            const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
              if (name === 'application_info') {
                const formattedValue = formatApplicationInfoValue(e.target.value, name);
                field.onChange(formattedValue); // Update with formatted value
              }
              field.onBlur(); // Call the default onBlur handler
            };
            
            // Render different inputs based on error state
            return hasError ? (
              <input
                {...field}
                value={safeValue}
                onChange={handleChange} 
                onBlur={handleBlur}
                id={name}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-destructive rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30
                  ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                aria-invalid="true"
                aria-describedby={`${name}-error`}
              />
            ) : (
              <input
                {...field}
                value={safeValue}
                onChange={handleChange}
                onBlur={handleBlur}
                id={name}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring
                  ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                aria-invalid="false"
              />
            );
          }}
        />
        
        {/* Password visibility toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      
      {/* If it's the application_info field, add special helper text */}
      {name === 'application_info' && !errorMessage && (
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a website URL (e.g., example.com/jobs) or email address (e.g., jobs@example.com)
        </p>
      )}
      
      {/* Original helper text for other fields */}
      {helperText && !errorMessage && name !== 'application_info' && (
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <p id={`${name}-error`} className="mt-1 text-sm text-destructive flex items-center gap-1">
          <FiAlertCircle size={14} />
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default FormInput