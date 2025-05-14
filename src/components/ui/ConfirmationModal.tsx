import Modal, { type ModalProps } from './Modal'
import Button from './Button'
import { FiAlertTriangle } from 'react-icons/fi'

interface ConfirmationModalProps extends Omit<ModalProps, 'footer' | 'children'> {
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void> // Allow onConfirm to be a Promise
  variant?: 'danger' | 'warning' | 'info'
  message: string
  confirmButtonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  isConfirming?: boolean // New prop for loading state
  confirmingText?: string // Optional text to show when confirming
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  title = 'Confirm Action',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'warning',
  message,
  confirmButtonVariant = 'primary',
  isConfirming = false, // Default to false
  confirmingText, // No default, uses confirmText if not provided and isConfirming
  ...props
}: ConfirmationModalProps) => {
  // Handle confirm action
  const handleConfirm = async () => {
    // No need to manage local loading state here if isConfirming is passed as a prop
    await onConfirm(); 
    // Only close if not externally controlled or if the action didn't handle it
    // If onConfirm navigates or causes a parent component to unmount/close the modal,
    // calling onClose() here might be redundant or cause issues.
    // For now, we'll keep it, but this is a common area for refinement in modal logic.
    if (!isConfirming) { // Avoid closing if the parent is still processing and might want to keep it open
        onClose();
    }
  }

  // Icon and color based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'text-destructive bg-destructive/10'
      case 'warning':
        return 'text-amber-600 bg-amber-50'
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const currentConfirmText = isConfirming && confirmingText ? confirmingText : confirmText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isConfirming} // Disable cancel while confirming
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmButtonVariant} 
            onClick={handleConfirm}
            isLoading={isConfirming} // Use the new prop here
            // The Button component will handle disabling itself when isLoading is true
          >
            {currentConfirmText}
          </Button>
        </div>
      }
      {...props}
    >
      <div className="flex items-start gap-3 py-2">
        <div className={`p-2 rounded-full ${getVariantClasses()}`}>
          <FiAlertTriangle size={18} />
        </div>
        <p className="text-sm">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmationModal