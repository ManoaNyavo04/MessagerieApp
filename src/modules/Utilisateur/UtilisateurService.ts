import { ALL_USER_URL } from "../../URL/Url";

// Interface représentant un utilisateur
export interface Utilisateur {
  id_utilisateur: number;
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  id_role: number;
}

type ApiUtilisateur = Omit<Utilisateur, 'id'> & { id_utilisateur: number };

// Fonction pour récupérer tous les utilisateurs
export async function getAllUtilisateursService(token: string): Promise<Utilisateur[]> {
  try {
    const response = await fetch(`${ALL_USER_URL}/allUsers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ ajout du token
      },
      
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Erreur ${response.status}`);
    }

    const utilisateurs: Utilisateur[] = await response.json();

    
    return utilisateurs;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    throw new Error(error.message || "Erreur de récupération des utilisateurs.");
  }
}


export async function getUtilisateur(id: number, token: string) {
  const res = await fetch(`http://localhost:5000/api/utilisateur/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return await res.json();
}
