import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FieldProps extends React.ComponentProps<'input'> {
  id: string
  label: string
}

/**
 * Label + Input pair. Presentational for now; FE-AUTH-* will swap the bare
 * Input for a Controller-bound field and add the error slot (CLAUDE.md §7).
 */
export function Field({ id, label, ...inputProps }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}
