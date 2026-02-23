import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

// Tool definition for getting weather
export const getWeatherToolDef = toolDefinition({
  name: 'getWeather',
  description:
    'Get the current weather for a city. Returns temperature, condition, and humidity.',
  inputSchema: z.object({
    city: z.string().describe('The city to get weather for'),
  }),
  outputSchema: z.object({
    city: z.string(),
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number(),
  }),
})

// Server implementation - mock weather data
export const getWeather = getWeatherToolDef.server(({ city }) => {
  // Mock weather data - in a real app, call a weather API
  const conditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'windy']
  return {
    city,
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.floor(Math.random() * 50) + 30,
  }
})
