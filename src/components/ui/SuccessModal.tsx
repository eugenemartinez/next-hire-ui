import Modal, { type ModalProps } from './Modal'
import Button from './Button'
import { FiCopy, FiCheck } from 'react-icons/fi' // Added FiCheck
import { toast } from 'sonner'
import { useState, useEffect } from 'react' // Added useState and useEffect

interface SuccessModalProps extends Omit<ModalProps, 'footer'> {
  jobId?: string
  modificationCode?: string
  showViewJobButton?: boolean
  onViewJob?: (jobId: string) => void
}

const SuccessModal = ({
  isOpen,
  onClose,
  title = 'Success',
  description,
  children,
  jobId,
  modificationCode,
  showViewJobButton = true,
  onViewJob,
  ...props
}: SuccessModalProps) => {
  const [isCopied, setIsCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopyCode = () => {
    if (modificationCode) {
      navigator.clipboard.writeText(modificationCode)
      toast.success('Modification code copied to clipboard')
      setIsCopied(true);
    }
  }
  
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Highlight duration: 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Handle navigate to job detail
  const handleViewJob = () => {
    onClose()
    if (jobId && onViewJob) {
      onViewJob(jobId)
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {showViewJobButton && jobId && onViewJob && (
            <Button className="flex-1" onClick={handleViewJob}>
              View Job
            </Button>
          )}
          <Button 
            variant={showViewJobButton ? "outline" : "primary"} 
            className="flex-1 py-2" 
            onClick={onClose}
          >
            {showViewJobButton ? "Close" : "Got it"}
          </Button>
        </div>
      }
      {...props}
    >
      <div className="py-2">
        {children}
        
        {modificationCode && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded my-4">
            <h4 className="font-semibold text-yellow-800 mb-1">
              Important: Save Your Modification Code
            </h4>
            <p className="text-sm text-yellow-700 mb-3">
              This code is required to edit or delete this job listing in the future.
            </p>
            <div 
              className={`relative bg-white p-3 border rounded font-mono text-center break-all cursor-pointer transition-all duration-200 ease-in-out
                ${isCopied ? 'border-green-500 ring-2 ring-green-300 bg-green-50' : 'border-yellow-300 hover:border-yellow-400'}
              `}
              onClick={handleCopyCode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopyCode(); }}
              aria-label="Copy modification code"
            >
              {modificationCode}
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500"
                aria-hidden="true" // Icon is decorative as the whole area is clickable
              >
                {isCopied ? <FiCheck size={16} className="text-green-600" /> : <FiCopy size={16} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default SuccessModal