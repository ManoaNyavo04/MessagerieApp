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

export interface UtilisateurDto {
  id_utilisateur: number,
  nom: string,
  prenom: string,
  matricule: string,
  mdp: string,
  id_role: number,
  role: string
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

export async function addUtilisateurService(utilisateur: UtilisateurDto, token: string) {
  try {
    const response = await fetch(`${ALL_USER_URL}/addUtilisateur`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(utilisateur),
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", error);
    throw error.message || "Erreur inconnue";
  }
}

export async function searchUser(token: string, searchTerm: string) {
  console.log("🔍 Token envoyé :", token); 
  const response = await fetch(`${ALL_USER_URL}/searchUser?searchTerm=${encodeURIComponent(searchTerm)}`, {
    method: "GET",
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

