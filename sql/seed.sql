-- Choose the database to seed:
USE employeeTracker_db;

-- Create seed data for the 'department' table:
INSERT INTO department (name)
VALUES ("Development"), ("Sales"), ("Marketing"), ("Customer Support");

-- Create seed data for the 'role' table:
INSERT INTO role (title, salary, department_id)
VALUES ("CTO", 200000.00, 1), ("VP Sales", 180000.00, 2), ("CMO", 140000.00, 3), ("Service Agent", 50000.00, 4);

-- Create seed data for the 'employee' table:
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Dan", "Smith", 4 , "Gina Thompson"), ("Gina", "Thompson", 3 , "N/A"), ("Eric", "Hemhauser", 2 , "The Big Boss"), ("Sara", "Nader", 1 , "The Big Boss");
