import { configureStore } from '@reduxjs/toolkit'
import tripConfigReducer from './slices/tripConfigSlice'
import dailySelectionsReducer from './slices/dailySelectionsSlice'
import loadingReducer from './slices/loadingSlice'

export const store = configureStore({
  reducer: {
    tripConfig: tripConfigReducer,
    dailySelections: dailySelectionsReducer,
    loading: loadingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

