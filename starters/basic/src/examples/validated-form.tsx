import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const emailSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

type EmailValues = z.infer<typeof emailSchema>

export function ValidatedForm({
  onSubmit,
}: {
  onSubmit: (values: EmailValues) => Promise<void>
}) {
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setSubmitted(false)
    form.clearErrors('root')
    try {
      await onSubmit(values)
      setSubmitted(true)
    } catch {
      form.setError('root', {
        message: 'Your submission couldn’t be saved. Please try again.',
      })
    }
  })

  return (
    <Form {...form}>
      <form
        onSubmit={submit}
        onChange={() => setSubmitted(false)}
        noValidate
        className="max-w-md space-y-6"
      >
        <fieldset disabled={form.formState.isSubmitting} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use the address where we can reach you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          {submitted && <p role="status">Your submission was saved.</p>}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving…' : 'Submit'}
          </Button>
        </fieldset>
      </form>
    </Form>
  )
}
