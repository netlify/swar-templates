import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const getWeatherToolDef = toolDefinition({
  name: 'getWeather',
  description:
    'Generate simulated weather for a city, not live data. Returns Celsius temperature, condition, and humidity.',
  inputSchema: z.object({
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .describe('The city to simulate weather for'),
  }),
  outputSchema: z.object({
    city: z.string(),
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number(),
  }),
})

export const getWeather = getWeatherToolDef.server(({ city }) => {
  const conditions = [
    'sunny',
    'cloudy',
    'rainy',
    'partly cloudy',
    'windy',
  ] as const
  return {
    city,
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: conditions[Math.floor(Math.random() * conditions.length)]!,
    humidity: Math.floor(Math.random() * 50) + 30,
  }
})
