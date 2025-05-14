import { useNavigate } from 'react-router-dom'
import useModalStore from '../../stores/modalStore'
import ConfirmationModal from '../ui/ConfirmationModal'
import SuccessModal from '../ui/SuccessModal'
import VerificationModal from '../ui/VerificationModal'
import Modal from '../ui/Modal'
import UrlInputModal from '../ui/UrlInputModal' // Import the new component

const ModalProvider = () => {
  const { isOpen, currentModal, closeModal } = useModalStore()
  const navigate = useNavigate()
  
  if (!isOpen || !currentModal) return null
  
  // Helper function to navigate to job detail
  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`)
  }
  
  // Render the appropriate modal based on type
  switch (currentModal.type) {
    case 'confirmation':
      return (
        <ConfirmationModal
          isOpen={isOpen}
          onClose={closeModal}
          title={currentModal.data.title}
          message={currentModal.data.message}
          confirmText={currentModal.data.confirmText}
          cancelText={currentModal.data.cancelText}
          onConfirm={currentModal.data.onConfirm}
          variant={currentModal.data.variant}
          confirmButtonVariant={currentModal.data.confirmButtonVariant as 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'}
        />
      )
      
    case 'success':
      return (
        <SuccessModal
          isOpen={isOpen}
          onClose={closeModal}
          title={currentModal.data.title}
          description={currentModal.data.description}
          jobId={currentModal.data.jobId}
          modificationCode={currentModal.data.modificationCode}
          showViewJobButton={currentModal.data.showViewJobButton}
          onViewJob={handleViewJob}
        >
          {currentModal.data.content}
        </SuccessModal>
      )
      
    case 'verification':
      return (
        <VerificationModal
          isOpen={isOpen}
          onClose={closeModal}
          title={currentModal.data.title}
          onVerify={currentModal.data.onVerify}
          error={currentModal.data.error}
          isVerifying={currentModal.data.isVerifying}
        />
      )
      
    case 'custom':
      return (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={currentModal.data.title}
          description={currentModal.data.description}
          footer={currentModal.data.footer}
          size={currentModal.data.size}
        >
          {currentModal.data.content}
        </Modal>
      )
      
    case 'urlInput':
      return (
        <UrlInputModal
          isOpen={isOpen}
          onClose={closeModal}
          title={currentModal.data.title || 'Insert Link'}
          initialUrl={currentModal.data.initialUrl ?? ''} // Use nullish coalescing
          onConfirm={currentModal.data.onConfirm}
        />
      )
      
    default:
      return null
  }
}

export default ModalProvider