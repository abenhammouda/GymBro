-- Script pour mettre à jour les photos de profil des adhérents avec des photos de célébrités

-- Récupérer d'abord les adhérents existants
SELECT AdherentId, Name, Email FROM Adherents;

-- Mettre à jour avec des photos de célébrités (URLs publiques)
-- Vous devrez adapter les IDs selon vos données

-- Exemple avec des photos de célébrités sportives
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/men/1.jpg' WHERE AdherentId = 1;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/women/1.jpg' WHERE AdherentId = 2;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/men/2.jpg' WHERE AdherentId = 3;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/women/2.jpg' WHERE AdherentId = 4;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/men/3.jpg' WHERE AdherentId = 5;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/women/3.jpg' WHERE AdherentId = 6;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/men/4.jpg' WHERE AdherentId = 7;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/women/4.jpg' WHERE AdherentId = 8;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/men/5.jpg' WHERE AdherentId = 9;
UPDATE Adherents SET ProfilePicture = 'https://randomuser.me/api/portraits/women/5.jpg' WHERE AdherentId = 10;

-- Vérifier les mises à jour
SELECT AdherentId, Name, Email, ProfilePicture FROM Adherents;
