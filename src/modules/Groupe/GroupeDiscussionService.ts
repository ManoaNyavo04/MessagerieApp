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
