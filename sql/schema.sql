-- Drop the database if it already exists: 
DROP DATABASE IF EXISTS employeeTracker_db;

-- Create the database:
CREATE DATABASE employeeTracker_db;

-- Use the database:
USE employeeTracker_db;

-- Create a 'department' table in the database:
CREATE TABLE department (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

-- Create a 'role' table in the database:
CREATE TABLE role (
  id INT AUTO_INCREMENT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(8,2) NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id)
);

-- Create an 'employee' table in the database:
CREATE TABLE employee (
  id INT AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id VARCHAR(30) DEFAULT "N/A",
  PRIMARY KEY (id)
);
