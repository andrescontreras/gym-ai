-- Seed core exercises for MVP
-- Covers all 8 movement patterns with common equipment variations
-- Embedding vectors deferred (all NULL for now)

INSERT INTO exercises (name, muscle_group, movement_pattern, equipment, synergist_muscles, resistance_profile, description) VALUES

-- PUSH HORIZONTAL (Chest Primary)
('Barbell Bench Press', 'chest', 'push_horizontal', ARRAY['barbell', 'bench'], ARRAY['anterior_deltoid', 'triceps'], 'linear', 'Primary chest builder with barbell'),
('Dumbbell Bench Press', 'chest', 'push_horizontal', ARRAY['dumbbells', 'bench'], ARRAY['anterior_deltoid', 'triceps'], 'linear', 'Unilateral chest press with greater ROM'),
('Incline Barbell Bench Press', 'chest', 'push_horizontal', ARRAY['barbell', 'bench'], ARRAY['anterior_deltoid', 'triceps'], 'linear', 'Upper chest emphasis'),
('Incline Dumbbell Bench Press', 'chest', 'push_horizontal', ARRAY['dumbbells', 'bench'], ARRAY['anterior_deltoid', 'triceps'], 'linear', 'Upper chest with unilateral stability'),
('Push-ups', 'chest', 'push_horizontal', ARRAY['bodyweight'], ARRAY['anterior_deltoid', 'triceps'], 'linear', 'Bodyweight horizontal push'),
('Chest Press Machine', 'chest', 'push_horizontal', ARRAY['machine'], ARRAY['anterior_deltoid', 'triceps'], 'linear', 'Guided horizontal press movement'),
('Cable Chest Fly', 'chest', 'push_horizontal', ARRAY['cable'], ARRAY['anterior_deltoid'], 'ascending', 'Isolation movement for pectorals'),
('Dumbbell Chest Fly', 'chest', 'push_horizontal', ARRAY['dumbbells', 'bench'], ARRAY['anterior_deltoid'], 'descending', 'Pec isolation with free weights'),

-- PUSH VERTICAL (Shoulders Primary)
('Barbell Overhead Press', 'shoulders', 'push_vertical', ARRAY['barbell'], ARRAY['triceps', 'upper_chest'], 'linear', 'Primary shoulder builder'),
('Dumbbell Shoulder Press', 'shoulders', 'push_vertical', ARRAY['dumbbells'], ARRAY['triceps', 'upper_chest'], 'linear', 'Unilateral shoulder press'),
('Arnold Press', 'shoulders', 'push_vertical', ARRAY['dumbbells'], ARRAY['triceps'], 'linear', 'Rotational shoulder press variation'),
('Landmine Press', 'shoulders', 'push_vertical', ARRAY['barbell', 'landmine'], ARRAY['triceps', 'upper_chest'], 'linear', 'Angled overhead press'),
('Pike Push-ups', 'shoulders', 'push_vertical', ARRAY['bodyweight'], ARRAY['triceps', 'upper_chest'], 'linear', 'Bodyweight shoulder press'),
('Shoulder Press Machine', 'shoulders', 'push_vertical', ARRAY['machine'], ARRAY['triceps'], 'linear', 'Guided vertical press'),

-- PULL HORIZONTAL (Back - Rhomboids/Lats)
('Barbell Row', 'back', 'pull_horizontal', ARRAY['barbell'], ARRAY['biceps', 'rear_deltoid'], 'linear', 'Primary horizontal pulling movement'),
('Dumbbell Row', 'back', 'pull_horizontal', ARRAY['dumbbells'], ARRAY['biceps', 'rear_deltoid'], 'linear', 'Unilateral horizontal pull'),
('Cable Row', 'back', 'pull_horizontal', ARRAY['cable'], ARRAY['biceps', 'rear_deltoid'], 'linear', 'Constant tension horizontal pull'),
('Chest-Supported Row', 'back', 'pull_horizontal', ARRAY['dumbbells', 'bench'], ARRAY['biceps', 'rear_deltoid'], 'linear', 'Lower back supported row'),
('Inverted Row', 'back', 'pull_horizontal', ARRAY['bodyweight', 'bar'], ARRAY['biceps', 'rear_deltoid'], 'linear', 'Bodyweight horizontal pull'),
('T-Bar Row', 'back', 'pull_horizontal', ARRAY['barbell', 'landmine'], ARRAY['biceps', 'rear_deltoid'], 'linear', 'Neutral grip horizontal pull'),

-- PULL VERTICAL (Lats Primary)
('Pull-ups', 'back', 'pull_vertical', ARRAY['bodyweight', 'bar'], ARRAY['biceps'], 'linear', 'Primary vertical pulling movement'),
('Chin-ups', 'back', 'pull_vertical', ARRAY['bodyweight', 'bar'], ARRAY['biceps'], 'linear', 'Underhand vertical pull with bicep emphasis'),
('Lat Pulldown', 'back', 'pull_vertical', ARRAY['cable'], ARRAY['biceps'], 'linear', 'Assisted vertical pull'),
('Neutral Grip Pull-up', 'back', 'pull_vertical', ARRAY['bodyweight', 'bar'], ARRAY['biceps'], 'linear', 'Vertical pull with neutral grip'),
('Assisted Pull-up Machine', 'back', 'pull_vertical', ARRAY['machine'], ARRAY['biceps'], 'linear', 'Counterbalanced vertical pull'),

-- SQUAT (Quads/Glutes)
('Barbell Back Squat', 'legs', 'squat', ARRAY['barbell', 'rack'], ARRAY['glutes', 'adductors'], 'linear', 'Primary lower body compound movement'),
('Barbell Front Squat', 'legs', 'squat', ARRAY['barbell', 'rack'], ARRAY['glutes', 'core'], 'linear', 'Quad-dominant squat variation'),
('Goblet Squat', 'legs', 'squat', ARRAY['dumbbell'], ARRAY['glutes', 'core'], 'linear', 'Front-loaded squat for beginners'),
('Leg Press', 'legs', 'squat', ARRAY['machine'], ARRAY['glutes', 'adductors'], 'linear', 'Machine-assisted bilateral squat'),
('Hack Squat', 'legs', 'squat', ARRAY['machine'], ARRAY['glutes'], 'linear', 'Fixed-path quad-focused squat'),
('Box Squat', 'legs', 'squat', ARRAY['barbell', 'rack', 'box'], ARRAY['glutes', 'adductors'], 'linear', 'Squat with depth control'),

-- HINGE (Hamstrings/Glutes)
('Barbell Deadlift', 'legs', 'hinge', ARRAY['barbell'], ARRAY['glutes', 'erector_spinae'], 'linear', 'Primary hip hinge movement'),
('Romanian Deadlift', 'legs', 'hinge', ARRAY['barbell'], ARRAY['glutes', 'erector_spinae'], 'linear', 'Hamstring-focused hinge'),
('Dumbbell Romanian Deadlift', 'legs', 'hinge', ARRAY['dumbbells'], ARRAY['glutes', 'erector_spinae'], 'linear', 'Unilateral RDL option'),
('Hip Thrust', 'legs', 'hinge', ARRAY['barbell', 'bench'], ARRAY['hamstrings'], 'ascending', 'Glute-dominant hinge'),
('Glute Bridge', 'legs', 'hinge', ARRAY['bodyweight'], ARRAY['hamstrings'], 'ascending', 'Bodyweight glute activation'),
('Good Morning', 'legs', 'hinge', ARRAY['barbell'], ARRAY['hamstrings', 'erector_spinae'], 'linear', 'Loaded hip hinge with fixed legs'),
('Trap Bar Deadlift', 'legs', 'hinge', ARRAY['trap_bar'], ARRAY['glutes', 'quads'], 'linear', 'Neutral grip deadlift variation'),

-- LUNGE (Unilateral Quads/Glutes)
('Walking Lunge', 'legs', 'lunge', ARRAY['dumbbells'], ARRAY['glutes', 'core'], 'linear', 'Dynamic unilateral leg movement'),
('Reverse Lunge', 'legs', 'lunge', ARRAY['dumbbells'], ARRAY['glutes', 'core'], 'linear', 'Backward stepping lunge'),
('Bulgarian Split Squat', 'legs', 'lunge', ARRAY['dumbbells'], ARRAY['glutes', 'core'], 'linear', 'Rear-foot elevated split squat'),
('Barbell Walking Lunge', 'legs', 'lunge', ARRAY['barbell'], ARRAY['glutes', 'core'], 'linear', 'Loaded dynamic lunge'),
('Stationary Lunge', 'legs', 'lunge', ARRAY['dumbbells'], ARRAY['glutes'], 'linear', 'In-place split squat'),

-- CARRY (Core/Grip)
('Farmer''s Walk', 'core', 'carry', ARRAY['dumbbells'], ARRAY['traps', 'forearms'], 'linear', 'Bilateral loaded carry'),
('Suitcase Carry', 'core', 'carry', ARRAY['dumbbell'], ARRAY['obliques', 'forearms'], 'linear', 'Unilateral anti-lateral flexion carry'),
('Overhead Carry', 'core', 'carry', ARRAY['dumbbell'], ARRAY['shoulders', 'obliques'], 'linear', 'Overhead stabilization carry'),

-- Isolation Movements (commonly needed)
('Bicep Curl', 'arms', 'pull_horizontal', ARRAY['dumbbells'], ARRAY[]::text[], 'linear', 'Bicep isolation'),
('Tricep Pushdown', 'arms', 'push_horizontal', ARRAY['cable'], ARRAY[]::text[], 'linear', 'Tricep isolation'),
('Lateral Raise', 'shoulders', 'push_vertical', ARRAY['dumbbells'], ARRAY[]::text[], 'ascending', 'Medial deltoid isolation'),
('Face Pull', 'shoulders', 'pull_horizontal', ARRAY['cable'], ARRAY['rear_deltoid'], 'linear', 'Rear deltoid and rotator cuff'),
('Leg Curl', 'legs', 'hinge', ARRAY['machine'], ARRAY[]::text[], 'linear', 'Hamstring isolation'),
('Leg Extension', 'legs', 'squat', ARRAY['machine'], ARRAY[]::text[], 'linear', 'Quad isolation'),
('Calf Raise', 'legs', 'squat', ARRAY['machine'], ARRAY[]::text[], 'linear', 'Calf isolation');
