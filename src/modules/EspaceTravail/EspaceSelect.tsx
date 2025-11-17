
import { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../shared/hooks/redux-hooks";
import { jwtDecode } from "jwt-decode";
import { changerEspace, getEspacesByUtilisateurId } from "./EspaceTravailService";
import { setAuthData } from "../shared/Slices/authSlice";

interface Espace {
  idEspaceTravail: number;
  espaceTravail: string;
}

interface TokenPayload {
  EspaceActifId: string;
  EspaceActifNom: string;

}

interface EspaceSelectProps {
  token: string;
  onEspaceChange: (espace: Espace) => void;
}

const EspaceSelect: React.FC<EspaceSelectProps> = ({ token, onEspaceChange }) => {
  const [espaces, setEspaces] = useState<Espace[]>([]);
  const [selectedEspace, setSelectedEspace] = useState<number | "">("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ✅ Décoder le token pour récupérer l'espace actif
  useEffect(() => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);

      if (decoded?.EspaceActifId) {
        setSelectedEspace(Number(decoded.EspaceActifId)); // Préselectionne l’espace actif
      }
    } catch (err) {
      console.error("Erreur de décodage du token :", err);
    }
  }, [token]);

  // ✅ Charger la liste des espaces de l’utilisateur
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

  // ✅ Gérer le changement d’espace
  const handleChange = async (event: SelectChangeEvent<number | "">) => {
    const id = Number(event.target.value);
    setSelectedEspace(id);

    const espace = espaces.find(e => e.idEspaceTravail === id);
    if (espace) {
      onEspaceChange(espace);

      try {
        const result = await changerEspace(token, id);
        dispatch(
          setAuthData({
            token: result.token,
            profilUtilisateur: result.profilUtilisateur,
          })
        );
        navigate("/messagerie");
      } catch (error) {
        console.error("Erreur changement espace :", error);
      }
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl
        size="small"
        variant="standard"
        sx={{
          minWidth: 300,
          '& .MuiInputBase-root': {
            borderRadius: 2,
            px: 2,
            py: 1,
            transition: 'background-color 0.3s ease',
            fontWeight: 'bold',
            color: 'black',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.15)',
              color: 'black',
            },
            '&:before, &:after': { display: 'none' },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#1976d2',
            fontSize: '1rem',
            transform: 'translate(14px, 6px) scale(1)',
          },
        }}
      >
        {/* <InputLabel id="espace-select-label">Espace de travail</InputLabel> */}
        <Select
          labelId="espace-select-label"
          value={selectedEspace}
          onChange={handleChange}
          disableUnderline
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#cad2da',
            },
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.15)',
            },
          }}
        >
          {espaces.map((espace) => (
            <MenuItem
              key={espace.idEspaceTravail}
              value={espace.idEspaceTravail}
              sx={{
                fontWeight: selectedEspace === espace.idEspaceTravail ? 'bold' : 'normal',
                color: 'black',
                backgroundColor:
                  selectedEspace === espace.idEspaceTravail
                    ? 'rgba(33, 150, 243, 0.08)'
                    : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.15)',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              {espace.espaceTravail}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default EspaceSelect;
