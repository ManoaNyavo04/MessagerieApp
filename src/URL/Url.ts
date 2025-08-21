export const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5032";

export const LOGIN_URL = `${baseUrl}/api/Utilisateur`;
export const ALL_USER_URL = `${baseUrl}/api/Utilisateur`;
export const USER_DISCUSSION = `${baseUrl}/api/Message`;
export const ROLE_URL = `${baseUrl}/api/Role`;