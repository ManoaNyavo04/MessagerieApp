import React, { useEffect, useState } from 'react'
import { getMesDiscussions } from './MesDiscussion';
import { List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';

interface Discussion {
  id: number;
  nom: string;
  type: string;
}

interface ListeDiscussionsProps {
  token: string;
  onSelectDiscussion: (discussion: Discussion) => void;
}

const ListeDiscussion: React.FC<ListeDiscussionsProps> = ({ token, onSelectDiscussion }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    async function fetchDiscussions() {
      try {
        const data = await getMesDiscussions(token);
        setDiscussions(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des discussions :", err);
      }
    }
    fetchDiscussions();
  }, [token]);

  return (
    <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>Mes Discussions</Typography>
      <List>
        {discussions.map((discussion) => (
          <ListItem key={`${discussion.type}-${discussion.id}`} disablePadding>
            <ListItemButton onClick={() => onSelectDiscussion(discussion)}>
              <ListItemText sx={{ color: 'black' }} primary={discussion.nom} secondary={discussion.type} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default ListeDiscussion