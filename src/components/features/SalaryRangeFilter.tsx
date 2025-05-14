import { useState, useEffect } from 'react'
import Button from '../ui/Button'

// Match the server's PopularCurrency enum exactly
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

interface SalaryRangeFilterProps {
  minSalary: number | undefined
  maxSalary: number | undefined
  currency: string | undefined
  onMinChange: (min: number | undefined) => void
  onMaxChange: (max: number | undefined) => void
  onCurrencyChange: (currency: string | undefined) => void
  onSalaryChange: (min: number | undefined, max: number | undefined, currency: string | undefined) => void
}

const SalaryRangeFilter = ({
  minSalary,
  maxSalary,
  currency,
  onSalaryChange
}: SalaryRangeFilterProps) => {
  // Local state for the inputs
  const [minInput, setMinInput] = useState<string>(minSalary ? String(minSalary) : '')
  const [maxInput, setMaxInput] = useState<string>(maxSalary ? String(maxSalary) : '')
  const [currencyInput, setCurrencyInput] = useState<string>(currency || '')
  
  // Track if there are any pending changes
  const [hasChanges, setHasChanges] = useState(false)
  
  // Check if any filters are active
  const hasActiveFilters = minSalary !== undefined || maxSalary !== undefined || currency !== undefined
  
  // Update local state when props change
  useEffect(() => {
    setMinInput(minSalary ? String(minSalary) : '')
  }, [minSalary])
  
  useEffect(() => {
    setMaxInput(maxSalary ? String(maxSalary) : '')
  }, [maxSalary])
  
  useEffect(() => {
    setCurrencyInput(currency || '')
  }, [currency])
  
  // Handle min salary change - now just updates local state
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value)
    setHasChanges(true)
  }
  
  // Handle max salary change - now just updates local state
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value)
    setHasChanges(true)
  }
  
  // Handle currency change - now just updates local state
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyInput(e.target.value)
    setHasChanges(true)
  }
  
  // Apply the filters
  const handleApplyFilters = () => {
    // Parse min salary
    const min = minInput ? parseInt(minInput, 10) : undefined
    // Only use the value if it's a valid number
    const validMin = !isNaN(Number(min)) ? min : undefined
    
    // Parse max salary
    const max = maxInput ? parseInt(maxInput, 10) : undefined
    // Only use the value if it's a valid number
    const validMax = !isNaN(Number(max)) ? max : undefined
    
    // Currency remains a string
    const validCurrency = currencyInput || undefined
    
    // Update parent component with all three values at once
    onSalaryChange(validMin, validMax, validCurrency)
    setHasChanges(false)
  }
  
  // Clear all filters
  const handleClearFilters = () => {
    setMinInput('')
    setMaxInput('')
    setCurrencyInput('')
    onSalaryChange(undefined, undefined, undefined)
    setHasChanges(false)
  }
  
  return (
    <div className="space-y-3">
      {/* Currency selector - with proper label and id */}
      <div className="mb-2">
        <label htmlFor="salary-currency" className="sr-only">Currency</label>
        <select
          id="salary-currency"
          value={currencyInput}
          onChange={handleCurrencyChange}
          aria-label="Select currency"
          className="w-full px-3 py-1 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Any Currency</option>
          {CURRENCIES.map(curr => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
      
      {/* Salary range inputs */}
      <div className="flex items-center gap-2">
        <div className="w-1/2">
          <label htmlFor="salary-min" className="sr-only">Minimum Salary</label>
          <input
            id="salary-min"
            type="number"
            placeholder="Min"
            min="0"
            value={minInput}
            onChange={handleMinChange}
            aria-label="Minimum salary"
            className="w-full px-3 py-1 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <span className="text-muted-foreground">to</span>
        <div className="w-1/2">
          <label htmlFor="salary-max" className="sr-only">Maximum Salary</label>
          <input
            id="salary-max"
            type="number"
            placeholder="Max"
            min="0"
            value={maxInput}
            onChange={handleMaxChange}
            aria-label="Maximum salary"
            className="w-full px-3 py-1 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      
      {/* Display warning if min > max */}
      {minInput && maxInput && parseInt(minInput) > parseInt(maxInput) && (
        <p className="text-xs text-destructive mt-1">
          Minimum salary should not exceed maximum salary
        </p>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-2 mt-2">
        {/* Apply button - only show when changes exist */}
        {hasChanges && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleApplyFilters}
          >
            Apply Filter
          </Button>
        )}
        
        {/* Clear button - only show if there are active filters */}
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            className={`flex-1 text-xs text-muted-foreground hover:text-foreground ${!hasChanges ? 'w-full' : ''}`}
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

export default SalaryRangeFilter