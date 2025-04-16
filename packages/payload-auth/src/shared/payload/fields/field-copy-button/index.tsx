'use client'
import './index.css'
import { Button, CopyIcon, TextField, useField } from '@payloadcms/ui'
import { useRef, useState } from 'react'

export const FieldCopyButton: typeof TextField = ({ path }) => {
  const { value } = useField({ path })
  const [copied, setCopied] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(value as string)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }
  return (
    <div className="field-copy-text__button-wrapper">
      <div className="field-copy-text__tooltip" data-visible={copied}>
        Copied
      </div>
      <Button 
        ref={buttonRef} 
        icon={<CopyIcon />} 
        buttonStyle="transparent" 
        onClick={handleCopy} 
        className="field-copy-text__button" 
      />
    </div>
  )
}
