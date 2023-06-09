const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const isadmin = require("../middlewares/isadmin");
const Employee = require("../models/employee");
const Skill = require("../models/skills");
const EmployeeSkill = require("../models/intermediate models/EmployeeSkill");

router.post("/", [auth, isadmin], async (req, res) => {
  const { skill_id, employee_id } = req.body;

  let skill;
  if (!skill_id) {
    skill = await Skill.create({
      name: req.body.name,
      level: req.body.level,
    });
  } else {
    skill = await Skill.findByPk(skill_id);
  }

  const employee = await Employee.findByPk(employee_id);
  if (!employee) return res.status(400).send("User not found");

  winston.info(skill.dataValues.id, employee.dataValues.id);

  await EmployeeSkill.create({
    employee_id: employee.dataValues.id,
    skill_id: skill.dataValues.id,
  });

  res.status(200).send(skill);
});

router.put("/:id", [auth, isadmin], async (req, res) => {
  const skill = Skill.update(
    {
      where: {
        id: req.params.id,
      },
    },
    {
      name: req.body.name,
      level: req.body.level,
    }
  );

  res.status(200).send(skill);
});

router.delete("/:id", [auth, isadmin], async (req, res) => {
  await Skill.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send("Deleted successfully");
});

module.exports = router;
