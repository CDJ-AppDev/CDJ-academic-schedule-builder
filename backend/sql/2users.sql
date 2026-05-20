WITH new_users AS (
  INSERT INTO user_credentials (useremail, userpassword, useraccess) VALUES
  ('jjt0965@dlsud.edu.ph', 'e3671fe79e46ed6148f414c50b44c8cd:fff164a6c87410cae4ed08f4e2b0cad4', 'Default'),  -- password: password123 (AES-256-CBC encrypted)
  ('adrian@example.com', 'e3671fe79e46ed6148f414c50b44c8cd:fff164a6c87410cae4ed08f4e2b0cad4', 'Default'),  -- password: password123 (AES-256-CBC encrypted)
  ('csd0403@dlsud.edu.ph', 'e3671fe79e46ed6148f414c50b44c8cd:fff164a6c87410cae4ed08f4e2b0cad4', 'Default'),  -- password: password123 (AES-256-CBC encrypted)
  ('admin@gmail.com', 'b67a37b679c0f7e47114f170a7ab6a10:b17346125745a37fa3eaf4c040b29f32', 'Admin')  -- password: adminpass123 (AES-256-CBC encrypted)
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