import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)

if (typeof window !== 'undefined') {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
}
