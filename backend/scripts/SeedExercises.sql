-- Script pour alimenter la base de données avec 50 exercices basiques
-- À exécuter après avoir créé un coach dans la base de données

-- Remplacer @CoachId par l'ID de votre coach
DECLARE @CoachId INT = 1007; -- Remplacer par votre CoachId

-- Upper Body Exercises
INSERT INTO ExerciseTemplates (CoachId, Name, Category, Description, Equipment, Instructions, VideoUrl, CreatedAt, UpdatedAt)
VALUES
(@CoachId, 'Bench Press', 'UpperBody', 'Exercice de développé couché pour les pectoraux', 'Barbell, Bench', 'Allongez-vous sur le banc, descendez la barre jusqu''à la poitrine, puis poussez vers le haut', 'https://www.youtube.com/shorts/example1', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Push-ups', 'UpperBody', 'Pompes classiques pour pectoraux et triceps', 'Bodyweight', 'Position de planche, descendez le corps en pliant les coudes, puis remontez', 'https://www.youtube.com/shorts/example2', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Dumbbell Press', 'UpperBody', 'Développé avec haltères', 'Dumbbells, Bench', 'Allongé sur le banc, poussez les haltères vers le haut', 'https://www.youtube.com/shorts/example3', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Incline Bench Press', 'UpperBody', 'Développé incliné pour le haut des pectoraux', 'Barbell, Incline Bench', 'Sur banc incliné, poussez la barre vers le haut', 'https://www.youtube.com/shorts/example4', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Dips', 'UpperBody', 'Dips pour triceps et pectoraux', 'Parallel Bars', 'Descendez en pliant les coudes, puis remontez', 'https://www.youtube.com/shorts/example5', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Overhead Press', 'UpperBody', 'Développé militaire pour les épaules', 'Barbell', 'Poussez la barre au-dessus de la tête', 'https://www.youtube.com/shorts/example6', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Lateral Raises', 'UpperBody', 'Élévations latérales pour les épaules', 'Dumbbells', 'Levez les haltères sur les côtés jusqu''à hauteur d''épaules', 'https://www.youtube.com/shorts/example7', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Front Raises', 'UpperBody', 'Élévations frontales pour les épaules', 'Dumbbells', 'Levez les haltères devant vous jusqu''à hauteur d''épaules', 'https://www.youtube.com/shorts/example8', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Tricep Extensions', 'UpperBody', 'Extensions triceps', 'Dumbbell', 'Levez l''haltère au-dessus de la tête, pliez les coudes', 'https://www.youtube.com/shorts/example9', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Bicep Curls', 'UpperBody', 'Curls biceps avec haltères', 'Dumbbells', 'Pliez les coudes pour lever les haltères', 'https://www.youtube.com/shorts/example10', GETUTCDATE(), GETUTCDATE());

-- Back Exercises (Dorsaux)
INSERT INTO ExerciseTemplates (CoachId, Name, Category, Description, Equipment, Instructions, VideoUrl, CreatedAt, UpdatedAt)
VALUES
(@CoachId, 'Pull-ups', 'Back', 'Tractions pour le dos', 'Pull-up Bar', 'Suspendez-vous à la barre, tirez jusqu''à ce que le menton dépasse la barre', 'https://www.youtube.com/shorts/example11', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Deadlift', 'Back', 'Soulevé de terre', 'Barbell', 'Soulevez la barre du sol en gardant le dos droit', 'https://www.youtube.com/shorts/example12', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Bent-Over Rows', 'Back', 'Rowing barre', 'Barbell', 'Penché en avant, tirez la barre vers le ventre', 'https://www.youtube.com/shorts/example13', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Lat Pulldown', 'Back', 'Tirage vertical', 'Cable Machine', 'Tirez la barre vers la poitrine', 'https://www.youtube.com/shorts/example14', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Dumbbell Rows', 'Back', 'Rowing avec haltère', 'Dumbbell, Bench', 'Un genou sur le banc, tirez l''haltère vers la hanche', 'https://www.youtube.com/shorts/example15', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'T-Bar Rows', 'Back', 'Rowing T-bar', 'T-Bar', 'Tirez la barre vers la poitrine', 'https://www.youtube.com/shorts/example16', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Face Pulls', 'Back', 'Tirage visage pour les trapèzes', 'Cable Machine', 'Tirez la corde vers le visage', 'https://www.youtube.com/shorts/example17', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Shrugs', 'Back', 'Haussements d''épaules', 'Dumbbells', 'Levez les épaules vers les oreilles', 'https://www.youtube.com/shorts/example18', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Seated Cable Rows', 'Back', 'Rowing assis à la poulie', 'Cable Machine', 'Tirez la poignée vers le ventre', 'https://www.youtube.com/shorts/example19', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Hyperextensions', 'Back', 'Extensions lombaires', 'Hyperextension Bench', 'Pliez à la taille, puis redressez le dos', 'https://www.youtube.com/shorts/example20', GETUTCDATE(), GETUTCDATE());

-- Lower Body Exercises
INSERT INTO ExerciseTemplates (CoachId, Name, Category, Description, Equipment, Instructions, VideoUrl, CreatedAt, UpdatedAt)
VALUES
(@CoachId, 'Squats', 'LowerBody', 'Squats pour les jambes', 'Barbell', 'Descendez en pliant les genoux, puis remontez', 'https://www.youtube.com/shorts/example21', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Leg Press', 'LowerBody', 'Presse à cuisses', 'Leg Press Machine', 'Poussez la plateforme avec les pieds', 'https://www.youtube.com/shorts/example22', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Lunges', 'LowerBody', 'Fentes pour les jambes', 'Dumbbells', 'Faites un pas en avant, pliez les genoux', 'https://www.youtube.com/shorts/example23', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Leg Curls', 'LowerBody', 'Curl jambes pour les ischio-jambiers', 'Leg Curl Machine', 'Pliez les genoux pour lever le poids', 'https://www.youtube.com/shorts/example24', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Leg Extensions', 'LowerBody', 'Extensions de jambes', 'Leg Extension Machine', 'Étendez les jambes pour lever le poids', 'https://www.youtube.com/shorts/example25', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Calf Raises', 'LowerBody', 'Élévations mollets', 'Bodyweight or Machine', 'Levez-vous sur la pointe des pieds', 'https://www.youtube.com/shorts/example26', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Romanian Deadlift', 'LowerBody', 'Soulevé de terre roumain', 'Barbell', 'Descendez la barre le long des jambes', 'https://www.youtube.com/shorts/example27', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Bulgarian Split Squats', 'LowerBody', 'Squats bulgares', 'Dumbbells, Bench', 'Un pied sur le banc, descendez en squat', 'https://www.youtube.com/shorts/example28', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Goblet Squats', 'LowerBody', 'Squats gobelet', 'Dumbbell', 'Tenez l''haltère devant la poitrine, faites un squat', 'https://www.youtube.com/shorts/example29', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Hip Thrusts', 'LowerBody', 'Poussées de hanches', 'Barbell, Bench', 'Dos sur le banc, poussez les hanches vers le haut', 'https://www.youtube.com/shorts/example30', GETUTCDATE(), GETUTCDATE());

-- Core Exercises
INSERT INTO ExerciseTemplates (CoachId, Name, Category, Description, Equipment, Instructions, VideoUrl, CreatedAt, UpdatedAt)
VALUES
(@CoachId, 'Plank', 'Core', 'Gainage abdominal', 'Bodyweight', 'Maintenez la position de planche', 'https://www.youtube.com/shorts/example31', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Crunches', 'Core', 'Crunchs abdominaux', 'Bodyweight', 'Allongé, relevez le buste vers les genoux', 'https://www.youtube.com/shorts/example32', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Russian Twists', 'Core', 'Torsions russes', 'Medicine Ball', 'Assis, tournez le buste de gauche à droite', 'https://www.youtube.com/shorts/example33', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Leg Raises', 'Core', 'Élévations de jambes', 'Bodyweight', 'Allongé, levez les jambes vers le plafond', 'https://www.youtube.com/shorts/example34', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Mountain Climbers', 'Core', 'Grimpeurs', 'Bodyweight', 'Position de planche, amenez les genoux vers la poitrine', 'https://www.youtube.com/shorts/example35', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Bicycle Crunches', 'Core', 'Crunchs vélo', 'Bodyweight', 'Allongé, amenez le coude vers le genou opposé', 'https://www.youtube.com/shorts/example36', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Side Plank', 'Core', 'Gainage latéral', 'Bodyweight', 'Sur le côté, maintenez la position', 'https://www.youtube.com/shorts/example37', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Ab Wheel Rollouts', 'Core', 'Roulette abdominale', 'Ab Wheel', 'À genoux, roulez la roue vers l''avant', 'https://www.youtube.com/shorts/example38', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Hanging Knee Raises', 'Core', 'Relevés de genoux suspendus', 'Pull-up Bar', 'Suspendu, levez les genoux vers la poitrine', 'https://www.youtube.com/shorts/example39', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Dead Bug', 'Core', 'Dead bug', 'Bodyweight', 'Allongé, alternez bras et jambes opposés', 'https://www.youtube.com/shorts/example40', GETUTCDATE(), GETUTCDATE());

-- Cardio Exercises
INSERT INTO ExerciseTemplates (CoachId, Name, Category, Description, Equipment, Instructions, VideoUrl, CreatedAt, UpdatedAt)
VALUES
(@CoachId, 'Running', 'Cardio', 'Course à pied', 'None', 'Courez à un rythme modéré', 'https://www.youtube.com/shorts/example41', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Jump Rope', 'Cardio', 'Corde à sauter', 'Jump Rope', 'Sautez à la corde', 'https://www.youtube.com/shorts/example42', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Burpees', 'Cardio', 'Burpees', 'Bodyweight', 'Squat, planche, pompe, saut', 'https://www.youtube.com/shorts/example43', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'High Knees', 'Cardio', 'Montées de genoux', 'Bodyweight', 'Courez sur place en levant les genoux haut', 'https://www.youtube.com/shorts/example44', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Jumping Jacks', 'Cardio', 'Jumping jacks', 'Bodyweight', 'Sautez en écartant bras et jambes', 'https://www.youtube.com/shorts/example45', GETUTCDATE(), GETUTCDATE());

-- Flexibility Exercises
INSERT INTO ExerciseTemplates (CoachId, Name, Category, Description, Equipment, Instructions, VideoUrl, CreatedAt, UpdatedAt)
VALUES
(@CoachId, 'Hamstring Stretch', 'Flexibility', 'Étirement ischio-jambiers', 'None', 'Penchez-vous en avant pour toucher les orteils', 'https://www.youtube.com/shorts/example46', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Quad Stretch', 'Flexibility', 'Étirement quadriceps', 'None', 'Debout, tirez le pied vers les fesses', 'https://www.youtube.com/shorts/example47', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Shoulder Stretch', 'Flexibility', 'Étirement épaules', 'None', 'Tirez le bras à travers la poitrine', 'https://www.youtube.com/shorts/example48', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Cat-Cow Stretch', 'Flexibility', 'Étirement chat-vache', 'None', 'À quatre pattes, alternez dos rond et dos creux', 'https://www.youtube.com/shorts/example49', GETUTCDATE(), GETUTCDATE()),
(@CoachId, 'Child''s Pose', 'Flexibility', 'Posture de l''enfant', 'None', 'À genoux, asseyez-vous sur les talons, bras étendus', 'https://www.youtube.com/shorts/example50', GETUTCDATE(), GETUTCDATE());

PRINT '50 exercices ont été ajoutés avec succès!';
