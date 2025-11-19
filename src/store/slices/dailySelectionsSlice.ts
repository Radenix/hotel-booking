import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type DailySelection = {
  hotelId?: number
  lunchId?: number
  dinnerId?: number
}

type DailySelectionsState = Record<string, DailySelection>

const initialState: DailySelectionsState = {}

const dailySelectionsSlice = createSlice({
  name: 'dailySelections',
  initialState,
  reducers: {
    updateHotel: (
      state,
      action: PayloadAction<{ date: string; hotelId?: number }>,
    ) => {
      const { date, hotelId } = action.payload
      if (!state[date]) {
        state[date] = {}
      }
      state[date].hotelId = hotelId
    },
    updateMeal: (
      state,
      action: PayloadAction<{
        date: string
        field: 'lunchId' | 'dinnerId'
        mealId?: number
      }>,
    ) => {
      const { date, field, mealId } = action.payload
      if (!state[date]) {
        state[date] = {}
      }
      if (!mealId) {
        delete state[date][field]
      } else {
        state[date][field] = mealId
      }
    },
    clearMeals: (state, action: PayloadAction<string[]>) => {
      const dates = action.payload
      dates.forEach((date) => {
        if (state[date]) {
          const { hotelId } = state[date]
          state[date] = hotelId ? { hotelId } : {}
        }
      })
    },
    syncWithDates: (state, action: PayloadAction<string[]>) => {
      const tripDates = action.payload
      const next: DailySelectionsState = {}

      tripDates.forEach((date) => {
        next[date] = state[date] ?? {}
      })

      return next
    },
  },
})

export const { updateHotel, updateMeal, clearMeals, syncWithDates } =
  dailySelectionsSlice.actions
export default dailySelectionsSlice.reducer


