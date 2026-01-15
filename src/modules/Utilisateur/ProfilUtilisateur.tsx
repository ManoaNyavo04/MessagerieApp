import { useEffect, useState } from "react";
import { Avatar, Box, Paper, Typography, Divider } from "@mui/material";

interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  email?: string;
  id_role?: number;
  role?: string;
}

const getAvatarUrl = (code?: string) =>
  code
    ? `https://10.5.100.7:8888/api/Dossier/profil/${code}`
    : "/avatar-default.png";

export default function ProfilUtilisateur() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("profilUtilisateur");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) return <p>Chargement…</p>;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar
          src={getAvatarUrl(user.matricule)}
          sx={{ width: 80, height: 80 }}
        />

        <Box>
          <Typography variant="h6">
            {user.prenom} {user.nom}
          </Typography>
          <Typography>Matricule : {user.matricule}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* <Typography>Role : {user.role}</Typography> */}
    </Paper>
  );
}


