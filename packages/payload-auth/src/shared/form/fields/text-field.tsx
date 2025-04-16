import { useFieldContext } from '../'

export function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  return (
    <label>
      <div>{label}</div>
      <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
    </label>
  )
}
