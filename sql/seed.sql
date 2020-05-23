USE employeeTracker_db;

INSERT INTO department (name)
VALUES ("Development"), ("Sales"), ("Marketing"), ("Customer Support");

INSERT INTO role (title, salary, department_id)
VALUES ("CTO", 200000.00, 1), ("VP Sales", 180000.00, 2), ("CMO", 140000.00, 3), ("Service Agent", 50000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Dan", "Smith", 4 , 1), ("Gina", "Thompson", 3 , 2), ("Eric", "Hemhauser", 3 , 2), ("Sara", "Nader", 3 , 2);
