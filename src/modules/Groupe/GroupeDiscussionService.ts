import { GRP_DISCU_URL } from "../../URL/Url";

export interface GroupeDiscussionDto {
  nom: string,
  description: string,
  utilisateurs: number[]
}

export async function createGroupDiscu(token: string, groupe: GroupeDiscussionDto) {
  const response = await fetch(`${GRP_DISCU_URL}/creerGroupe`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(groupe)
  });

  if (!response.ok) {
    throw new Error("Erreur lors du démarrage de la discussion");
  }

  return response.json(); // Retourne l'objet DiscussionModel
}

export async function getMembre(token: string, idGroupe: number) {
  const response = await fetch(`${GRP_DISCU_URL}/getMembresGroupeDiscussion?idGroupeDiscussion=${idGroupe}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la recherche d'utilisateur");
  }

  return response.json();
}

export async function ajouterNouveauMembre(token: string, idGroupe: number, groupe: GroupeDiscussionDto) {
  const response = await fetch(`${GRP_DISCU_URL}/ajouterNouveauMembre?idGroupe=${idGroupe}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(groupe)
  });

  if (!response.ok) {
    throw new Error("Erreur lors du démarrage de la discussion");
  }

  return response.json(); // Retourne l'objet DiscussionModel
}
