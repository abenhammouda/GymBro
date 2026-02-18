-- Insert free Unsplash images for muscle group categories
-- Using Unsplash's free CDN service (no API key required)

-- Upper Body (workout, gym themed)
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('UpperBody', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', 'upperbody-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-wearing-blue-sports-bra-smiling-Lrv1aVGC_Zk', GETDATE()),
('UpperBody', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', 'upperbody-2.jpg', 'Unsplash', 'https://unsplash.com/photos/man-holding-barbell-gJtDg6WfMlQ', GETDATE());

-- Lower Body (legs, squats)
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('LowerBody', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800', 'lowerbody-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-doing-exercise-3Jn5EzFMzJw', GETDATE()),
('LowerBody', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', 'lowerbody-2.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-in-black-tank-top-and-black-pants-bending-her-body-UJeBcZkmPhM', GETDATE());

-- Chest (bench press)
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('Chest', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'chest-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-in-black-tank-top-and-black-pants-doing-exercise-CQfNt66ttZM', GETDATE()),
('Chest', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800', 'chest-2.jpg', 'Unsplash', 'https://unsplash.com/photos/man-in-black-tank-top-and-gray-shorts-doing-push-up-_FVxuAoC7w0', GETDATE());

-- Shoulders
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('Shoulders', 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800', 'shoulders-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-in-black-tank-top-and-black-pants-doing-yoga-SIaJIMyq7aA', GETDATE()),
('Shoulders', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800', 'shoulders-2.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-in-black-sports-bra-holding-black-dumbbell-7Zb7kUyQg1E', GETDATE());

-- Back
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('Back', 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=800', 'back-1.jpg', 'Unsplash', 'https://unsplash.com/photos/man-in-gray-tank-top-and-blue-denim-jeans-doing-pull-ups-ZOT2Mewzmh8', GETDATE()),
('Back', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800', 'back-2.jpg', 'Unsplash', 'https://unsplash.com/photos/person-holding-barbell-rO2SmpcJl4A', GETDATE());

-- Core (abs, planks)
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('Core', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'core-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-planking-CQfNt66ttZM', GETDATE()),
('Core', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', 'core-2.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-in-gray-sports-bra-holding-gray-bar--Nc8yOo2f4c', GETDATE());

-- Cardio (running, cycling)
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('Cardio', 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800', 'cardio-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-standing-on-dock-during-daytime-6Bqg9WTbjUA', GETDATE()),
('Cardio', 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800', 'cardio-2.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-running-on-pathway-during-daytime-4-_cCsKqKvY', GETDATE());

-- Flexibility (yoga, stretching)
INSERT INTO [MuscleGroupImages] ([Category], [ImageUrl], [ImageFileName], [Source], [SourceUrl], [CreatedAt])
VALUES 
('Flexibility', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'flexibility-1.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-doing-yoga-on-stability-ball-_H6wpor9mjs', GETDATE()),
('Flexibility', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 'flexibility-2.jpg', 'Unsplash', 'https://unsplash.com/photos/woman-stretching-on-mountain-daytime-RDolnHtjVCY', GETDATE());
