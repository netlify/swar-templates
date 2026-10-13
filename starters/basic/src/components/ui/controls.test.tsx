import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './checkbox'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Switch } from './switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'
import { Label } from './label'

describe('form controls', () => {
  it('supports labelled checkbox and switch keyboard interaction', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Checkbox id="updates" />
        <Label htmlFor="updates">Updates</Label>
        <Switch id="notifications" />
        <Label htmlFor="notifications">Notifications</Label>
      </div>,
    )

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Updates' })).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Updates' })).toBeChecked()
    await user.tab()
    expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeChecked()
  })

  it('allows radio selection with arrow keys', async () => {
    const user = userEvent.setup()
    render(
      <RadioGroup defaultValue="daily" aria-label="Frequency">
        <RadioGroupItem value="daily" id="daily" />
        <Label htmlFor="daily">Daily</Label>
        <RadioGroupItem value="weekly" id="weekly" />
        <Label htmlFor="weekly">Weekly</Label>
      </RadioGroup>,
    )

    await user.tab()
    await user.keyboard('{ArrowDown>}')
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Weekly' })).toBeChecked()
    })
    await user.keyboard('{/ArrowDown}')
  })

  it('exposes accordion state and content to keyboard users', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent>Additional information</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    await user.tab()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Additional information')).toBeVisible()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
