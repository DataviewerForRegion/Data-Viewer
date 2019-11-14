/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Read all models and associate them with each other
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});
const db = {};

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
