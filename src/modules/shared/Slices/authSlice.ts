import React from 'react'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfilUtilisateur {
  id: number;
  nom: string;
  prenom: string;
  role: string;
}

interface AuthState {
  token: string | null;
  profilUtilisateur: ProfilUtilisateur | null;
}

const initialState: AuthState = {
  token: null,
  profilUtilisateur: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; profilUtilisateur: ProfilUtilisateur }>
    ) => {
      state.token = action.payload.token;
      state.profilUtilisateur = action.payload.profilUtilisateur;
    },
    logout: (state) => {
      state.token = null;
      state.profilUtilisateur = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;


// export default authSlice