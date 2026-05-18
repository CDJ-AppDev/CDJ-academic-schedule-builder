WITH new_users AS (
  INSERT INTO user_credentials (useremail, userpassword, useraccess) VALUES
  ('jjt0965@dlsud.edu.ph', '$2a$10$ZUCOpXq3B.iONMPQkEL.5OXJol5nqMM.y/eAfESLBxXS1uicZTug2', 'Default'),  -- password: password123
  ('adrian@example.com', '$2a$10$ZUCOpXq3B.iONMPQkEL.5OXJol5nqMM.y/eAfESLBxXS1uicZTug2', 'Default'),  -- password: password123
  ('csd0403@dlsud.edu.ph', '$2a$10$ZUCOpXq3B.iONMPQkEL.5OXJol5nqMM.y/eAfESLBxXS1uicZTug2', 'Default'),  -- password: password123
  ('admin@gmail.com', '$2a$10$jKT5eHKnLfGSkriLO3oCo.7anit0t7es99rPRtwIIzaLaN9T7WH9e', 'Admin')  -- password: adminpass123
  ON CONFLICT (useremail) DO NOTHING
  RETURNING userid, useremail
)
INSERT INTO user_profile (userid, username, termid) 
SELECT 
  new_users.userid,
  CASE 
    WHEN new_users.useremail = 'jjt0965@dlsud.edu.ph' THEN 'Jian Jimenez'
    WHEN new_users.useremail = 'adrian@example.com' THEN 'Adrian De Vega'
    WHEN new_users.useremail = 'csd0403@dlsud.edu.ph' THEN 'Samuel Carmona'
    WHEN new_users.useremail = 'admin@gmail.com' THEN 'Super Admin'
  END,
  CASE 
    WHEN new_users.useremail = 'admin@gmail.com' THEN NULL
    ELSE 'CS4'
  END
FROM new_users
ON CONFLICT (userid) DO NOTHING;