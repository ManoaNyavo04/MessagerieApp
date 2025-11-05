import { ESPACE_TRAVAIL_URL } from "../../URL/Url";

export interface EspaceTravail {
  id_espace_travail: number;
  nom: string;
}

export interface UtilisateurEspaceTravail {
  id_utilisateur: number;
  id_espace_travail: number;
}

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

export async function changerEspace(token: string, nouvelEspace: number) {
  const response = await fetch(`${ESPACE_TRAVAIL_URL}/changerEspace`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(nouvelEspace),
  });

  if (!response.ok) {
    throw new Error("Erreur lors du changement d’espace de travail");
  }

  return await response.json(); // contient { token, profilUtilisateur }
}

export async function getAllEspaceTravailService(token: string) {
  const response = await fetch(`${ESPACE_TRAVAIL_URL}/getAllEspaceTravail`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) throw new Error("Erreur de chargement des espaces");
  return await response.json();
}

export async function affecterUtilisateurService(token: string, data: UtilisateurEspaceTravail) {
  const response = await fetch(`${ESPACE_TRAVAIL_URL}/affecterUtilisateurVersEspaceTravail`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Erreur d'affectation");
  }
  return await response.json();
}
