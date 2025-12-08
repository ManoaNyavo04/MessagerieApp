export const PROD = false;

export const baseUrl = PROD ? "http://10.5.100.7:5040" : "http://localhost:5032";

export const LOGIN_URL = `${baseUrl}/api/Utilisateur`;
export const ALL_USER_URL = `${baseUrl}/api/Utilisateur`;
export const USER_DISCUSSION = `${baseUrl}/api/Message`;
export const ROLE_URL = `${baseUrl}/api/Role`;
export const GRP_DISCU_URL = `${baseUrl}/api/GroupeDiscussion`;
export const PIECE_JOINT_URL = `${baseUrl}/api/PieceJoint`;
export const ESPACE_TRAVAIL_URL = `${baseUrl}/api/EspaceTravail`;
export const POLE_URL = `${baseUrl}/api/Pole`;
