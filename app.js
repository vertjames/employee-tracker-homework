const inquirer = require("inquirer")
const cTable = require('console.table')
const db = require('./db')

const tracker = { start: () => {
  inquirer.prompt({
    name: "selection",
    type: "list",
    message: "What would you like to do?",
    choices: ["Add an Employee", "Add a Role", "Add a Department", "View Employees", "View Roles", "View Departments", "Update Employee Role", "Exit"]
  })
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
          const query = "INSERT INTO employee SET ?"
          const set = {
            first_name: data.first_name,
            last_name: data.last_name,
            role_id: roleChoice.id
          }
          if (managerChoice === "N/A") {
            set.manager_id = "N/A"
          } else {
            set.manager_id = managerChoice
          }
          db.query(query, set, (err) => {
            if (err) throw err
            tracker.viewEmployees()
          })
        })
    })
  },

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
          const query = "INSERT INTO role SET ?"
          const set = {
            title: data.title,
            salary: data.salary,
            department_id: departmentChoice.id
          }
          db.query(query, set, (err) => {
            if (err) throw err
            tracker.viewRoles()
          })
        })
    })
  },

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
            const query = "INSERT INTO department SET ?"
            db.query(query, { name: data.department }, (err, result) => {
              if (err) throw err
              tracker.viewDepartments()
            })
          }
        })
    })
  },
    
  viewEmployees: () => {
    const query = "SELECT employee.id,first_name, last_name, title, name, salary, manager_id FROM department JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id"
    db.query(query, (err, result) => {
      if (err) throw err
      console.table(result)
      tracker.start()
    })
  },

  viewRoles: () => {
    const query = "SELECT * from role RIGHT JOIN department ON department_id = department.id"
    db.query(query, (err, result) => {
      if (err) throw err
      console.table(result)
      tracker.start()
    })
  },

  viewDepartments: () => {
    const query = "SELECT * from department"
    db.query(query, (err, result) => {
      if (err) throw err
      console.table(result)
      tracker.start()
    })
  },

  updateEmployeeRole: () => {
    const updateQuery = "SELECT * FROM employee"
    db.query(updateQuery, function (err, result1) {
      if (err) throw err
      let emptyArray = []
      for (i = 0; i < result1.length; i++) {
        name = result1[i].first_name + " " + result1[i].last_name
        emptyArray.push(name)
      }
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
              choices: emptyArray
            }, {
              name: "newRole",
              type: "list",
              message: "What would you like their new role to be?",
              choices: roleArray
            }
        ]).then(function (data) {
          const query1 = "SELECT * FROM employee"
          db.query(query1, (err, result3) => {
            if (err) throw err
            let emp
            for (i = 0; i < result3.length; i++) {
              if ((result3[i].first_name + " " + result3[i].last_name) === data.employee) {
                emp = result3[i]
              }
            }
            const query2 = "SELECT * FROM role"
            db.query(query2, (err, result4) => {
              if (err) throw err
              let role
              for (i = 0; i < result4.length; i++) {
                if (result4[i].title === data.newRole) {
                  role = result4[i]
                }
              }
              const query3 = "UPDATE employee SET role_id = ? WHERE id = ?"
              db.query(query3, [role.id, emp.id], err => {
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

db.connect(err => {
  if (err) {
    console.error("Could not connect due to: " + err.stack)
    return
  }
  console.log("Connected at ID: " + db.threadId)
  tracker.start()
})

module.exports = tracker
