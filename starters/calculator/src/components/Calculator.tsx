import { useReducer } from 'react'

interface State {
  display: string
  previousValue: string | null
  operation: string | null
  overwrite: boolean
}

type Action =
  | { type: 'ADD_DIGIT'; digit: string }
  | { type: 'CHOOSE_OPERATION'; operation: string }
  | { type: 'EVALUATE' }
  | { type: 'CLEAR' }
  | { type: 'DELETE_DIGIT' }
  | { type: 'PERCENT' }
  | { type: 'TOGGLE_SIGN' }

function evaluate(
  previousValue: string,
  currentValue: string,
  operation: string,
): string {
  const prev = parseFloat(previousValue)
  const current = parseFloat(currentValue)
  if (isNaN(prev) || isNaN(current)) return 'Error'

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
  return String(result)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_DIGIT': {
      if (state.display === 'Error') {
        return { ...state, display: action.digit, overwrite: false }
      }
      if (state.overwrite) {
        return { ...state, display: action.digit, overwrite: false }
      }
      if (action.digit === '.' && state.display.includes('.')) return state
      if (state.display === '0' && action.digit !== '.') {
        return { ...state, display: action.digit }
      }
      return { ...state, display: state.display + action.digit }
    }
    case 'CHOOSE_OPERATION': {
      if (state.display === 'Error') return state
      if (state.previousValue != null && !state.overwrite) {
        const result = evaluate(
          state.previousValue,
          state.display,
          state.operation!,
        )
        return {
          display: result,
          previousValue: result,
          operation: action.operation,
          overwrite: true,
        }
      }
      return {
        ...state,
        previousValue: state.display,
        operation: action.operation,
        overwrite: true,
      }
    }
    case 'EVALUATE': {
      if (
        state.previousValue == null ||
        state.operation == null ||
        state.overwrite
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
        overwrite: true,
      }
    }
    case 'CLEAR':
      return {
        display: '0',
        previousValue: null,
        operation: null,
        overwrite: false,
      }
    case 'DELETE_DIGIT': {
      if (state.display === 'Error') {
        return {
          display: '0',
          previousValue: null,
          operation: null,
          overwrite: false,
        }
      }
      if (state.overwrite) return { ...state, display: '0', overwrite: false }
      if (state.display.length === 1) return { ...state, display: '0' }
      return { ...state, display: state.display.slice(0, -1) }
    }
    case 'PERCENT': {
      if (state.display === 'Error') return state
      const val = parseFloat(state.display)
      if (isNaN(val)) return state
      return { ...state, display: String(val / 100), overwrite: true }
    }
    case 'TOGGLE_SIGN': {
      if (state.display === 'Error' || state.display === '0') return state
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
  overwrite: false,
}

export default function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addDigit = (digit: string) => dispatch({ type: 'ADD_DIGIT', digit })
  const chooseOperation = (operation: string) =>
    dispatch({ type: 'CHOOSE_OPERATION', operation })

  const formatDisplay = (value: string) => {
    if (value === 'Error') return value
    if (value.includes('.') && value.endsWith('.')) return value
    const num = parseFloat(value)
    if (isNaN(num)) return value
    if (value.includes('.')) {
      const [int, dec] = value.split('.')
      return parseFloat(int).toLocaleString('en-US') + '.' + dec
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 10 })
  }

  const isActive = (op: string) => state.operation === op && state.overwrite

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Display */}
      <div className="p-6 pb-4">
        <div className="text-right min-h-[24px] text-gray-400 text-sm mb-1">
          {state.previousValue != null && state.operation
            ? `${formatDisplay(state.previousValue)} ${state.operation}`
            : '\u00A0'}
        </div>
        <div className="text-right text-white text-5xl font-light tracking-tight overflow-hidden">
          {formatDisplay(state.display)}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-[1px] p-2 pt-0">
        {/* Row 1: C, +/-, %, / */}
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          className="h-16 rounded-xl text-lg font-medium bg-gray-500 hover:bg-gray-400 text-white transition-colors"
        >
          C
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIGN' })}
          className="h-16 rounded-xl text-lg font-medium bg-gray-500 hover:bg-gray-400 text-white transition-colors"
        >
          +/-
        </button>
        <button
          onClick={() => dispatch({ type: 'PERCENT' })}
          className="h-16 rounded-xl text-lg font-medium bg-gray-500 hover:bg-gray-400 text-white transition-colors"
        >
          %
        </button>
        <button
          onClick={() => chooseOperation('/')}
          className={`h-16 rounded-xl text-lg font-medium transition-colors ${
            isActive('/')
              ? 'bg-white text-orange-500 ring-2 ring-orange-400'
              : 'bg-orange-500 hover:bg-orange-400 text-white'
          }`}
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, * */}
        <button
          onClick={() => addDigit('7')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          7
        </button>
        <button
          onClick={() => addDigit('8')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          8
        </button>
        <button
          onClick={() => addDigit('9')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          9
        </button>
        <button
          onClick={() => chooseOperation('*')}
          className={`h-16 rounded-xl text-lg font-medium transition-colors ${
            isActive('*')
              ? 'bg-white text-orange-500 ring-2 ring-orange-400'
              : 'bg-orange-500 hover:bg-orange-400 text-white'
          }`}
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, - */}
        <button
          onClick={() => addDigit('4')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          4
        </button>
        <button
          onClick={() => addDigit('5')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          5
        </button>
        <button
          onClick={() => addDigit('6')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          6
        </button>
        <button
          onClick={() => chooseOperation('-')}
          className={`h-16 rounded-xl text-lg font-medium transition-colors ${
            isActive('-')
              ? 'bg-white text-orange-500 ring-2 ring-orange-400'
              : 'bg-orange-500 hover:bg-orange-400 text-white'
          }`}
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, + */}
        <button
          onClick={() => addDigit('1')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          1
        </button>
        <button
          onClick={() => addDigit('2')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          2
        </button>
        <button
          onClick={() => addDigit('3')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          3
        </button>
        <button
          onClick={() => chooseOperation('+')}
          className={`h-16 rounded-xl text-lg font-medium transition-colors ${
            isActive('+')
              ? 'bg-white text-orange-500 ring-2 ring-orange-400'
              : 'bg-orange-500 hover:bg-orange-400 text-white'
          }`}
        >
          +
        </button>

        {/* Row 5: 0 (span 2), ., = */}
        <button
          onClick={() => addDigit('0')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors col-span-2"
        >
          0
        </button>
        <button
          onClick={() => addDigit('.')}
          className="h-16 rounded-xl text-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          .
        </button>
        <button
          onClick={() => dispatch({ type: 'EVALUATE' })}
          className="h-16 rounded-xl text-lg font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors"
        >
          =
        </button>
      </div>
    </div>
  )
}
