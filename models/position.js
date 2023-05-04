const Sequelize = require('sequelize');
const db = require('../config/database');
const department = require('./department');

const Position = db.define('Position', {
  name  : Sequelize.STRING
}, {
    indexes : [name]
});

Position.hasOne(department);
Position.belongsTo(department);

Position.sync().then(() => {
  winston.info('Position table created');
});

module.exports = Position;