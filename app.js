// Require some NPMs:
const inquirer = require("inquirer")
const cTable = require('console.table')
// Require access to the database:
const db = require('./db')

// Create a variable for the entire program:
const tracker = { start: () => {
  // Prompt the user to choose what they want to do:
  inquirer.prompt({
    name: "selection",
    type: "list",
    message: "What would you like to do?",
    choices: ["Add an Employee", "Add a Role", "Add a Department", "View Employees", "View Roles", "View Departments", "Update Employee Role", "Exit"]
  })
  // Run the function that the user selected:
  .then(({ selection }) => {
    switch (selection) {
      case "Add an Employee":
        tracker.addEmployee()
        break      
      case "Add a Role":
        tracker.addRole()
        break
      case "Add a Department":
        tracker.addDepartment()
        break
      case "View Employees":
        tracker.viewEmployees()
        break
      case "View Roles":
        tracker.viewRoles()
        break     
      case "View Departments":
        tracker.viewDepartments()
        break
      case "Update Employee Role":
        tracker.updateEmployeeRole()
        break
      default:
        db.end()
      }
    })
  },

  // To add an employee to the database: 
  addEmployee: () => {
    const addQuery = "SELECT employee.id,first_name,last_name,role.id,title FROM employee RIGHT JOIN role ON role_id = role.id"
    db.query(addQuery, function (err, result) {
      if (err) throw err
      inquirer.prompt([
        {
          name: "first_name",
          type: "input",
          message: "What is their first name?",
        }, {
          name: "last_name",
          type: "input",
          message: "What is their last name?",
        }, {
          name: "role",
          type: "list",
          message: "What is their role in the company?",
          // Create an array of choices based on the 'title' from the 'role' table:
          choices: function () {
            let roleArray = []
            for (i = 0; i < result.length; i++) {
              if (!roleArray.includes(result[i].title)) {
                roleArray.push(result[i].title)
              }
            }
            return roleArray
          }
        }, {
          name: "manager",
          type: "list",
          message: "Who is their manager?",
          // Create an array of choices based on the manager's name from the 'employee' table:
          choices: function () {
            let managerArray = ["N/A"]
            for (i = 0; i < result.length; i++) {
              if (result[i].first_name !== null && result[i].last_name !== null) {
                managerArray.push(result[i].first_name + " " + result[i].last_name)
              }
            }
            return managerArray
          }
        }]).then(function (data) {
          let roleChoice
          for (i = 0; i < result.length; i++) {
            if (result[i].title === data.role) {
              roleChoice = result[i]
            }
          }
          let managerChoice
          for (i = 0; i < result.length; i++) {
            if ((result[i].first_name + " " + result[i].last_name) === data.manager) {
              managerChoice = result[i].first_name + " " + result[i].last_name
            } else {
              managerChoice = data.manager
            }
          }
          // Add user's choice of role for this employee into the table:
          const query = "INSERT INTO employee SET ?"
          const set = {
            first_name: data.first_name,
            last_name: data.last_name,
            role_id: roleChoice.id
          }
          // Add user's choice of manager for this employee into the table:
          if (managerChoice === "N/A") {
            set.manager_id = "N/A"
          } else {
            set.manager_id = managerChoice
          }
          // Display updated 'employee' table:
          db.query(query, set, (err) => {
            if (err) throw err
            tracker.viewEmployees()
          })
        })
    })
  },

  // To add a role to the database:
  addRole: () => {
    const addQuery = "SELECT * from department"
    db.query(addQuery, function (err, result) {
      if (err) throw err
      inquirer.prompt([
        {
          name: "title",
          type: "input",
          message: "What is the title of the role?",
        }, {
          name: "salary",
          type: "input",
          message: "What is the annual salary?",
        }, {
          name: "department",
          type: "list",
          message: "To which department does this role belong?",
          choices: result
        }]).then(function (data) {
          let departmentChoice
          for (i = 0; i < result.length; i++) {
            if (result[i].name === data.department) {
              departmentChoice = result[i]
            }
          }
          // Add user's choice of department for this role into the table:
          const query = "INSERT INTO role SET ?"
          const set = {
            title: data.title,
            salary: data.salary,
            department_id: departmentChoice.id
          }
          // Display updated 'role' table:
          db.query(query, set, (err) => {
            if (err) throw err
            tracker.viewRoles()
          })
        })
    })
  },

  // To add a department to the database:
  addDepartment: () => {
    const addQuery = "SELECT * from department"
    db.query(addQuery, function (err, result) {
      if (err) throw err
      inquirer.prompt([
        {
          type: "input",
          name: "department",
          message: "What's the name of the department would you like to add?"
        }]).then(function (data) {
          // Check to see if the department already exists:
          let checkExisting
          for (i = 0; i < result.length; i++) {
            if (result[i].name === data.department) {
              checkExisting = result[i].name
            }
          }
          if (checkExisting === data.department) {
            console.log("This department already exists.")
            tracker.viewDepartments()
          } else {
          // If the department name does NOT already exist then add it to the 'department' table, then display updated 'department' table:
            const query = "INSERT INTO department SET ?"
            db.query(query, { name: data.department }, (err, result) => {
              if (err) throw err
              tracker.viewDepartments()
            })
          }
        })
    })
  },
    
  // To view all employees in the database:
  viewEmployees: () => {
    const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id"
    db.query(query, (err, result) => {
      if (err) throw err
      console.table(result)
      tracker.start()
    })
  },

  // To view all roles in the database:
  viewRoles: () => {
    const query = "SELECT * from role RIGHT JOIN department ON department_id = department.id"
    db.query(query, (err, result) => {
      if (err) throw err
      console.table(result)
      tracker.start()
    })
  },

  // To view all departments in the database:
  viewDepartments: () => {
    const query = "SELECT * from department"
    db.query(query, (err, result) => {
      if (err) throw err
      console.table(result)
      tracker.start()
    })
  },

  // To update an employee's role:
  updateEmployeeRole: () => {
    const updateQuery = "SELECT * FROM employee"
    // Create an array containing all employees:
    db.query(updateQuery, function (err, result1) {
      if (err) throw err
      let employeeArray = []
      for (i = 0; i < result1.length; i++) {
        name = result1[i].first_name + " " + result1[i].last_name
        employeeArray.push(name)
      }
      // Create an array containing all roles:
      db.query("SELECT * FROM role", function (err, result2) {
        if (err) throw err
        let roleArray = []
        for (i = 0; i < result2.length; i++) {
          role = result2[i].title
          roleArray.push(role)
        }
        inquirer.prompt([
            {
              name: "employee",
              type: "list",
              message: "Which employee would you like to change roles for?",
              choices: employeeArray
            }, {
              name: "newRole",
              type: "list",
              message: "What would you like their new role to be?",
              choices: roleArray
            }
        ]).then(function (data) {
          // Grab the employee name that matches the user's selection:
          const query1 = "SELECT * FROM employee"
          db.query(query1, (err, result3) => {
            if (err) throw err
            let employee
            for (i = 0; i < result3.length; i++) {
              if ((result3[i].first_name + " " + result3[i].last_name) === data.employee) {
                employee = result3[i]
              }
            }
            // Grab the new role that matches the user's selection:
            const query2 = "SELECT * FROM role"
            db.query(query2, (err, result4) => {
              if (err) throw err
              let role
              for (i = 0; i < result4.length; i++) {
                if (result4[i].title === data.newRole) {
                  role = result4[i]
                }
              }
              // Update the employee record with the new role and display the updated 'employee' table:
              const query3 = "UPDATE employee SET role_id = ? WHERE id = ?"
              db.query(query3, [role.id, employee.id], err => {
                if (err) throw err
                tracker.viewEmployees()
              })
            })
          })
        })
      })
    })
  }
}

// Connect to the database and run the program:
db.connect(err => {
  if (err) {
    console.error("Could not connect due to: " + err.stack)
    return
  }
  console.log("Connected at ID: " + db.threadId)
  tracker.start()
})

module.exports = tracker
