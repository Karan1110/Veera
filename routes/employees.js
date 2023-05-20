const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
// const email_verified = require("../middlewares/isMailCode");
// const config = require("config")
const Employee = require("../models/employee");
const Education = require("../models/education");
const Experience = require("../models/experience");
const Ticket = require("../models/ticket");
const Skill = require("../models/skills");
const Benefit = require("../models/benefits");
const Meeting = require("../models/meeting");
const Notification = require("../models/notifications");
const Performance = require("../models/performance.js");
const Department = require("../models/department");
const winston = require("winston");
const Sequelize = require('sequelize');
const { Op } = require("sequelize");

router.get("/average_salary", [auth, isAdmin], async (req, res) => {
  const Users = await Employee.findAll({
    attributes: {
      include: [
        [Sequelize.fn("AVG", Sequelize.col("salary")), "average_salary"],
      ],
    },
  });

  // res.status(200).send(Users.dataValues.average_salary);
  res.status(200).send(Users);
});

router.get("/statistics", [auth, isAdmin], async (req, res)=> {
  const employeeStatistics = {};

  // Performance statistics
  employeeStatistics.Employee_Performance_Below_Average = await Employee.findAll({
    include: [{
      model: Performance,
      as: 'Performance',
      where: {
        classification: 'Below Average'
      }
    }]
  });
  
  employeeStatistics.Employee_Performance_Average = await Employee.findAll({
    include: [{
      model: Performance,
      as: 'Performance',
      where: {
        classification: 'Average'
      }
    }]
  });
  
  employeeStatistics.Employee_Performance_Above_Average = await Employee.findAll({
    include: [{
      model: Performance,
      as: 'Performance',
      where: {
        classification: 'Above Average'
      }
    }]
  });
  
  // Department statistics
  
  employeeStatistics.Department = await Employee.findAll({
    include: [{
      model: Department,
      as: 'Department',
      where: {
        name: req.body.department
      }
    }]
  });
  
  employeeStatistics.Education = await Employee.findAll({
    include: [{
      model: Education,
      as: 'Education',
      where: {
        name: req.body.education_type
      }
    }]
  });
  employeeStatistics.Manager = await Employee.findAll({
    include: [{
      model: Employee,
      as: 'Employee',
      where: {
        name: req.body.manager_name
      }
    }]
  });

  employeeStatistics.Manager = await Employee.findAll({
    include: [{
      model: Employee,
      as: 'Employee',
      where: {
        name: req.body.manager_name
      }
    }]
  });



  console.log(employeeStatistics);
  

});

router.get("/", [auth, isAdmin], async (req, res) => {
  const pn = req.query.propertyName;
  const pv = req.query.propertyValue;
  
  const Users = await Employee.findAll({
    exclude  : ['password'],
    where: {
      [Op.like]: {
      pn :pv
     }
   }
  });

  res.status(200).send(Users);
});

router.get("/me", [auth, isAdmin], async (req, res) => {
  winston.info(req.user.id);
  const me = await Employee.findOne({
    where: {
      id: req.user.id,
    },
    include: [
      {
        model: Employee,
        as: "Manager",
      },
      // {
      //   model: Education,
      //   as: "Education",
      // },
      // {
      //   model: Experience,
      //   as: "Experience",
      // },
     {
       model: Notification,
       as: "Notification",
      },
      {
        model: Ticket,
        as: "Ticket",
      },
      {
        model: Skill,
        as: "Skills",
      },
      {
        model: Benefit,
        as: "Benefit",
    },
      // {
      //   model: Meeting,
      //   as: "Meeting",
      // },
     {
       model: Department,
       as: "Department"
    }
    //  {
    //    model: Performance,
    //     as: "Performance",
    //  }
    ]
  });

  res.status(200).send(me);
});

router.get("/:id", [auth, isAdmin], async (req, res) => {
  const employee = Employee.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Employee,
        as: "Manager",
      },
      // {
      //   model: Education,
      //   as: "Education",
      // },
      // {
      //   model: Experience,
      //   as: "Experience",
      // },
     {
       model: Notification,
       as: "NotificationEmployee",
      },
      // {
      //   model: Ticket,
      //   as: "Ticket",
      // },
      {
        model: Skill,
        as: "Skills",
      },
      {
        model: Benefit,
        as: "Benefit",
    },
      // {
      //   model: Meeting,
      //   as: "Meeting",
      // },
     {
       model: Department,
       as: "Department"
    }
    //  {
    //    model: Performance,
    //     as: "Performance",
    //  }
    ],
  });
  res.status(200).send(employee);
});
// performance department employee_id
router.get("/", [auth, isAdmin], async (req, res) => {
  const employee = await Employee.findAll({
    order: [["salary", "ASC"]], // Sort by name in ascending order
    offset: 10, // Skip the first 10 records
    imit: 5,
    include: [
      {
        model: Employee,
        as: "Manager",
      },
      // {
      //   model: Education,
      //   as: "Education",
      // },
      // {
      //   model: Experience,
      //   as: "Experience",
      // },
     {
       model: Notification,
       as: "NotificationEmployee",
      },
      // {
      //   model: Ticket,
      //   as: "Ticket",
      // },
      {
        model: Skill,
        as: "Skills",
      },
      {
        model: Benefit,
        as: "Benefit",
    },
      // {
      //   model: Meeting,
      //   as: "Meeting",
      // },
     {
       model: Department,
       as: "Department"
    }
    //  {
    //    model: Performance,
    //     as: "Performance",
    //  }
    ],
  });

  res.status(200).send(employee);
});

router.post("/", async(req, res) => {
  const userExists = await Employee.findOne({
    where: {
      email: req.body.email,
    }
  });

  if (!userExists) {
    winston.info("No user exists...")
  } else {
    return res.status(400).send("USER ALREADY EXISTS...");
  }

    const salt = await bcrypt.genSalt(10);
    const p = await bcrypt.hash(req.body.password, salt);

    const employee = await Employee.create({ 
      name: req.body.name,
      email: req.body.email,
      password: p,
      salary: req.body.salary,
      age: req.body.age,
      phone: req.body.phone,
      isAdmin: req.body.isadmin,
      department_id: req.body.department_id,
      manager_id: req.body.manager_id,
      education_id: req.body.education_id,
      performance_id  :req.body.performance_id
    });

    const token = employee.generateAuthToken(); 

    res.status(201).send({ token: token, Employee: employee });
});

router.put("/:propertyName", auth, [auth, isAdmin], async (req, res) => {
  const userExists = await Employee.findOne({
    where: {
      email: req.body.email,
    },
  });

  const _user = await Employee.findByPk(req.user.id);
  if (!_user) return res.status(200).send("User Not Found.");

  if (userExists) return res.status(200).send("email already in use");

  const { password } = _user.dataValues;
  const p = await bcrypt.compare(req.body.password, password);

  if (!p) return res.status(400).send("invalid credentials.");

  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash(req.body.password, salt);

  const { propertyValue } = req.body;
  const pv = req.params.propertyName;

  const user = await Employee.update(
    {
      where: {
        id: req.params.id,
      }
    },
    {
      pv  : propertyValue
    }
  );

  const token = user.generateAuthToken();

  res.header("x-auth-token", token).status(200).send(user);
});
router.put("/:id", auth, [auth, isAdmin], async (req, res) => {
  const userExists = await Employee.findOne({
    where: {
      email: req.body.email,
    },
  });

  const _user = await Employee.findByPk(req.user.id);
  if (!_user) return res.status(200).send("User Not Found.");

  if (userExists) return res.status(200).send("email already in use");

  const { password } = _user.dataValues;
  const p = await bcrypt.compare(req.body.password, password);

  if (!p) return res.status(400).send("invalid credentials.");

  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash(req.body.password, salt);

  const user = await Employee.update(
    {
      where: {
        id: req.params.id,
      }
    },
    {
      name: req.body.name,
      email: req.body.email,
      password: pw,
      isadmin: req.body.isAdmin,
    }
  );

  const token = user.generateAuthToken();

  res.header("x-auth-token", token).status(200).send(user);
});





router.delete("/:id", auth, async (req, res) => {
  const employee = await Employee.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send({ Deleted: employee });
});

module.exports = router;
