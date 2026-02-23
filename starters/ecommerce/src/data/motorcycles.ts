export interface Motorcycle {
  id: number
  name: string
  image: string
  description: string
  shortDescription: string
  price: number
  engineSize: number // in CCs
  type: 'scooter' | 'cruiser' | 'adventure' | 'sport' | 'supersport'
}

const motorcycles: Array<Motorcycle> = [
  {
    id: 1,
    name: 'Luna-C Urbanite',
    image: '/motorcycle-scooter.jpg',
    description:
      'The Luna-C Urbanite is the perfect city companion, combining style and practicality in a compact package. With its 125cc engine, it delivers excellent fuel efficiency while maintaining enough power for urban commuting. The comfortable seating position and lightweight frame make it easy to maneuver through city traffic, while the under-seat storage provides ample space for your daily essentials.',
    shortDescription:
      'A stylish and practical 125cc scooter perfect for urban commuting with excellent fuel efficiency.',
    price: 3000,
    engineSize: 125,
    type: 'scooter',
  },
]

export default motorcycles
