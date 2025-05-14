import { useState, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { FiX, FiAlertCircle, FiLoader } from 'react-icons/fi' // Added FiLoader
import { useQuery } from '@tanstack/react-query'
import { tagsApi } from '../../api/tags'
import ErrorState from '../ui/ErrorState' // Import ErrorState
import EmptyState from '../ui/EmptyState' // Import EmptyState

type TagInputProps = {
  name: string
  label: string
  helperText?: string
  required?: boolean
  maxTags?: number
}

const TagInput = ({ 
  name,
  label,
  helperText,
  required = false,
  maxTags = 10
}: TagInputProps) => {
  const { control, formState: { errors } } = useFormContext()
  
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    data: availableTags = [], 
    isLoading: isLoadingTags, 
    error: tagsError, 
    refetch: refetchTags 
  } = useQuery<string[], Error>({ // Specify Error type
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
    retry: 1, // Or your preferred retry count
  });
  
  const fieldError = errors[name]; 
  const hasError = !!fieldError;
  const specificMessage = (fieldError && typeof fieldError.message === 'string') ? fieldError.message : 
                          (Array.isArray(fieldError) && fieldError[0] && typeof fieldError[0].message === 'string' ? fieldError[0].message : undefined);

  return (
    <div className="mb-4">
      <label htmlFor={`${name}-input`} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const addTag = (tag: string) => {
            const trimmedTag = tag.trim();
            if (!trimmedTag) return;
            
            const currentTags = field.value || [];
            if (currentTags.includes(trimmedTag)) {
              setInputValue(''); // Clear input even if tag exists
              return;
            }
            if (currentTags.length >= maxTags) {
              // Optionally, provide feedback that max tags reached
              setInputValue(''); 
              return;
            }
            
            const newTags = [...currentTags, trimmedTag];
            field.onChange(newTags);
            setInputValue('');
          };
          
          const removeTag = (tagToRemove: string) => {
            const currentTags = field.value || [];
            const newTags = currentTags.filter((tag: string) => tag !== tagToRemove);
            field.onChange(newTags);
          };
          
          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(inputValue);
            } else if (e.key === 'Backspace' && !inputValue) {
              const currentTags = field.value || [];
              if (currentTags.length > 0) {
                removeTag(currentTags[currentTags.length - 1]);
              }
            }
          };
          
          const showSuggestions = inputValue.trim().length > 0; // Show suggestions only when input is not empty

          const filteredSuggestions = showSuggestions && !isLoadingTags && !tagsError
            ? availableTags
                .filter((tag: string) => 
                  tag.toLowerCase().includes(inputValue.toLowerCase()) && 
                  !(field.value || []).includes(tag)
                )
                .slice(0, 5)
            : [];
            
          return (
            <>
              <div 
                className={`border rounded-md bg-background p-2 flex flex-wrap gap-2 
                  ${hasError ? 'border-destructive' : 'border-input'} 
                `}
                onClick={() => inputRef.current?.focus()}
              >
                {/* Render current tags */}
                {(field.value || []).map((tag: string, index: number) => {
                  const individualTagErrorObject = Array.isArray(fieldError) ? fieldError[index] : null;
                  const isThisTagInvalid = !!(individualTagErrorObject && individualTagErrorObject.message);

                  return (
                    <div 
                      key={`${tag}-${index}`}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs
                        ${isThisTagInvalid 
                          ? 'border border-destructive text-destructive bg-transparent' // Red outline for invalid
                          : 'border border-primary text-primary bg-transparent'} 
                      `}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 cursor-pointer text-primary/80 hover:text-destructive transition-colors duration-150" // Primary default, red on hover
                        aria-label={`Remove ${tag} tag`}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  );
                })}
                
                {/* Input for adding new tags - Conditional rendering based on hasError */}
                {hasError ? (
                  <input
                    id={`${name}-input`}
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={field.onBlur} 
                    className="flex-grow min-w-[120px] p-1 outline-none bg-transparent text-xs" // Added text-xs
                    placeholder={(field.value || []).length ? '' : 'Type and press Enter...'}
                    aria-invalid="true"
                    aria-describedby={`${name}-error-message`}
                  />
                ) : (
                  <input
                    id={`${name}-input`}
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={field.onBlur} 
                    className="flex-grow min-w-[120px] p-1 outline-none bg-transparent text-xs" // Added text-xs
                    placeholder={(field.value || []).length ? '' : 'Type and press Enter...'}
                    aria-invalid="false"
                  />
                )}
              </div>
              
              {/* Suggestions Dropdown Area */}
              {showSuggestions && ( // Only render suggestion box if user is typing
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 z-10 border border-border bg-card rounded-md shadow-md mt-1 p-2 text-sm">
                    {isLoadingTags ? (
                      <div className="flex items-center justify-center py-2 text-muted-foreground">
                        <FiLoader className="animate-spin mr-2" size={16} />
                        Loading tags...
                      </div>
                    ) : tagsError ? (
                      <ErrorState
                        title="Error" // Keep title short for this context
                        message="Could not load tags."
                        details={tagsError.message}
                        onRetry={refetchTags}
                        className="p-1 text-xs border-none shadow-none bg-transparent" // Compact styling
                        retryText="Retry"
                      />
                    ) : availableTags.length === 0 ? (
                      <EmptyState
                        title="" // No title needed for this context
                        message="No tags available."
                        className="p-1 text-xs bg-transparent" // Compact styling
                      />
                    ) : filteredSuggestions.length > 0 ? (
                      <ul>
                        {filteredSuggestions.map((suggestion: string) => (
                          <li 
                            key={suggestion}
                            className="px-3 py-2 cursor-pointer hover:bg-accent/20 rounded"
                            onClick={() => addTag(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    ) : ( // availableTags has items, but no filteredSuggestions match inputValue
                      <EmptyState
                        title="" // No title needed for this context
                        message={`No suggestions for "${inputValue}".`}
                        className="p-1 text-xs bg-transparent" // Compact styling
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* Max tags counter */}
              <p className="mt-1 text-sm text-muted-foreground">
                {(field.value || []).length}/{maxTags} tags max
              </p>
            </>
          )
        }}
      />
      
      {/* Helper text */}
      {helperText && !hasError && ( 
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      )}
      
      {/* Error message */}
      {hasError && ( 
        <p id={`${name}-error-message`} className="mt-1 text-sm text-destructive flex items-center gap-1">
          <FiAlertCircle size={14} />
          {specificMessage || "Invalid input for tags. Please check individual tags and quantity."} 
        </p>
      )}
    </div>
  )
}

export default TagInput