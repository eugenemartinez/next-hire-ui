import React, { useState, useEffect } from 'react'
import Modal, { type ModalProps } from './Modal'
import Button from './Button'
import { FiKey, FiAlertCircle } from 'react-icons/fi'

interface VerificationModalProps extends Omit<ModalProps, 'footer' | 'children'> {
  onVerify: (code: string) => void
  isVerifying?: boolean
  error?: string // API error from parent
}

const VerificationModal = ({
  isOpen,
  onClose,
  title = 'Verification Required',
  onVerify,
  isVerifying = false,
  error, // API error from parent
  ...props
}: VerificationModalProps) => {
  const [code, setCode] = useState('')
  const [inputValidationError, setInputValidationError] = useState<string | null>(null)

  // Reset internal states when modal visibility changes or API error changes
  useEffect(() => {
    if (!isOpen) {
      setCode('')
      setInputValidationError(null)
    } else {
      // When modal opens, clear previous input validation error
      setInputValidationError(null)
    }
  }, [isOpen])

  useEffect(() => {
    // If an API error is passed, clear any local input validation error
    // as the API error is more relevant at that point.
    if (error) {
      setInputValidationError(null)
    }
  }, [error])
  
  const validateCurrentInput = (currentCode: string): boolean => {
    const trimmedCode = currentCode.trim()

    if (trimmedCode.length === 0) {
      setInputValidationError('Modification code cannot be empty.')
      return false
    }
    if (trimmedCode.length !== 8) {
      setInputValidationError('Code must be exactly 8 characters long.')
      return false
    }
    if (!/^[a-zA-Z0-9]+$/.test(trimmedCode)) {
      setInputValidationError('Code must contain only letters and numbers.')
      return false
    }
    
    setInputValidationError(null) // Clear error if all checks pass
    return true
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateCurrentInput(code)) {
      onVerify(code.trim())
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Enter the 8-character alphanumeric modification code." // Updated description
      footer={
        <div className="flex justify-end gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isVerifying} // Also disable cancel button while verifying
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            isLoading={isVerifying} // Use the isLoading prop here
            // The Button component handles being disabled when isLoading is true.
            // We still need to disable if the code input is empty.
            disabled={!code.trim() || isVerifying} 
          >
            {/* 
              If your Button component shows children alongside the spinner, 
              this conditional text is still good. 
              If it hides children when isLoading, you might just put "Verify".
            */}
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      }
      {...props}
    >
      <form onSubmit={handleSubmit} className="py-2">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <FiKey size={16} />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., ABCD1234" // Example placeholder
              className={`w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 ${
                inputValidationError && !error ? 'border-destructive ring-destructive focus:ring-destructive' : 'border-input focus:ring-ring'
              }`} // Highlight if input error and no API error
              disabled={isVerifying}
              maxLength={8} // Enforce max length at input level
              aria-describedby="code-validation-error"
            />
          </div>
          
          <div id="code-validation-error" aria-live="polite">
            {/* Display local input validation error if no API error */}
            {inputValidationError && !error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <FiAlertCircle size={14} />
                <p>{inputValidationError}</p>
              </div>
            )}
            
            {/* Display API error (passed as prop) */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <FiAlertCircle size={14} />
                <p>{error}</p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            The modification code was provided to you when you first created this job listing.
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default VerificationModal