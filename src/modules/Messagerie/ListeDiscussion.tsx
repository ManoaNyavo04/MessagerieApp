import React, { useEffect, useState } from 'react'
import { getMesDiscussions, getUnreadCounts, markMessagesAsRead } from './MesDiscussion';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchUser } from '../Utilisateur/UtilisateurService';
import { useSignalR } from '../../contexts/SignalRContext';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Tooltip from '@mui/material/Tooltip';
import CreerGroupeModal from '../Groupe/CreerGroupeModal';


interface Discussion {
  id: number;
  nom: string;
  type: string;
}

interface ListeDiscussionsProps {
  token: string;
  onSelectDiscussion: (discussion: Discussion) => void;
  currentDiscussion: Discussion | null;
}

const ListeDiscussion: React.FC<ListeDiscussionsProps> = ({ token, onSelectDiscussion, currentDiscussion }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: number]: number }>({});
  const [openModal, setOpenModal] = useState(false);


  const connection = useSignalR();

  // --- 1. Charger les discussions et les messages non lus au départ
  useEffect(() => {
    async function fetchDiscussionsAndUnread() {
      try {
        // 1️⃣ Récupérer la liste des discussions
        const data = await getMesDiscussions(token);
        setDiscussions(data);

        // 2️⃣ Récupérer le compteur de messages non lus
        const counts = await getUnreadCounts(token);
        console.log("Messages non lus :", counts);
        setUnreadCounts(counts);  // Commenté pour l'instant
      } catch (err) {
        console.error("Erreur lors de la récupération des discussions ou messages non lus :", err);
      }
    }

    fetchDiscussionsAndUnread();
  }, [token]);

  // --- 2. Rechercher des utilisateurs
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    async function fetchSearchResults() {
      try {
        const results = await searchUser(token, searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error("Erreur recherche utilisateur :", err);
      }
    }

    fetchSearchResults();
  }, [searchTerm, token]);


  useEffect(() => {
    if (!connection) return;

    const handleUpdateCounts = (counts: { [key: number]: number }) => {
      setUnreadCounts(counts); // 🔁 Met à jour immédiatement
    };

    connection.on("UpdateUnreadCounts", handleUpdateCounts);

    return () => {
      connection.off("UpdateUnreadCounts", handleUpdateCounts);
    };
  }, [connection]);


  // --- 4. Quand on clique sur une discussion, on reset le compteur
  const handleSelectDiscussion = async (discussion: Discussion) => {
    try {
      // 1️⃣ Marquer les messages comme lus sur le backend
      await markMessagesAsRead(token, discussion.id);

      // 2️⃣ Réinitialiser le compteur local
      setUnreadCounts(prev => ({
        ...prev,
        [discussion.id]: 0
      }));

      // 3️⃣ Déclencher la sélection dans le parent
      onSelectDiscussion(discussion);
    } catch (err) {
      console.error("Erreur lors de la lecture des messages :", err);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>Mes Discussions</Typography>
        <Tooltip title="Créer une discussion de groupe">
          <IconButton onClick={() => setOpenModal(true)}>
            <GroupAddIcon />
          </IconButton>
        </Tooltip>
      </Box>


      {/* Barre de recherche */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Rechercher par nom, prénom, matricule..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Liste des discussions */}
      <List>
        {(searchResults.length > 0 ? searchResults : discussions).map(item => {
          const discussion = discussions.find(d => d.id === item.id) || {
            id: item.id_utilisateur || item.id,
            nom: item.nom + (item.prenom ? ' ' + item.prenom : ''),
            type: item.type || 'prive'
          };

          return (
            <ListItem key={discussion.id} disablePadding>
              <ListItemButton onClick={() => handleSelectDiscussion(discussion)}>
                <ListItemText
                  primaryTypographyProps={{ sx: { color: "black" } }}
                  primary={discussion.nom}
                />
                {unreadCounts[discussion.id] > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      px: 1,
                      fontSize: '0.8rem',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}
                  >
                    {unreadCounts[discussion.id]}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <CreerGroupeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        token={token}
        onGroupCreated={async () => {
          const updated = await getMesDiscussions(token);
          setDiscussions(updated);
        }}
      />

    </Paper>
  );
};

export default ListeDiscussion;
