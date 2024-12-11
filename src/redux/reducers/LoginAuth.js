import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  user: {
    user_id: null,
    role: null,
    name: null,
    email: null,
    department: null,
    organization_name: null,
    profile_picture_url: null,
  },
  access_token: null,
  refresh_token: null,
  token_type: null,
  iat: null,
  exp: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      const { user_id, role, name, email, department, organization_name, profile_picture_url } = action.payload;
      state.user = { user_id, role, name, email, department, organization_name, profile_picture_url };
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.token_type = action.payload.token_type;
      state.iat = action.payload.iat;
      state.exp = action.payload.exp;
    },
    updateTokens: (state, action) => {
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.iat = action.payload.iat;
      state.exp = action.payload.exp;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
      state.access_token = null;
      state.refresh_token = null;
      state.token_type = null;
      state.iat = null;
      state.exp = null;
    },
    updateProfilePicture: (state, action) => {
      state.user.profile_picture_url = action.payload;
      state.profileUpdated = !state.profileUpdated; 
    },
  },
});

export const { login, updateTokens, logout, updateProfilePicture } = authSlice.actions;
export default authSlice.reducer;
