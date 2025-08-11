import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { RubanFermer } from '../shared/components/RubanFermer'
import { BoxModalStyle } from '../../configs/style'
import { Add, Cancel } from '@mui/icons-material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { getAllRolesService, Role } from '../Role/RoleService'
import { addUtilisateurService, Utilisateur, UtilisateurDto } from './UtilisateurService'

interface FormUtilisateurProps {
  open: boolean;
  onClose: () => void;
  utilisateur?: Utilisateur | null; // ✅ Utilisateur à modifier, si présent
  onUpdated?: () => void; // pour rafraîchir la liste après modification
}

const FormUtilisateur = ({ open, onClose, utilisateur, onUpdated }: FormUtilisateurProps) => {
  const [pending, setPending] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matricule, setMatricule] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé.");
      return;

    }
    if (utilisateur) {
      setNom(utilisateur.nom);
      setPrenom(utilisateur.prenom);
      setMatricule(utilisateur.matricule);
      setSelectedRole(utilisateur.id_role);
    } else {
      setNom("");
      setPrenom("");
      setMatricule("");
      setSelectedRole(null);
    }

    getAllRolesService(token)
      .then(data => {
        setRoles(data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des rôles :", error);
      });
  }, [utilisateur]);

  const onsubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRole) {
      alert("Veuillez choisir un rôle.");
      return;
    }

    if (!token) {
      console.error("Aucun token trouvé.");
      return;
    }

    const utilisateurData: UtilisateurDto = {
      id_utilisateur: 0,
      nom,
      prenom,
      matricule,
      mdp: "",
      id_role: selectedRole,
      role: "",
    };
    setPending(true);

    try {
      const response = await addUtilisateurService(utilisateurData, token);
      console.log("✅ Utilisateur ajouté :", response);
      alert("Utilisateur ajouté avec succès.");
      onClose();
    } catch (error: any) {
      alert("Erreur : " + error);
    } finally {
      setPending(false);
    }

    setTimeout(() => {
      setPending(false);
      onClose(); // Fermer le modal après enregistrement
    }, 1000);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="myModal"
    >
      <Box sx={BoxModalStyle}>
        <RubanFermer handleClose={onClose} />
        <Box p={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <h3 style={{ fontFamily: 'Rubik', fontSize: 20 }}>
                Ajout utilisateur
              </h3>
            </Grid>
            <Box sx={{ m: 1 }}>
              <form onSubmit={onsubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Nom" type='text' value={nom} onChange={(e) => setNom(e.target.value)} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Prénom" type='text' value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Matricule" type='text' value={matricule} onChange={(e) => setMatricule(e.target.value)} />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel id="role-label">Rôle</InputLabel>
                      <Select
                        labelId="role-label"
                        value={selectedRole ?? ""}
                        label="Rôle"
                        onChange={(e) => setSelectedRole(Number(e.target.value))}
                      >

                        {roles.map((r) => (
                          <MenuItem key={r.id_role} value={r.id_role}>
                            {r.role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                </Grid>
                <Grid container spacing={2} mt={2}>
                  <Grid item xs={8}>
                    <Button
                      variant="outlined"
                      size="large"
                      color="error"
                      type="reset"
                      sx={{ ml: 1, textTransform: 'capitalize', fontFamily: 'Russo one' }}
                      startIcon={<Cancel />}
                      style={{ marginRight: 20 }}
                      disabled={pending}
                      onClick={onClose}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      color="primary"
                      type="submit"
                      sx={{ ml: 1, textTransform: 'capitalize', fontFamily: 'Russo one' }}
                      startIcon={<FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: "15px" }} />}
                      disabled={pending}
                    >
                      Valider
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
            <Grid item xs={12} md={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                {pending && <span>Enregistrement en cours...</span>}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

export default FormUtilisateur;



