import React, { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getEspacesByUtilisateurId } from "./EspaceTravailService";

interface Espace {
    idEspaceTravail: number;
    espaceTravail: string;
}

interface EspaceSelectProps {
    token: string;
    onEspaceChange: (espace: Espace) => void;
}

const EspaceSelect: React.FC<EspaceSelectProps> = ({ token, onEspaceChange }) => {
    const [espaces, setEspaces] = useState<Espace[]>([]);
    const [selectedEspace, setSelectedEspace] = useState<number | "">("");

    useEffect(() => {
        async function fetchEspaces() {
            try {
                const data = await getEspacesByUtilisateurId(token);
                setEspaces(data);

                // ✅ Si l'utilisateur n'a qu'un seul espace → sélection automatique
                if (data.length === 1) {
                    setSelectedEspace(data[0].idEspaceTravail);
                    onEspaceChange(data[0]);
                }
            } catch (error) {
                console.error("Erreur chargement espaces:", error);
            }
        }

        fetchEspaces();
    }, [token]);

    const handleChange = (event: SelectChangeEvent<number | "">) => {
        const id = Number(event.target.value);
        setSelectedEspace(id);

        const espace = espaces.find(e => e.idEspaceTravail === id);
        if (espace) onEspaceChange(espace);
    };

    return (
  <Box sx={{ mb: 2 }}>
    <FormControl fullWidth size="small" sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}>
      <InputLabel
        id="espace-select-label"
        sx={{
          fontWeight: "bold",
          color: "text.primary",
        }}
      >
        Espace de travail
      </InputLabel>

      <Select
        labelId="espace-select-label"
        value={selectedEspace}
        label="Espace de travail"
        onChange={handleChange}
        sx={{
          fontWeight: "bold", // police en gras
          bgcolor: "transparent", // pas de fond
          "& .MuiSelect-select": {
            paddingY: 1,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none", // toujours sans bordure au survol
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 2,
              "& .MuiMenuItem-root": {
                fontWeight: "bold",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.08)", // couleur du hover
                },
              },
            },
          },
        }}
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
