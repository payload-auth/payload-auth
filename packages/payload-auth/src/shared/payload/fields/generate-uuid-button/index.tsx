'use client'

import './index.css'
import { Button, TextField, useField } from '@payloadcms/ui'
import { useRef } from 'react'

export const GenerateUuidButton: typeof TextField = ({ path }) => {
  const { setValue } = useField({ path })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleGenerate = () => {
    setValue(crypto.randomUUID())
  }

  return (
    <div className="generate-uuid-button-wrapper">
      <Button
        ref={buttonRef}
        buttonStyle="primary"
        onClick={handleGenerate}
        className="generate-uuid-button"
      >
        Generate UUID
      </Button>
    </div>
  )
}