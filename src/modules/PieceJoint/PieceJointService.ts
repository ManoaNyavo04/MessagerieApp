import { PIECE_JOINT_URL } from "../../URL/Url";

export async function envoyerPieceJointe(fichier: File, idMessage: number, token: string) {
  try {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("idMessage", idMessage.toString());

    const response = await fetch(`${PIECE_JOINT_URL}/envoyer-piece-jointe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ⚠️ Ne pas mettre 'Content-Type': multipart/form-data ici !
        // Le navigateur le gère automatiquement avec le bon boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Erreur ${response.status}`);
    }

    return await response.json(); // Ex: { chemin: "Uploads/PiecesJointes/..." }
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la pièce jointe :", error);
    throw error.message || "Erreur inconnue";
  }
}
