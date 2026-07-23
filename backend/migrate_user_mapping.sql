ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

UPDATE users SET role = 'admin'          WHERE username = 'admin';
UPDATE users SET role = 'safety_officer' WHERE username = 'safety';
UPDATE users SET role = 'hrd'            WHERE username = 'hrd';
UPDATE users SET role = 'employee'       WHERE username = 'employee';

UPDATE employees
  SET user_id = (SELECT id FROM users WHERE role = 'safety_officer' LIMIT 1)
  WHERE name ILIKE '%ACHMAD ROFIUDDIN%';

UPDATE employees
  SET user_id = (SELECT id FROM users WHERE role = 'hrd' LIMIT 1)
  WHERE name ILIKE '%IQBAL SANDY MAULANA%';

UPDATE employees
  SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
  WHERE name ILIKE '%NURUS LAILY APRILIA%';

UPDATE employees
  SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
  WHERE name ILIKE '%ABDELAS YOSHIA%';

UPDATE employees
  SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
  WHERE name ILIKE '%ERNOLD MOCHAMMAD%';

UPDATE employees
  SET user_id = (SELECT id FROM users WHERE role = 'employee' LIMIT 1)
  WHERE user_id IS NULL;

SELECT e.name, e.department, e.user_id, u.username, u.role
FROM employees e
LEFT JOIN users u ON u.id = e.user_id
ORDER BY u.role, e.name;
