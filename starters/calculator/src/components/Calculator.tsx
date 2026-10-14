import { useEffect, useReducer, useRef } from 'react'

type Operation = '+' | '-' | '*' | '/'

interface State {
  display: string
  previousValue: string | null
  operation: Operation | null
  replaceDisplay: boolean
  waitingForOperand: boolean
}

type Action =
  | { type: 'ADD_DIGIT'; digit: string }
  | { type: 'CHOOSE_OPERATION'; operation: Operation }
  | { type: 'EVALUATE' }
  | { type: 'CLEAR' }
  | { type: 'DELETE_DIGIT' }
  | { type: 'PERCENT' }
  | { type: 'TOGGLE_SIGN' }

function evaluate(
  previousValue: string,
  currentValue: string,
  operation: Operation,
): string {
  const prev = parseFloat(previousValue)
  const current = parseFloat(currentValue)
  if (!Number.isFinite(prev) || !Number.isFinite(current)) return 'Error'

  let result: number
  switch (operation) {
    case '+':
      result = prev + current
      break
    case '-':
      result = prev - current
      break
    case '*':
      result = prev * current
      break
    case '/':
      if (current === 0) return 'Error'
      result = prev / current
      break
    default:
      return currentValue
  }
  return Number.isFinite(result) ? String(result) : 'Error'
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_DIGIT': {
      if (state.display === 'Error' || state.replaceDisplay) {
        const next = state.display === 'Error' ? initialState : state
        return {
          ...next,
          display: action.digit === '.' ? '0.' : action.digit,
          replaceDisplay: false,
          waitingForOperand: false,
        }
      }
      if (action.digit === '.' && state.display.includes('.')) return state
      if (state.display === '0' && action.digit !== '.') {
        return { ...state, display: action.digit }
      }
      if (state.display === '-0' && action.digit !== '.') {
        return { ...state, display: `-${action.digit}` }
      }
      return { ...state, display: state.display + action.digit }
    }
    case 'CHOOSE_OPERATION': {
      if (state.display === 'Error') return state
      if (
        state.previousValue != null &&
        state.operation != null &&
        !state.waitingForOperand
      ) {
        const result = evaluate(
          state.previousValue,
          state.display,
          state.operation,
        )
        if (result === 'Error')
          return { ...initialState, display: 'Error', replaceDisplay: true }
        return {
          display: result,
          previousValue: result,
          operation: action.operation,
          replaceDisplay: true,
          waitingForOperand: true,
        }
      }
      return {
        ...state,
        previousValue: state.display,
        operation: action.operation,
        replaceDisplay: true,
        waitingForOperand: true,
      }
    }
    case 'EVALUATE': {
      if (
        state.previousValue == null ||
        state.operation == null ||
        state.waitingForOperand
      )
        return state
      const result = evaluate(
        state.previousValue,
        state.display,
        state.operation,
      )
      return {
        display: result,
        previousValue: null,
        operation: null,
        replaceDisplay: true,
        waitingForOperand: false,
      }
    }
    case 'CLEAR':
      return initialState
    case 'DELETE_DIGIT': {
      if (state.display === 'Error') {
        return initialState
      }
      if (state.replaceDisplay || state.display.includes('e'))
        return {
          ...state,
          display: '0',
          replaceDisplay: false,
          waitingForOperand: false,
        }
      const display = state.display.slice(0, -1)
      return { ...state, display: display === '-' ? '-0' : display || '0' }
    }
    case 'PERCENT': {
      if (state.display === 'Error') return state
      const val = parseFloat(state.display)
      if (isNaN(val)) return state
      if (!Number.isFinite(val))
        return { ...initialState, display: 'Error', replaceDisplay: true }
      return {
        ...state,
        display: String(val / 100),
        replaceDisplay: true,
        waitingForOperand: false,
      }
    }
    case 'TOGGLE_SIGN': {
      if (state.display === 'Error') return state
      if (state.waitingForOperand) {
        return {
          ...state,
          display: '-0',
          replaceDisplay: false,
          waitingForOperand: false,
        }
      }
      return {
        ...state,
        display: state.display.startsWith('-')
          ? state.display.slice(1)
          : '-' + state.display,
      }
    }
    default:
      return state
  }
}

const initialState: State = {
  display: '0',
  previousValue: null,
  operation: null,
  replaceDisplay: false,
  waitingForOperand: false,
}

export default function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const calculatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return
      const target = event.target
      if (target instanceof HTMLElement) {
        if (
          target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable]')
        )
          return
        if (
          target.closest('button, a') &&
          !calculatorRef.current?.contains(target)
        )
          return
      }
      let action: Action
      if (/^[0-9.]$/.test(event.key))
        action = { type: 'ADD_DIGIT', digit: event.key }
      else if (
        event.key === '+' ||
        event.key === '-' ||
        event.key === '*' ||
        event.key === '/'
      )
        action = { type: 'CHOOSE_OPERATION', operation: event.key }
      else if (event.key === 'Enter' || event.key === '=')
        action = { type: 'EVALUATE' }
      else if (['Escape', 'Delete', 'c', 'C'].includes(event.key))
        action = { type: 'CLEAR' }
      else if (event.key === 'Backspace') action = { type: 'DELETE_DIGIT' }
      else if (event.key === '%') action = { type: 'PERCENT' }
      else if (event.key === 'F9') action = { type: 'TOGGLE_SIGN' }
      else return
      event.preventDefault()
      dispatch(action)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const addDigit = (digit: string) => dispatch({ type: 'ADD_DIGIT', digit })
  const chooseOperation = (operation: Operation) =>
    dispatch({ type: 'CHOOSE_OPERATION', operation })

  const formatDisplay = (value: string) => {
    if (value === 'Error') return value
    const decimal = /^(-?)(\d+)(\.\d*)?$/.exec(value)
    if (!decimal) return value
    return (
      decimal[1] +
      BigInt(decimal[2]!).toLocaleString('en-US') +
      (decimal[3] ?? '')
    )
  }

  const isActive = (op: Operation) =>
    state.operation === op && state.waitingForOperand

  return (
    <div
      ref={calculatorRef}
      className="w-full max-w-sm mx-auto border rounded-2xl overflow-hidden"
    >
      <div className="p-6 pb-4 border-b">
        <div className="text-right min-h-[24px] text-sm mb-1">
          {state.previousValue != null && state.operation
            ? `${formatDisplay(state.previousValue)} ${state.operation}`
            : '\u00A0'}
        </div>
        <div
          role="status"
          aria-label="Result"
          aria-live="polite"
          aria-atomic="true"
          className="text-right text-5xl font-light tracking-tight overflow-hidden"
        >
          {formatDisplay(state.display)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[1px] p-2 pt-0">
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          C
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIGN' })}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          +/-
        </button>
        <button
          onClick={() => dispatch({ type: 'PERCENT' })}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          %
        </button>
        <button
          onClick={() => chooseOperation('/')}
          className={`h-16 rounded-xl text-lg font-medium border ${isActive('/') ? 'font-bold' : ''}`}
        >
          ÷
        </button>

        <button
          onClick={() => addDigit('7')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          7
        </button>
        <button
          onClick={() => addDigit('8')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          8
        </button>
        <button
          onClick={() => addDigit('9')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          9
        </button>
        <button
          onClick={() => chooseOperation('*')}
          className={`h-16 rounded-xl text-lg font-medium border ${isActive('*') ? 'font-bold' : ''}`}
        >
          ×
        </button>

        <button
          onClick={() => addDigit('4')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          4
        </button>
        <button
          onClick={() => addDigit('5')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          5
        </button>
        <button
          onClick={() => addDigit('6')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          6
        </button>
        <button
          onClick={() => chooseOperation('-')}
          className={`h-16 rounded-xl text-lg font-medium border ${isActive('-') ? 'font-bold' : ''}`}
        >
          −
        </button>

        <button
          onClick={() => addDigit('1')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          1
        </button>
        <button
          onClick={() => addDigit('2')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          2
        </button>
        <button
          onClick={() => addDigit('3')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          3
        </button>
        <button
          onClick={() => chooseOperation('+')}
          className={`h-16 rounded-xl text-lg font-medium border ${isActive('+') ? 'font-bold' : ''}`}
        >
          +
        </button>

        <button
          onClick={() => addDigit('0')}
          className="h-16 rounded-xl text-lg font-medium border col-span-2"
        >
          0
        </button>
        <button
          onClick={() => addDigit('.')}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          .
        </button>
        <button
          onClick={() => dispatch({ type: 'EVALUATE' })}
          className="h-16 rounded-xl text-lg font-medium border"
        >
          =
        </button>
      </div>
    </div>
  )
}
