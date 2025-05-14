import { useFormContext, Controller } from 'react-hook-form'
import { FiAlertCircle } from 'react-icons/fi'

type Option = {
  value: string
  label: string
}

type FormSelectProps = {
  name: string
  label: string
  options: Option[]
  placeholder?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
}

const FormSelect = ({
  name,
  label,
  options,
  placeholder = 'Select an option',
  helperText,
  disabled = false,
  required = false,
}: FormSelectProps) => {
  const { control, formState: { errors } } = useFormContext()
  
  // Format error message
  const errorMessage = errors[name]?.message as string
  const hasError = !!errors[name]
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Render different selects based on error state
          return hasError ? (
            <select
              {...field}
              id={name}
              disabled={disabled}
              aria-invalid="true"
              aria-describedby={`${name}-error`}
              className={`w-full px-3 py-2 border border-destructive rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              {...field}
              id={name}
              disabled={disabled}
              aria-invalid="false"
              className={`w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }}
      />
      
      {/* Helper text */}
      {helperText && !errorMessage && (
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

export default FormSelect