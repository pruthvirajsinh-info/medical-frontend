import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null, // Should ideally be loaded from localStorage in a real app
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
    loadToken: (state) => {
      const token = localStorage.getItem("token");
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    },
  },
});

export const { setCredentials, logout, loadToken } = authSlice.actions;
export default authSlice.reducer;
