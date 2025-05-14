import { useCallback, useEffect, useState } from 'react'
import { useController } from 'react-hook-form'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { FiBold, FiItalic, FiCodepen, FiLink, FiCode } from 'react-icons/fi'
import { AiOutlineOrderedList, AiOutlineUnorderedList } from 'react-icons/ai'
import { RxQuote, RxHeading } from 'react-icons/rx'
import { IoText } from 'react-icons/io5'
import Button from '../ui/Button'
import useModalStore from '../../stores/modalStore'

type RichTextEditorProps = {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  maxLength?: number
}

const RichTextEditor = ({ 
  name, 
  label, 
  placeholder = 'Start typing...',
  required = false,
  maxLength = 5000
}: RichTextEditorProps) => {
  const { field, fieldState } = useController({ name })
  const [charCount, setCharCount] = useState(0)
  
  // Import BulletList and OrderedList separately to ensure they're configured properly
  const editor = useEditor({
    extensions: [
      // Remove bulletList and orderedList from StarterKit
      StarterKit.configure({
        bulletList: false, // Disable within StarterKit
        orderedList: false, // Disable within StarterKit
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-zinc-950 p-4 my-4 overflow-x-auto font-mono text-sm text-zinc-50',
          },
        },
      }),
      // Add them separately
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary underline-offset-2',
        },
      }),
    ],
    content: field.value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const textContent = editor.state.doc.textContent
      setCharCount(textContent.length)
      
      if (textContent.length <= maxLength) {
        field.onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none w-full min-h-[180px] prose prose-sm prose-pre:bg-zinc-950 prose-pre:p-4 prose-pre:rounded-md prose-pre:text-white prose-pre:font-mono prose-pre:text-sm max-w-none',
        style: 'height: 100%',
      },
    },
  })
  
  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || '')
      if (editor.state) {
        setCharCount(editor.state.doc.textContent.length)
      }
    }
  }, [editor, field.value])
  
  const { openUrlInput } = useModalStore()

  const setLink = useCallback(() => {
    if (!editor) return
    
    const previousUrl = editor.getAttributes('link').href || ''
    
    openUrlInput({
      title: 'Insert or Edit Link',
      initialUrl: previousUrl,
      onConfirm: (url) => {
        if (!url) {
          editor.chain().focus().extendMarkRange('link').unsetLink().run()
          return
        }
        
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    })
  }, [editor, openUrlInput])
  
  if (!editor) {
    return null
  }
  
  const errorMessage = fieldState.error?.message
  const isOverLimit = charCount > maxLength

  const toolbarButtonClass = (isActive: boolean) => 
    isActive ? 'bg-accent text-accent-foreground' : 'bg-transparent text-foreground'

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 p-1 border border-input rounded-md bg-background">
        {/* Text formatting */}
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('bold'))}
          iconOnly
          icon={<FiBold size={16} />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('italic'))}
          iconOnly
          icon={<FiItalic size={16} />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic"
        />
        
        <div className="h-6 mx-1 w-px bg-border" />
        
        {/* Text formatting options */}
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('paragraph'))}
          iconOnly
          icon={<IoText size={16} />}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Normal Text"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('heading', { level: 2 }))}
          iconOnly
          icon={
            <div className="flex items-center">
              <RxHeading size={16} />
              <span className="text-xs">2</span>
            </div>
          }
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('heading', { level: 3 }))}
          iconOnly
          icon={
            <div className="flex items-center">
              <RxHeading size={16} />
              <span className="text-xs">3</span>
            </div>
          }
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        />
        
        <div className="h-6 mx-1 w-px bg-border" />
        
        {/* List formatting */}
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('bulletList'))}
          iconOnly
          icon={<AiOutlineUnorderedList size={16} />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('orderedList'))}
          iconOnly
          icon={<AiOutlineOrderedList size={16} />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        />
        
        <div className="h-6 mx-1 w-px bg-border" />
        
        {/* Code and quotes */}
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('codeBlock'))}
          iconOnly
          icon={<FiCodepen size={16} />}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('code'))}
          iconOnly
          icon={<FiCode size={16} />}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('blockquote'))}
          iconOnly
          icon={<RxQuote size={16} />}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        />
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          className={toolbarButtonClass(editor.isActive('link'))}
          iconOnly
          icon={<FiLink size={16} />}
          onClick={setLink}
          title="Link"
        />
      </div>
      
      {/* Editor with improved prose classes */}
      <div 
        className={`border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring
          ${errorMessage || isOverLimit ? 'border-destructive' : 'border-input'}
          min-h-[200px] relative
        `}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent 
          editor={editor} 
          onBlur={field.onBlur}
          className="prose prose-sm prose-pre:bg-zinc-950 prose-pre:p-4 prose-pre:rounded-md prose-pre:text-white prose-pre:font-mono prose-pre:text-sm max-w-none p-3 h-full focus:outline-none"
        />
      </div>
      
      {/* Character count */}
      <div className={`mt-1 text-xs flex justify-end ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
        {charCount}/{maxLength} characters
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <p className="mt-1 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      
      {/* Character limit warning */}
      {isOverLimit && !errorMessage && (
        <p className="mt-1 text-sm text-destructive">
          Content exceeds maximum length of {maxLength} characters.
        </p>
      )}
    </div>
  )
}

export default RichTextEditor