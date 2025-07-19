
'use client'

import { useState, KeyboardEvent, useEffect } from 'react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
}

const DEFAULT_SUGGESTIONS = [
  'drilling', 'production', 'pipeline', 'offshore', 'onshore', 'maintenance',
  'safety', 'environment', 'certification', 'inspection', 'automation',
  'digital', 'renewable', 'gas', 'oil', 'upstream', 'downstream', 'midstream'
]

export default function TagInput({ 
  tags, 
  onChange, 
  placeholder = "Add tags...", 
  maxTags = 10,
  suggestions = DEFAULT_SUGGESTIONS 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [inputValue, suggestions, tags])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag on backspace when input is empty
      const newTags = tags.slice(0, -1)
      onChange(newTags)
    }
  }

  const addTag = (tagValue?: string) => {
    const newTag = (tagValue || inputValue).trim().toLowerCase()
    if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
      onChange([...tags, newTag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    onChange(newTags)
  }

  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion)
  }

  return (
    <div className="w-full relative">
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setShowSuggestions(false), 200)
            if (inputValue.trim()) addTag()
          }}
          onFocus={() => inputValue.length > 0 && setShowSuggestions(filteredSuggestions.length > 0)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none"
          disabled={tags.length >= maxTags}
        />
      </div>
      
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-1">
        Press Enter or comma to add tags. Max {maxTags} tags. {maxTags - tags.length} remaining.
      </p>
    </div>
  )
}
