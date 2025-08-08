import React from 'react'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfilUtilisateur {
  id_utilisateur: any;
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  id_role: number;
  role: number;
}

interface AuthState {
  token: string | null;
  profilUtilisateur: ProfilUtilisateur | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("token") || null,
  profilUtilisateur: localStorage.getItem("profilUtilisateur")
    ? JSON.parse(localStorage.getItem("profilUtilisateur") as string)
    : null,
  isAuthenticated: !!localStorage.getItem('token'),
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
      state.isAuthenticated = true; 
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