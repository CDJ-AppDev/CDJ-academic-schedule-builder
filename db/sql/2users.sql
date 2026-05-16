WITH new_users AS (
  INSERT INTO user_credentials (useremail, userpassword, useraccess) VALUES
  ('jjt0965@dlsud.edu.ph', '$2a$10$ZUCOpXq3B.iONMPQkEL.5OXJol5nqMM.y/eAfESLBxXS1uicZTug2', 'Default'),  -- password: password123
  ('adrian@example.com', '$2a$10$ZUCOpXq3B.iONMPQkEL.5OXJol5nqMM.y/eAfESLBxXS1uicZTug2', 'Default'),  -- password: password123
  ('csd0403@dlsud.edu.ph', '$2a$10$ZUCOpXq3B.iONMPQkEL.5OXJol5nqMM.y/eAfESLBxXS1uicZTug2', 'Default')  -- password: password123
  RETURNING userid, useremail
)
INSERT INTO user_profile (userid, username, termid) 
SELECT 
  new_users.userid,
  CASE 
    WHEN new_users.useremail = 'jjt0965@dlsud.edu.ph' THEN 'Jian Jimenez'
    WHEN new_users.useremail = 'adrian@example.com' THEN 'Adrian De Vega'
    WHEN new_users.useremail = 'csd0403@dlsud.edu.ph' THEN 'Samuel Carmona'
  END,
  'CS4'
FROM new_users; 