-- Simplified version - Insert Unsplash images for muscle group categories
-- Make sure to run this in your CoachingAppDb database

-- Check if table is empty first
SELECT COUNT(*) as CurrentCount FROM [MuscleGroupImages];

-- Insert images
INSERT INTO [MuscleGroupImages] (Category, ImageUrl, ImageFileName, Source, CreatedAt)
VALUES 
-- Upper Body
('UpperBody', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', 'upperbody-1.jpg', 'Unsplash', GETUTCDATE()),
('UpperBody', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', 'upperbody-2.jpg', 'Unsplash', GETUTCDATE()),

-- Lower Body
('LowerBody', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800', 'lowerbody-1.jpg', 'Unsplash', GETUTCDATE()),
('LowerBody', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', 'lowerbody-2.jpg', 'Unsplash', GETUTCDATE()),

-- Chest
('Chest', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'chest-1.jpg', 'Unsplash', GETUTCDATE()),
('Chest', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800', 'chest-2.jpg', 'Unsplash', GETUTCDATE()),

-- Shoulders  
('Shoulders', 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800', 'shoulders-1.jpg', 'Unsplash', GETUTCDATE()),
('Shoulders', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800', 'shoulders-2.jpg', 'Unsplash', GETUTCDATE()),

-- Back
('Back', 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=800', 'back-1.jpg', 'Unsplash', GETUTCDATE()),
('Back', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800', 'back-2.jpg', 'Unsplash', GETUTCDATE()),

-- Core
('Core', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 'core-1.jpg', 'Unsplash', GETUTCDATE()),
('Core', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', 'core-2.jpg', 'Unsplash', GETUTCDATE()),

-- Cardio
('Cardio', 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800', 'cardio-1.jpg', 'Unsplash', GETUTCDATE()),
('Cardio', 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800', 'cardio-2.jpg', 'Unsplash', GETUTCDATE()),

-- Flexibility
('Flexibility', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'flexibility-1.jpg', 'Unsplash', GETUTCDATE()),
('Flexibility', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', 'flexibility-2.jpg', 'Unsplash', GETUTCDATE());

-- Verify insertion
SELECT Category, COUNT(*) as ImageCount 
FROM [MuscleGroupImages] 
GROUP BY Category 
ORDER BY Category;
