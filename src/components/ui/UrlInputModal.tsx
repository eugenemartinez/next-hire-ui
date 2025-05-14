import { useState, useRef, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'

interface UrlInputModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialUrl?: string // This is already optional
  onConfirm: (url: string) => void
}

const UrlInputModal = ({
  isOpen,
  onClose,
  title,
  initialUrl = '', // Set empty string as default value
  onConfirm,
}: UrlInputModalProps) => {
  const [url, setUrl] = useState(initialUrl || '') // Handle case when initialUrl is undefined
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Update state when initialUrl changes
  useEffect(() => {
    setUrl(initialUrl || '')
  }, [initialUrl])
  
  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleConfirm()
  }
  
  const handleConfirm = () => {
    let formattedUrl = url.trim()
    
    // Add https:// if missing and the URL is not empty
    if (formattedUrl && !formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = `https://${formattedUrl}`
    }
    
    onConfirm(formattedUrl)
    onClose()
  }
  
  const handleRemove = () => {
    onConfirm('')
    onClose()
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-row gap-2 mt-2 justify-end">
          {url && (
            <Button
              variant="outline"
              onClick={handleRemove}
              type="button"
            >
              Remove Link
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            type="submit"
          >
            Confirm
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium mb-1">
            URL
          </label>
          <input
            ref={inputRef}
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter a URL for your link. If you leave off http://, https:// will be added automatically.
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default UrlInputModal