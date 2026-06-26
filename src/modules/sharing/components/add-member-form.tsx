import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/custom-components/form-field'
import { FormError } from '@/components/custom-components/form-error'
import { useAddMember } from '../hooks/use-add-member'

/** Add a member by email + role (FE-SHARE-3). Author-only; mounted in the
 *  members tab. No autocomplete — the all-users endpoint is off-limits (§11). */
export function AddMemberForm({ documentId }: { documentId: string }) {
  const { form, onSubmit, isPending } = useAddMember(documentId)
  const rootError = form.formState.errors.root?.message

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <FormError message={rootError} />
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="email"
            label="Invite by email"
            type="email"
            placeholder="name@example.com"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="add-member-role"
            className="text-[13px] font-medium leading-none text-foreground"
          >
            Role
          </label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <select
                id="add-member-role"
                {...field}
                className="h-11 rounded-md border border-border bg-card px-2.5 text-[13.5px] text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
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
