import React, { useEffect, useState } from 'react'
import { getMesDiscussions, getUnreadCounts, markMessagesAsRead, searchUserGroup } from './MesDiscussion';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { searchUser } from '../Utilisateur/UtilisateurService';
import { useSignalR } from '../../contexts/SignalRContext';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Tooltip from '@mui/material/Tooltip';
import CreerGroupeModal from '../Groupe/CreerGroupeModal';
import PersonIcon from '@mui/icons-material/Person';
import EspaceSelect from '../EspaceTravail/EspaceSelect';


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
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [openModal, setOpenModal] = useState(false);
  const [espaceActif, setEspaceActif] = useState<any | null>(null);



  const connection = useSignalR();

  const getKey = (id: number, type: string) => `${type}-${id}`;

  // --- 1. Charger les discussions et les messages non lus au départ
  useEffect(() => {
    async function fetchDiscussionsAndUnread() {
      try {
        // 1️⃣ Récupérer la liste des discussions
        const data = await getMesDiscussions(token);
        setDiscussions(data);

        const counts = await getUnreadCounts(token);

        // Remplir le dictionnaire avec clé `${type}-${id}`
        const formattedCounts: { [key: string]: number } = {};
        counts.forEach((item: { id: number; type: string; count: number }) => {
          formattedCounts[`${item.type}-${item.id}`] = item.count;
        });

        setUnreadCounts(formattedCounts);
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
        // const results = await searchUser(token, searchTerm);
        const results = await searchUserGroup(token, searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error("Erreur recherche utilisateur :", err);
      }
    }

    fetchSearchResults();
  }, [searchTerm, token]);


  useEffect(() => {
    if (!connection) return;

    const handleUpdateCounts = (counts: { id: number, type: string, count: number }[]) => {
      const newCounts: { [key: string]: number } = {};
      counts.forEach(({ id, type, count }) => {
        newCounts[`${type}-${id}`] = count;
      });

      setUnreadCounts(newCounts);
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
      await markMessagesAsRead(token, discussion.id, discussion.type);
      console.log("Messages marqués comme lus pour", discussion);

      const counts = await getUnreadCounts(token);

      // Remplir le dictionnaire avec clé `${type}-${id}`
      const formattedCounts: { [key: string]: number } = {};
      counts.forEach((item: { id: number; type: string; count: number }) => {
        formattedCounts[`${item.type}-${item.id}`] = item.count;
      });

      // setUnreadCounts(formattedCounts);

      // 2️⃣ Réinitialiser le compteur local
      setUnreadCounts(prev => ({
        ...prev,
        [`${discussion.type}-${discussion.id}`]: 0
      }));


      // 3️⃣ Déclencher la sélection dans le parent
      onSelectDiscussion(discussion);
    } catch (err) {
      console.error("Erreur lors de la lecture des messages :", err);
    }
  };

  return (
  <Paper
    sx={{
      p: 2,
      height: "80vh",
      overflowY: "auto",
      background: "linear-gradient(180deg, #1c13131a 0%, #FFFFFF 100%)",
      borderRadius: 3,
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    }}
  >
    {/* --- Header --- */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "#060a12", // texte du titre
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "#060a12" }} />
        Mes Discussions
      </Typography>

      <Tooltip title="Créer une discussion de groupe">
        <IconButton
          onClick={() => setOpenModal(true)}
          sx={{
            color: "#060a12",
            transition: "0.3s",
            "&:hover": {
              backgroundColor: "rgba(6,10,18,0.1)",
              transform: "scale(1.1)",
            },
          }}
        >
          <GroupAddIcon />
        </IconButton>
      </Tooltip>
    </Box>

    {/* --- Barre de recherche --- */}
    <Box sx={{ display: "flex", mb: 2 }}>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        placeholder="Rechercher par nom, prénom, matricule..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <IconButton sx={{ color: "#060a12" }}>
        <SearchIcon />
      </IconButton>
    </Box>

    {/* --- Liste des discussions --- */}
    <List>
      {/* Résultats de recherche */}
      {searchResults.length > 0 &&
        searchResults.map((result) => {
          const id = `${result.type}-${result.id}`;
          const discussion = {
            id: result.id,
            nom: result.nom,
            type: result.type === "utilisateur" ? "prive" : "groupe",
          };

          return (
            <ListItem key={id} disablePadding>
              <ListItemButton
                onClick={() => handleSelectDiscussion(discussion)}
                sx={{
                  "&:hover": { backgroundColor: "rgba(6,10,18,0.05)" },
                }}
              >
                <ListItemText
                  primaryTypographyProps={{ sx: { color: "#060a12" } }}
                  primary={discussion.nom}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

      {/* Discussions normales */}
      {searchResults.length === 0 &&
        discussions.map((discussion) => {
          const id = `discussion-${discussion.id}`;
          const unread = unreadCounts[`${discussion.type}-${discussion.id}`] || 0;

          return (
            <ListItem key={id} disablePadding>
              <ListItemButton
                onClick={() => handleSelectDiscussion(discussion)}
                sx={{
                  "&:hover": { backgroundColor: "rgba(6,10,18,0.05)" },
                }}
              >
                <ListItemText
                  primaryTypographyProps={{ sx: { color: "#060a12" } }}
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {discussion.type === "groupe" ? (
                        <GroupAddIcon fontSize="small" sx={{ color: "#1d2f54" }} />
                      ) : (
                        
                        <PersonIcon fontSize="small" sx={{ color: "#060a12" }} />
                      )}
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: unread > 0 ? "bold" : "normal",
                          color: "#060a12",
                        }}
                      >
                        {discussion.nom}
                      </Typography>
                    </Box>
                  }
                />

                {unread > 0 && (
                  <Box
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      px: 1,
                      fontSize: "0.8rem",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {unread}
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
