-- General is a system-wide open-shift category, not a worker-facing department
-- assignment. Normalize any legacy shifts linked to a department named General
-- to the canonical representation: department_id = NULL.
UPDATE shifts AS shift
SET department_id = NULL
FROM departments AS department
WHERE shift.department_id = department.id
  AND lower(department.name) = 'general';
