import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculator from './Calculator'

afterEach(cleanup)

const result = () => screen.getByRole('status', { name: 'Result' }).textContent

async function press(keys: string[]) {
  const user = userEvent.setup()
  for (const key of keys)
    await user.click(screen.getByRole('button', { name: key }))
}

describe('calculator input and arithmetic', () => {
  it('evaluates 200 × 10 % = as 20', async () => {
    render(<Calculator />)
    await press(['2', '0', '0', '×', '1', '0', '%'])
    expect(result()).toBe('0.1')
    await press(['='])
    expect(result()).toBe('20')
  })

  it('replaces a percentage with newly typed digits without losing the pending operation', async () => {
    render(<Calculator />)
    await press(['2', '0', '0', '×', '1', '0', '%', '5', '='])
    expect(result()).toBe('1,000')
  })

  it('uses a percentage operand when chaining another operation', async () => {
    render(<Calculator />)
    await press(['2', '0', '0', '×', '1', '0', '%', '+', '5', '='])
    expect(result()).toBe('25')
  })

  it.each([
    [['.', '5'], '0.5'],
    [['2', '+', '.', '5', '='], '2.5'],
    [['2', '+', '3', '=', '.', '5'], '0.5'],
    [['+/-', '.', '5'], '-0.5'],
    [['2', '×', '+/-', '.', '5', '='], '-1'],
    [['.', '5', '+/-'], '-0.5'],
    [['1', '.', '2', '0', '.'], '1.20'],
  ])('normalizes decimal entry %j', async (keys, expected) => {
    render(<Calculator />)
    await press(keys)
    expect(result()).toBe(expected)
  })

  it('evaluates chained operations sequentially', async () => {
    render(<Calculator />)
    await press(['2', '+', '3', '×', '4', '='])
    expect(result()).toBe('20')
  })

  it('allows replacing an operator before entering the next operand', async () => {
    render(<Calculator />)
    await press(['8', '+', '×', '2', '='])
    expect(result()).toBe('16')
  })

  it('waits for a second operand and does not repeat equals', async () => {
    render(<Calculator />)
    await press(['8', '+', '='])
    expect(result()).toBe('8')
    await press(['2', '=', '='])
    expect(result()).toBe('10')
  })

  it('recovers from division by zero with a fresh decimal calculation', async () => {
    render(<Calculator />)
    await press(['8', '÷', '0', '='])
    expect(result()).toBe('Error')
    await press(['+', '%', '+/-'])
    expect(result()).toBe('Error')
    await press(['.', '5', '+', '1', '='])
    expect(result()).toBe('1.5')
  })

  it('clears pending arithmetic after an error while chaining', async () => {
    render(<Calculator />)
    await press(['8', '÷', '0', '+'])
    expect(result()).toBe('Error')
    await press(['7', '+', '1', '='])
    expect(result()).toBe('8')
  })

  it('keeps standalone percentage as division by 100', async () => {
    render(<Calculator />)
    await press(['5', '0', '%'])
    expect(result()).toBe('0.5')
  })

  it('preserves entered integer digits and scientific results when formatting', async () => {
    render(<Calculator />)
    await press('9007199254740993'.split(''))
    expect(result()).toBe('9,007,199,254,740,993')
    await press([
      'C',
      '0',
      '.',
      '0',
      '0',
      '0',
      '0',
      '0',
      '0',
      '1',
      '×',
      '1',
      '=',
    ])
    expect(result()).toBe('1e-7')
  })

  it('shows Error for overflow and clears it with the keyboard', async () => {
    render(<Calculator />)
    await userEvent.keyboard('9'.repeat(309) + '*9{Enter}')
    expect(result()).toBe('Error')
    await userEvent.keyboard('{Escape}')
    expect(result()).toBe('0')
  })
})

describe('calculator keyboard', () => {
  it('supports digits, operators, percent, Enter, and equals', async () => {
    render(<Calculator />)
    await userEvent.keyboard('200*10%{Enter}')
    expect(result()).toBe('20')
    await userEvent.keyboard('+5=')
    expect(result()).toBe('25')
  })

  it('evaluates once when Enter is pressed on a focused digit button', async () => {
    render(<Calculator />)
    await press(['2', '+', '3'])
    await userEvent.keyboard('{Enter}')
    expect(result()).toBe('5')
  })

  it('supports backspace, sign changes, decimal entry, and clear shortcuts', async () => {
    render(<Calculator />)
    await userEvent.keyboard('{F9}.5{Backspace}{Backspace}2')
    expect(result()).toBe('-2')
    await userEvent.keyboard('{Delete}12{Backspace}3')
    expect(result()).toBe('13')
    await userEvent.keyboard('c')
    expect(result()).toBe('0')
  })

  it('does not intercept text editing or modified shortcuts', async () => {
    render(
      <>
        <Calculator />
        <input aria-label="Other input" />
      </>,
    )
    await userEvent.type(screen.getByLabelText('Other input'), '12.5')
    expect(result()).toBe('0')
    fireEvent.keyDown(window, { key: '3', ctrlKey: true })
    fireEvent.keyDown(window, { key: '4', metaKey: true })
    expect(result()).toBe('0')
  })

  it('recovers from an arithmetic error with Backspace', async () => {
    render(<Calculator />)
    await userEvent.keyboard('8/0{Enter}')
    expect(result()).toBe('Error')
    await userEvent.keyboard('{Backspace}.5')
    expect(result()).toBe('0.5')
  })
})
