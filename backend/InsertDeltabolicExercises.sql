-- Script pour nettoyer et insérer les exercices DeltaBolic avec Category2
-- Date: 2026-01-27
-- Note: Category2 est maintenant inclus explicitement dans le script

-- Nettoyer la table ExerciseTemplates
DELETE FROM ExerciseTemplates;

-- Réinitialiser l'identité (auto-increment) si nécessaire
DBCC CHECKIDENT ('ExerciseTemplates', RESEED, 0);

-- Insérer les 50 exercices DeltaBolic
INSERT INTO ExerciseTemplates (CoachId, Name, Description, Category, Category2, Equipment, VideoUrl, VideoFileName, ThumbnailUrl, Duration, Instructions, CreatedAt, UpdatedAt)
VALUES
-- Exercices Pectoraux (Category2 = UpperBody)
(1007, 'Cable Chest Presses', 'Technique correcte pour les développés pectoraux au câble', 'Pectoraux', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/FHeLHhTth8w', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Variantes de pompes pour pectoraux', 'Différentes variations de pompes ciblant diverses fibres musculaires pectorales', 'Pectoraux', 'UpperBody', 'Poids du corps', 'https://www.youtube.com/shorts/J-vItVuxDl0', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Variantes de développé couché machine', 'Différentes façons d''utiliser la machine à développé couché', 'Pectoraux', 'UpperBody', 'Machine', 'https://www.youtube.com/shorts/KfDDkDOHO5c', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Exercices pour les pectoraux avec haltères', 'Programme complet pour les pectoraux utilisant uniquement des haltères', 'Pectoraux', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/_7iVqpJUt6w', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Bench Press Angles', 'Angles de développé couché et muscles sollicités', 'Pectoraux', 'UpperBody', 'Barre', 'https://www.youtube.com/shorts/NliSiO1AZ_8', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Chest Flyes', 'Technique correcte pour les écartés pectoraux', 'Pectoraux', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/hKe5WG-zZRM', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Incline Bench Press', 'Technique parfaite pour le développé incliné', 'Pectoraux', 'UpperBody', 'Barre', 'https://www.youtube.com/shorts/Uf2To5LoYBE', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Pompes parfaites', 'Technique correcte pour effectuer des pompes', 'Pectoraux', 'UpperBody', 'Poids du corps', 'https://www.youtube.com/shorts/EGShi0FcidE', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Erreurs Bench Press', 'Erreurs à éviter au développé couché', 'Pectoraux', 'UpperBody', 'Barre', 'https://www.youtube.com/shorts/C2mnTiZHLy4', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'DB Chest Press', 'Technique parfaite pour le développé couché aux haltères', 'Pectoraux', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/tdYLpdsY3Lw', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Erreurs Pompes', 'Erreurs à éviter lors des pompes', 'Pectoraux', 'UpperBody', 'Poids du corps', 'https://www.youtube.com/shorts/qV7N-HjyEyw', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Bench Press Grip Widths', 'Largeurs de prise au développé couché et muscles sollicités', 'Pectoraux', 'UpperBody', 'Barre', 'https://www.youtube.com/shorts/Ti5wayXCWIk', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),

-- Exercices Épaules (Category2 = UpperBody)
(1007, 'Variantes d''exercices d''épaules avec haltères', 'Différentes variations d''exercices pour développer les épaules avec des haltères', 'Épaules', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/mDHcpSdww0A', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Élévations latérales', 'Erreurs courantes à éviter lors des élévations latérales', 'Épaules', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/G6hX_z-2S0g', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Rear Delt Machine Fly', 'Technique parfaite pour les écartés deltoïdes postérieurs à la machine', 'Épaules', 'UpperBody', 'Machine', 'https://www.youtube.com/shorts/H5UxZFl0lgk', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Erreurs exercices épaules', 'Erreurs fréquentes à corriger dans les exercices pour les épaules', 'Épaules', 'UpperBody', 'Divers', 'https://www.youtube.com/shorts/V-HhecbJ640', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Shoulder Press', 'Correction des erreurs de développé épaules', 'Épaules', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/tNPEBFuc-Sw', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Épaules plus larges', 'Exercices pour développer des épaules larges et arrondies', 'Épaules', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/X10cv3PqbuI', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Tirages deltoïdes postérieurs', 'Correction des erreurs dans les tirages pour deltoïdes postérieurs', 'Épaules', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/naoYdHwwrR4', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Presse épaules machine', 'Guide de prise et position pour la presse à épaules machine', 'Épaules', 'UpperBody', 'Machine', 'https://www.youtube.com/shorts/58VrYLydDPE', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Entraînement épaules barre', 'Programme complet pour les épaules avec barre uniquement', 'Épaules', 'UpperBody', 'Barre', 'https://www.youtube.com/shorts/B78LZ8LZfLXiLg', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Élévation latérale - Astuce', 'Astuce pour optimiser les élévations latérales', 'Épaules', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/yuR2ma8f_-k', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Exercices épaules câbles', 'Programme complet pour les épaules avec câbles', 'Épaules', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/6wHaXpM6JgE', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),

-- Exercices Dos (Category2 = UpperBody)
(1007, 'Améliorer les tractions', 'Techniques pour progresser aux tractions', 'Dos', 'UpperBody', 'Barre de traction', 'https://www.youtube.com/shorts/a7_k1upEPjc', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Exercices traction à la corde', 'Différences entre les exercices de traction à la corde', 'Dos', 'UpperBody', 'Corde', 'https://www.youtube.com/shorts/aMZF_FM0nyE', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Straight Arm Pulldown', 'Correction de la technique du pulldown bras tendus', 'Dos', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/YINo3Z-vXAk', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Tirages machine Smith', 'Largeur de prise et muscles sollicités aux tirages Smith', 'Dos', 'UpperBody', 'Machine Smith', 'https://www.youtube.com/shorts/6R9z1HhxGC8', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Lat Pulldowns', 'Technique parfaite pour les tirages verticaux', 'Dos', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/7jBmlCq5QzQ', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Face Pulls', 'Technique parfaite pour les face pulls', 'Dos', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/ywQsaOTRjzM', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Cable Row', 'Technique parfaite pour les tirages horizontaux au câble', 'Dos', 'UpperBody', 'Câble', 'https://www.youtube.com/shorts/wAU8VdcRAMQ', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Dumbbell Row', 'Erreurs à corriger dans les rowings aux haltères', 'Dos', 'UpperBody', 'Haltères', 'https://www.youtube.com/shorts/H2Bv38FavZo', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),

-- Exercices Bras (Category2 = NULL car pas de catégorie secondaire)
(1007, 'Entraînement des avant-bras avec barre', 'Exercices essentiels pour développer la force des avant-bras avec une barre', 'Other', NULL, 'Barre', 'https://www.youtube.com/shorts/DRCSpntjwRw', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Cable Overhead Extensions', 'Comment effectuer correctement les extensions au-dessus de la tête avec câble', 'Other', NULL, 'Câble', 'https://www.youtube.com/shorts/fmgmPDacgKM', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Développement des avant-bras', 'Exercices pour construire des avant-bras plus gros', 'Other', NULL, 'Haltères', 'https://www.youtube.com/shorts/cLnjWmBq4JA', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Extensions des triceps', 'Correction des erreurs communes dans les extensions triceps', 'Other', NULL, 'Haltères', 'https://www.youtube.com/shorts/WbfNbXBc8FA', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Incline Curls', 'Correction des erreurs dans les curls inclinés', 'Other', NULL, 'Haltères', 'https://www.youtube.com/shorts/26-gHfVzKjM', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Flexions biceps - Poignées', 'Différentes poignées pour les curls biceps et muscles ciblés', 'Other', NULL, 'Haltères', 'https://www.youtube.com/shorts/Qemb2cWVOd8', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Prise de barre et muscles', 'Impact de la prise de barre sur les muscles sollicités', 'Other', NULL, 'Barre', 'https://www.youtube.com/shorts/nmYq9izr1XA', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Entraînement poulie V', 'Exercices complets avec poignée en V uniquement', 'Other', NULL, 'Câble', 'https://www.youtube.com/shorts/pwOHAN0j6Og', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Force de préhension - Fat Gripz', 'Comment la force de préhension aide à gagner en masse musculaire', 'Other', NULL, 'Fat Gripz', 'https://www.youtube.com/shorts/fwsclyavflA', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Incline Biceps Curl Hack', 'Astuce pour optimiser les curls biceps inclinés', 'Other', NULL, 'Haltères', 'https://www.youtube.com/shorts/7dGvfAjiqM4', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Erreurs flexions biceps', 'Erreurs courantes à corriger dans les flexions de biceps', 'Other', NULL, 'Haltères', 'https://www.youtube.com/shorts/xJqSby6pSO8', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Triceps Pushdown', 'Erreurs à corriger dans les extensions triceps à la poulie', 'Other', NULL, 'Câble', 'https://www.youtube.com/shorts/eDa0VYlbDeQ', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Skull Crusher', 'Technique parfaite pour les extensions triceps couchées', 'Other', NULL, 'Barre', 'https://www.youtube.com/shorts/RetiLFQobXU', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),

-- Exercices Jambes (Category2 = LowerBody)
(1007, 'Exercices jambes machine Smith', 'Variantes d''exercices pour les jambes à la machine Smith', 'Jambes', 'LowerBody', 'Machine Smith', 'https://www.youtube.com/shorts/YPguyDLYD28', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Presse à jambes - Positionnement pieds', 'Impact du positionnement des pieds sur les muscles sollicités', 'Jambes', 'LowerBody', 'Machine', 'https://www.youtube.com/shorts/MICiHJ67xTI', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Glute Kickback Variations', 'Variations de kickbacks pour fessiers et muscles ciblés', 'Jambes', 'LowerBody', 'Câble', 'https://www.youtube.com/shorts/H5-zZ4zwios', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),
(1007, 'Goblet Squat Variations', 'Différentes variations du squat gobelet', 'Jambes', 'LowerBody', 'Haltère', 'https://www.youtube.com/shorts/ZBAd1g1z6qs', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),

-- Exercices Core (Category2 = NULL)
(1007, 'Hyperextensions', 'Différence entre ciblage lombaires vs fessiers', 'Core', NULL, 'Banc hyperextension', 'https://www.youtube.com/shorts/nGkITCtyMRc', NULL, NULL, NULL, NULL, GETDATE(), GETDATE()),

-- Exercices Other (Category2 = NULL)
(1007, 'Exercices à domicile sans équipement', 'Alternatives d''exercices à faire à la maison sans matériel', 'Other', NULL, 'Poids du corps', 'https://www.youtube.com/shorts/RimBmDLaUSI', NULL, NULL, NULL, NULL, GETDATE(), GETDATE());

-- Vérifier l'insertion
SELECT COUNT(*) as 'Nombre d''exercices insérés' FROM ExerciseTemplates;
SELECT Category, Category2, COUNT(*) as 'Nombre' FROM ExerciseTemplates GROUP BY Category, Category2 ORDER BY Category2, Category;
