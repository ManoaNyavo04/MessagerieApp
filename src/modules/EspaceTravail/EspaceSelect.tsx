import React, { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { changerEspace, getEspacesByUtilisateurId } from "./EspaceTravailService";
import { useAppDispatch } from "../shared/hooks/redux-hooks";
import { setAuthData } from "../shared/Slices/authSlice";

interface Espace {
  idEspaceTravail: number;
  espaceTravail: string;
}

interface EspaceSelectProps {
  token: string;
  onEspaceChange: (espace: Espace) => void;
  // setToken: (newToken: string) => void; // 🔥 ajoute ce prop pour maj le token global
}

const EspaceSelect: React.FC<EspaceSelectProps> = ({ token, onEspaceChange}) => {
  const [espaces, setEspaces] = useState<Espace[]>([]);
  const [selectedEspace, setSelectedEspace] = useState<number | "">("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEspaces() {
      try {
        const data = await getEspacesByUtilisateurId(token);
        setEspaces(data);
      } catch (error) {
        console.error("Erreur chargement espaces:", error);
      }
    }
    fetchEspaces();
  }, [token]);

  const handleChange = async (event: SelectChangeEvent<number | "">) => {
    const id = Number(event.target.value);
    setSelectedEspace(id);

    const espace = espaces.find(e => e.idEspaceTravail === id);
    if (espace) {
      onEspaceChange(espace);

      try {
        // 🔹 Appel de ton API pour générer le nouveau token
        const result = await changerEspace(token, id);

        // 🔹 Mise à jour du store Redux et du localStorage
        dispatch(setAuthData({
          token: result.token,
          profilUtilisateur: result.profilUtilisateur
        }));

        // 🔹 Redirection automatique vers /messagerie
        navigate("/messagerie");
      } catch (error) {
        console.error("Erreur changement espace :", error);
      }
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="espace-select-label">Espace de travail</InputLabel>
        <Select
          labelId="espace-select-label"
          value={selectedEspace}
          label="Espace de travail"
          onChange={handleChange}
        >
          {espaces.map((espace) => (
            <MenuItem key={espace.idEspaceTravail} value={espace.idEspaceTravail}>
              {espace.espaceTravail}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default EspaceSelect;
