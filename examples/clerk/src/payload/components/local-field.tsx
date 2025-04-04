'use client'
import type { TextFieldClientComponent } from 'payload'
import { useField, useAuth, useConfig } from '@payloadcms/ui'

export const LocalField: TextFieldClientComponent = (props) => {
  console.log('LocalField props:', props)
  try {
    const auth = useAuth()
    console.log('LocalField auth:', auth)
    
    const config = useConfig()
    console.log('LocalField config provider value:', config)
    
    const { value, setValue } = useField({ path: props.path }) 
    console.log('LocalField value:', value)
    
    return (
      <div>
        <p>test local field</p>
        <p>Value: {value}</p>
      </div>
    )
  } catch (error) {
    console.error('Error in LocalField:', error)
    return (
      <div>
        <p>Error in local field</p>
      </div>
    )
  }
}