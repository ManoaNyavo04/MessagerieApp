import { ESPACE_TRAVAIL_URL } from "../../URL/Url";

export interface EspaceTravailDto {
  idUtilisateur: number,
  matricule: string,
  nom: string,
  prenom: string,
  idEspaceTravail: number,
  espaceTravail: string,
  idPole: number
}

export async function getEspacesUtilisateur(token: string) {
  const response = await fetch(`${ESPACE_TRAVAIL_URL}/getEspacesByUtilisateurId`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des espaces');
  }
  return await response.json();
}
