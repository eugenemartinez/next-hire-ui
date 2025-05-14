import { useFormContext, Controller } from 'react-hook-form'
import { FiAlertCircle } from 'react-icons/fi'

type CurrencyOption = {
  value: string
  label: string
  symbol: string
}

// Match the backend's PopularCurrency enum
const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'CAD', label: 'CAD ($)', symbol: '$' },
  { value: 'AUD', label: 'AUD ($)', symbol: '$' },
]

type SalaryInputProps = {
  minName: string
  maxName: string
  currencyName: string
  label: string
  helperText?: string
}

const SalaryInput = ({
  minName,
  maxName,
  currencyName,
  label,
  helperText,
}: SalaryInputProps) => {
  const { 
    control, 
    formState: { errors },
    watch,
  } = useFormContext()
  
  // Watch min/max values to provide validation feedback
  const minValue = watch(minName)
  const maxValue = watch(maxName)
  
  // Format numbers with commas
  const formatNumber = (value: string) => {
    if (!value) return ''
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  
  // Parse formatted number back to raw number
  const parseNumber = (value: string) => {
    return value.replace(/,/g, '')
  }
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      
      <div className="grid grid-cols-12 gap-3">
        {/* Currency Select */}
        <div className="col-span-12 sm:col-span-3">
          <Controller
            name={currencyName}
            control={control}
            defaultValue="USD" // Match backend default
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CURRENCY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        
        {/* Min Salary */}
        <div className="col-span-12 sm:col-span-4 relative">
          <Controller
            name={minName}
            control={control}
            render={({ field: { onChange, value, ...field } }) => {
              const hasError = !!errors[minName];
              const currencySymbol = (CURRENCY_OPTIONS.find(c => c.value === watch(currencyName)) || CURRENCY_OPTIONS[0]).symbol;
              
              return (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </div>
                  {hasError ? (
                    <input
                      {...field}
                      type="text"
                      placeholder="Min"
                      value={formatNumber(value || '')}
                      onChange={(e) => {
                        const raw = parseNumber(e.target.value)
                        if (/^\d*$/.test(raw)) {
                          onChange(raw)
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2 border border-destructive rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30"
                      aria-invalid="true"
                      aria-describedby={`${minName}-error`}
                    />
                  ) : (
                    <input
                      {...field}
                      type="text"
                      placeholder="Min"
                      value={formatNumber(value || '')}
                      onChange={(e) => {
                        const raw = parseNumber(e.target.value)
                        if (/^\d*$/.test(raw)) {
                          onChange(raw)
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-invalid="false"
                    />
                  )}
                </div>
              );
            }}
          />
          {errors[minName] && (
            <p id={`${minName}-error`} className="mt-1 text-sm text-destructive flex items-center gap-1">
              <FiAlertCircle size={14} />
              {errors[minName]?.message as string}
            </p>
          )}
        </div>
        
        <div className="col-span-12 sm:col-span-1 flex items-center justify-center">
          <span className="text-muted-foreground">to</span>
        </div>
        
        {/* Max Salary */}
        <div className="col-span-12 sm:col-span-4 relative">
          <Controller
            name={maxName}
            control={control}
            render={({ field: { onChange, value, ...field } }) => {
              const hasError = !!errors[maxName];
              const currencySymbol = (CURRENCY_OPTIONS.find(c => c.value === watch(currencyName)) || CURRENCY_OPTIONS[0]).symbol;
              
              return (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </div>
                  {hasError ? (
                    <input
                      {...field}
                      type="text"
                      placeholder="Max"
                      value={formatNumber(value || '')}
                      onChange={(e) => {
                        const raw = parseNumber(e.target.value)
                        if (/^\d*$/.test(raw)) {
                          onChange(raw)
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2 border border-destructive rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30"
                      aria-invalid="true"
                      aria-describedby={`${maxName}-error`}
                    />
                  ) : (
                    <input
                      {...field}
                      type="text"
                      placeholder="Max"
                      value={formatNumber(value || '')}
                      onChange={(e) => {
                        const raw = parseNumber(e.target.value)
                        if (/^\d*$/.test(raw)) {
                          onChange(raw)
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-invalid="false"
                    />
                  )}
                </div>
              );
            }}
          />
          {errors[maxName] && (
            <p id={`${maxName}-error`} className="mt-1 text-sm text-destructive flex items-center gap-1">
              <FiAlertCircle size={14} />
              {errors[maxName]?.message as string}
            </p>
          )}
        </div>
      </div>
      
      {/* Validation warning for min > max */}
      {minValue && maxValue && parseInt(minValue) > parseInt(maxValue) && (
        <p className="mt-1 text-sm text-warning flex items-center gap-1">
          <FiAlertCircle size={14} />
          Minimum salary should be less than maximum salary
        </p>
      )}
      
      {/* Helper text */}
      {helperText && (
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}

export default SalaryInput