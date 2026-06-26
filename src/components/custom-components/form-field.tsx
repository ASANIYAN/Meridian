import * as React from 'react'
import { useState } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
} & Omit<React.ComponentProps<'input'>, 'name'>

/**
 * Controller-bound field — Label + Input + inline error. Per-field validation
 * fires on blur (the form's mode), full validation runs on submit (CLAUDE.md §7).
 *
 * Password fields reveal their value while focused and re-mask on blur — so the
 * person typing can read what they entered, but it's never left visible on screen.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: FormFieldProps<T>) {
  const isPassword = inputProps.type === 'password'
  const [revealed, setRevealed] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            aria-invalid={!!fieldState.error}
            {...inputProps}
            {...field}
            type={isPassword ? (revealed ? 'text' : 'password') : inputProps.type}
            onFocus={(e) => {
              if (isPassword) setRevealed(true)
              inputProps.onFocus?.(e)
            }}
            onBlur={(e) => {
              if (isPassword) setRevealed(false)
              field.onBlur()
              inputProps.onBlur?.(e)
            }}
          />
          {fieldState.error && (
            <p className="text-[12px] leading-snug text-presence-coral">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}
