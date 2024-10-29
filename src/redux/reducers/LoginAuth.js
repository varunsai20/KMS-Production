// redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  user: null,
  access_token: null,
  refresh_token: null,
  token_type: null,
  user_id: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload; // Store user details
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.token_type = action.payload.token_type;
      state.user_id = action.payload.user_id;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.token_type = null;
      state.user_id = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
  