import { ESPACE_TRAVAIL_URL } from "../../URL/Url";

export async function getEspacesByUtilisateurId(token: string) {
  const response = await fetch(`${ESPACE_TRAVAIL_URL}/getEspacesByUtilisateurId`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ ajout du token
        },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des espaces de travail");
  }

  return await response.json();
}
