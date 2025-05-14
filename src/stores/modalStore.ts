import { create } from 'zustand'

// Define modal types
export type ModalType = 
  | 'confirmation' 
  | 'success' 
  | 'verification' 
  | 'custom'
  | 'urlInput'

// Data type for each modal type
interface ConfirmationModalData {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void> // Ensure this allows Promise
  variant?: 'danger' | 'warning' | 'info'
  confirmButtonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  isConfirming?: boolean // Add this line
  confirmingText?: string // Add this line
}

interface SuccessModalData {
  title?: string
  description?: string
  jobId?: string
  modificationCode?: string
  content?: React.ReactNode
  showViewJobButton?: boolean
}

interface VerificationModalData {
  title?: string
  onVerify: (code: string) => void
  error?: string
  isVerifying?: boolean
}

interface CustomModalData {
  title?: string
  description?: string
  content: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

interface UrlInputModalData {
  title?: string
  initialUrl?: string
  onConfirm: (url: string) => void
}

// Union type for all possible modal data
export type ModalData = 
  | { type: 'confirmation', data: ConfirmationModalData }
  | { type: 'success', data: SuccessModalData }
  | { type: 'verification', data: VerificationModalData }
  | { type: 'custom', data: CustomModalData }
  | { type: 'urlInput', data: UrlInputModalData }

// Modal store state
interface ModalState {
  isOpen: boolean
  currentModal: ModalData | null
  
  // Actions
  openModal: (modal: ModalData) => void
  closeModal: () => void
  
  // Shortcuts for common modals
  openConfirmation: (data: ConfirmationModalData) => void
  openSuccess: (data: SuccessModalData) => void
  openVerification: (data: VerificationModalData) => void
  openCustom: (data: CustomModalData) => void
  openUrlInput: (data: UrlInputModalData) => void
}

// Create the modal store
const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  currentModal: null,
  
  openModal: (modal) => set({ 
    isOpen: true, 
    currentModal: modal 
  }),
  
  closeModal: () => set({ 
    isOpen: false,
    currentModal: null
  }),
  
  // Convenience methods for opening specific modal types
  openConfirmation: (data) => set({ 
    isOpen: true, 
    currentModal: { type: 'confirmation', data } 
  }),
  
  openSuccess: (data) => set({ 
    isOpen: true, 
    currentModal: { type: 'success', data } 
  }),
  
  openVerification: (data) => set({ 
    isOpen: true, 
    currentModal: { type: 'verification', data } 
  }),
  
  openCustom: (data) => set({ 
    isOpen: true, 
    currentModal: { type: 'custom', data } 
  }),
  
  openUrlInput: (data) => set({ 
    isOpen: true, 
    currentModal: { type: 'urlInput', data } 
  })
}))

export default useModalStore