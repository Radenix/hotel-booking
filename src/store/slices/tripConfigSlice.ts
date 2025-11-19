import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { countries, type BoardType } from '../../data'

type BoardCode = BoardType['code']

export type TripConfig = {
  citizenship: string
  startDate: string
  days: number
  destination: string
  boardType: BoardCode
}

const todayIso = new Date().toISOString().split('T')[0]

const initialState: TripConfig = {
  citizenship: '',
  startDate: todayIso,
  days: 3,
  destination: countries[0]?.name ?? '',
  boardType: 'FB',
}

const tripConfigSlice = createSlice({
  name: 'tripConfig',
  initialState,
  reducers: {
    updateConfig: (
      state,
      action: PayloadAction<{
        key: keyof TripConfig
        value: string | number | BoardCode
      }>,
    ) => {
      const { key, value } = action.payload
      if (key === 'days') {
        state[key] = Number(value) as number
      } else {
        state[key] = value as TripConfig[typeof key]
      }
    },
    updateBoardType: (state, action: PayloadAction<BoardCode>) => {
      state.boardType = action.payload
    },
  },
})

export const { updateConfig, updateBoardType } = tripConfigSlice.actions
export default tripConfigSlice.reducer

