import React from 'react'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EspaceTravail {
  idEspaceTravail: number;
  espaceTravail: string;
  idPole: number;
}

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
  espacesTravail: EspaceTravail[];
  idEspaceActif: number | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("token") || null,
  profilUtilisateur: localStorage.getItem("profilUtilisateur")
    ? JSON.parse(localStorage.getItem("profilUtilisateur") as string)
    : null,
  espacesTravail: localStorage.getItem("espacesTravail")
    ? JSON.parse(localStorage.getItem("espacesTravail") as string)
    : [],
  idEspaceActif: localStorage.getItem("idEspaceActif")
    ? Number(localStorage.getItem("idEspaceActif"))
    : null,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; profilUtilisateur: ProfilUtilisateur; espacesTravail: EspaceTravail[]; }>
    ) => {
      state.token = action.payload.token;
      state.profilUtilisateur = action.payload.profilUtilisateur;
      state.espacesTravail = action.payload.espacesTravail;
      state.idEspaceActif = action.payload.espacesTravail.length > 0
        ? action.payload.espacesTravail[0].idEspaceTravail
        : null;
      state.isAuthenticated = true;

      // 🔐 Sauvegarde localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("profilUtilisateur", JSON.stringify(action.payload.profilUtilisateur));
      localStorage.setItem("espacesTravail", JSON.stringify(action.payload.espacesTravail));
      if (state.idEspaceActif)
        localStorage.setItem("idEspaceActif", String(state.idEspaceActif));
    },
    setEspaceActif: (state, action: PayloadAction<number>) => {
      state.idEspaceActif = action.payload;
      localStorage.setItem("idEspaceActif", String(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.profilUtilisateur = null;
      state.espacesTravail = [];
      state.idEspaceActif = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
});

export const { loginSuccess, logout, setEspaceActif } = authSlice.actions;
export default authSlice.reducer;


// export default authSlice