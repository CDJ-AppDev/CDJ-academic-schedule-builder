-- Insert sample users into user_login table
-- Passwords are hashed using bcrypt (cost factor 10)
-- 'password123' hashed: $2a$10$example.hash.here (replace with actual hash)
-- For demo, using pre-computed hashes. In production, hash securely.

INSERT INTO user_login (name, email, password_hash) VALUES
('Jian Jimenez', 'jjt0965@dlsud.edu.ph', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),  -- password: password123
('Adrian De Vega', 'adrian@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),  -- password: password123
('Samuel Carmona', 'csd0403@dlsud.edu.ph', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');  -- password: password123