'use client'
import type { TextFieldClientComponent } from 'payload'
import { useField, useAuth, useConfig } from '@payloadcms/ui'

export const PackageTestField: TextFieldClientComponent = (props) => {
  console.log(props)
  const auth = useAuth()
  try {
    const config = useConfig()
    console.log(config)
    const { value, setValue } = useField({ path: props.path }) 
    console.log(value)
  } catch (error) {
    console.log(error)
  }
  //const { value, setValue } = useField({ path: 'name' }) 
  console.log(auth)
  return (
    <div>
      <p>test</p>
    </div>
  )
}