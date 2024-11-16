// In your deriveInsights slice or reducer
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    active: false,
  };
  
  export const deriveInsightsSlice = createSlice({
    name: "deriveInsights",
    initialState,
    reducers: {
      setDeriveInsights: (state, action) => {
        state.active = action.payload;
      },
    },
  });
  
  export const { setDeriveInsights } = deriveInsightsSlice.actions;
  export default deriveInsightsSlice.reducer;
  