import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { PopoverTitle } from './popover'

describe('overlays', () => {
  it('renders submenu actions outside the scrolling menu and permits selection', async () => {
    const selected = vi.fn()
    const user = userEvent.setup()
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={selected}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('menuitem', { name: 'Export' }))
    const action = await screen.findByRole('menuitem', { name: 'Export PDF' })
    const parentMenu = screen
      .getByRole('menuitem', { name: 'Export' })
      .closest('[role="menu"]')
    expect(parentMenu).not.toContainElement(action)
    action.focus()
    await user.keyboard('{Enter}')
    expect(selected).toHaveBeenCalledTimes(1)
  })

  it('exposes the popover title as a level-two heading', () => {
    render(<PopoverTitle>Display settings</PopoverTitle>)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Display settings' }),
    ).toBeVisible()
  })
})
