import { esES } from "@mui/material/locale";
import { ALL_USER_URL, USER_DISCUSSION } from "../../URL/Url";

export interface UpdateMessageDTO {
  id_message: number;
  id_utilisateur: number;
  contenu: string;
}

export async function getMesDiscussions(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${USER_DISCUSSION}/getMesDiscussions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Erreur getMesDiscussions:", error);
    throw new Error("Impossible de charger les discussions");
  }
}

export async function getMessages(token: string, targetId: number, type: string) {
  const res = await fetch(`${USER_DISCUSSION}/messages?targetId=${targetId}&type=${type}`, {

    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // les backticks manquaient
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des messages");
  }

  return await res.json(); // retourne une liste de MessageModel
}

export async function serachMessages(token: string, targetId: number, type: string, content : string) {
  const res = await fetch(`${USER_DISCUSSION}/searchMessages?targetId=${targetId}&type=${type}&content=${content}`, {

    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // les backticks manquaient
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des messages");
  }

  return await res.json(); // retourne une liste de MessageModel
}

export async function getUnreadCounts(token: string) {
  const res = await fetch(`${USER_DISCUSSION}/messagesNonLus`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des messages");
  }

  return await res.json(); // retourne un dictionnaire { discussionId: count }
}

export async function markMessagesAsRead(token: string, discussionId: number, discussionType: string) {
  const res = await fetch(`${USER_DISCUSSION}/lireMessage?discussionId=${discussionId}&type=${discussionType}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour des messages comme lus");
  }
}

export async function demarrerDiscussion(token: string, userId: number, nom: string) {
  const response = await fetch(`${USER_DISCUSSION}/demarrerDiscussion`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: userId, nom })
  });

  if (!response.ok) {
    throw new Error("Erreur lors du démarrage de la discussion");
  }

  return response.json(); // Retourne l'objet DiscussionModel
}

export async function searchUserGroup(token: string, searchTerm: string) {
  const response = await fetch(`${USER_DISCUSSION}/searchUserGroup?searchTerm=${encodeURIComponent(searchTerm)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text(); // 🔹 lire le vrai message d’erreur
    console.error("❌ Erreur brute backend :", errorText); // debug complet
    throw new Error(`Erreur HTTP ${response.status} : ${errorText}`);
  }

  return response.json();
}

export async function modifierMessage(UpdateMessageDTO: UpdateMessageDTO, token: string) {
  const res = await fetch(`${USER_DISCUSSION}/modifier-message/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      id_message: UpdateMessageDTO.id_message,
      IdUtilisateur: UpdateMessageDTO.id_utilisateur,
      NouveauContenu: UpdateMessageDTO.contenu
    })


  });

  if (!res.ok) {
    throw new Error("Erreur API update");
  }

  return res.json();
}

export async function deleteMessage(id_message: number, token: string) {
  const res = await fetch(`${USER_DISCUSSION}/delete-message/${id_message}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Erreur API delete");
  }

  return res.text(); // ton API retourne un string
}






