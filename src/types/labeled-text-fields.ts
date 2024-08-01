import type { Label } from '@/components/form-controls/label'
import type { TextField } from '@/components/form-controls/text-field'

export type LabeledTextFields = (Omit<
  React.ComponentProps<typeof TextField>,
  'id' | 'readOnly'
> & {
  id: React.ComponentProps<typeof Label>['htmlFor']
  label: React.ComponentProps<typeof Label>['children']
})[]
