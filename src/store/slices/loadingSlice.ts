import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type LoadingState = {
  isLoading: boolean
  loadingMessage?: string
}

const initialState: LoadingState = {
  isLoading: false,
  loadingMessage: undefined,
}

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (
      state,
      action: PayloadAction<{ isLoading: boolean; message?: string }>,
    ) => {
      state.isLoading = action.payload.isLoading
      state.loadingMessage = action.payload.message
    },
  },
})

export const { setLoading } = loadingSlice.actions
export default loadingSlice.reducer

