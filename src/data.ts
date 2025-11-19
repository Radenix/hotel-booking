export type Country = {
  id: number
  name: string
}

export type Hotel = {
  id: number
  name: string
  price: number
}

export type BoardType = {
  code: 'FB' | 'HB' | 'NB'
  name: string
  description: string
}

export type Meal = {
  id: number
  name: string
  price: number
}

export const countries: Country[] = [
  { id: 1, name: 'Turkey' },
  { id: 2, name: 'UAE' },
  { id: 3, name: 'Italy' },
]

export const hotelsByCountry: Record<string, Hotel[]> = {
  Turkey: [
    { id: 101, name: 'Hilton Istanbul', price: 120 },
    { id: 102, name: 'Titanic Antalya', price: 90 },
  ],
  UAE: [
    { id: 201, name: 'Dubai Marina Hotel', price: 200 },
    { id: 202, name: 'Palm Jumeirah Resort', price: 300 },
  ],
  Italy: [{ id: 301, name: 'Rome Center Hotel', price: 150 }],
}

export const boardTypes: BoardType[] = [
  {
    code: 'FB',
    name: 'Full Board',
    description: 'Breakfast, lunch & dinner included',
  },
  {
    code: 'HB',
    name: 'Half Board',
    description: 'Breakfast & one additional meal',
  },
  {
    code: 'NB',
    name: 'No Board',
    description: 'No meals included',
  },
]

export const mealsByCountry: Record<
  string,
  { lunch: Meal[]; dinner: Meal[] }
> = {
  Turkey: {
    dinner: [
      { id: 1, name: 'Turkish Kebab', price: 15 },
      { id: 2, name: 'Istanbul Fish Plate', price: 18 },
      { id: 3, name: 'Traditional Meat Stew', price: 20 },
    ],
    lunch: [
      { id: 4, name: 'Chicken Pilaf', price: 10 },
      { id: 5, name: 'Lentil Soup Set', price: 8 },
      { id: 6, name: 'Veggie Plate', price: 9 },
    ],
  },
  UAE: {
    dinner: [
      { id: 7, name: 'Arabic Mixed Grill', price: 25 },
      { id: 8, name: 'Dubai Seafood Dinner', price: 30 },
    ],
    lunch: [
      { id: 9, name: 'Shawarma Plate', price: 12 },
      { id: 10, name: 'Hummus & Falafel Set', price: 11 },
    ],
  },
  Italy: {
    dinner: [
      { id: 11, name: 'Pasta Carbonara', price: 20 },
      { id: 12, name: 'Italian Seafood Dinner', price: 28 },
    ],
    lunch: [
      { id: 13, name: 'Pizza Margherita', price: 12 },
      { id: 14, name: 'Lasagna Lunch Set', price: 14 },
    ],
  },
}


