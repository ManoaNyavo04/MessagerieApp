import { PIECE_JOINT_URL } from "../../URL/Url";

export async function envoyerPieceJointe(fichier: File, idMessage: number, token: string) {
  try {
    const formData = new FormData();
    formData.append("Fichier", fichier); // ✅ Doit s'appeler "Fichier"
    formData.append("IdMessage", idMessage.toString());
    formData.append("IdType", "1"); // Selon ton type

    const response = await fetch(`${PIECE_JOINT_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Pas de Content-Type ici, le navigateur le gère
      },
      body: formData,
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Erreur ${response.status}`);
    }

    return await response.json(); // { chemin: "nomfichier.ext" }
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la pièce jointe :", error);
    throw error.message || "Erreur inconnue";
  }
}

export async function downloadPieceJointe(id: any, token: string) {
  const response = await fetch(`${PIECE_JOINT_URL}/download/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Erreur lors du téléchargement");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  // Essaye de récupérer le nom du fichier depuis header
  const disposition = response.headers.get("Content-Disposition");
  let filename = "fichier";

  if (disposition && disposition.includes("filename=")) {
    filename = disposition.split("filename=")[1].replace(/"/g, "");
  }

  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}



