@echo off

set SERVER_IP=10.5.100.7
set SERVER_USER=stagiaire
set SERVER_PASS=TON_MDP
set SOURCE=D:\Stage_Manoa\Projet\Messagerie_interne\Projet\Messagerie_Project\messagerie_app\build\*
set DEST=/etc/logistique/messagerie/

call npm run build

echo === Copie vers le serveur Ubuntu ===
scp -r "%SOURCE%" %SERVER_USER%@%SERVER_IP%:%DEST%



echo === Déploiement terminé ===
pause
