import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { SelectField } from '@/components/custom-components/select-field'
import { useAddMember } from '../hooks/use-add-member'

/** Add a member by email + role (FE-SHARE-3). Author-only; mounted in the
 *  members tab. No autocomplete — the all-users endpoint is off-limits (§11). */
export function AddMemberForm({ documentId }: { documentId: string }) {
  const { form, onSubmit, isPending } = useAddMember(documentId)
  const rootError = form.formState.errors.root?.message

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <FormError message={rootError} />
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-45 flex-1">
          <FormField
            control={form.control}
            name="email"
            label="Invite by email"
            type="email"
            placeholder="name@example.com"
            autoComplete="off"
          />
        </div>
        <div className="flex w-28 shrink-0 flex-col gap-1.5">
          <Label htmlFor="add-member-role">Role</Label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <SelectField id="add-member-role" {...field}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </SelectField>
            )}
          />
        </div>
      </div>
      <Button type="submit" variant="primary" size="sm" disabled={isPending}>
        {isPending ? 'Adding…' : 'Add member'}
      </Button>
    </form>
  )
}
