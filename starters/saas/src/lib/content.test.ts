import { describe, expect, it } from 'vitest'
import { getPlan } from './content'

describe('plan search parameters', () => {
  it('retains valid plan selections', () => {
    expect(getPlan('pro').name).toBe('Pro')
    expect(getPlan('enterprise').name).toBe('Enterprise')
  })
  it.each([undefined, null, 'unknown', ['pro'], { id: 'pro' }])(
    'defaults invalid input %j to Starter',
    (value) => {
      expect(getPlan(value).id).toBe('starter')
    },
  )
})
