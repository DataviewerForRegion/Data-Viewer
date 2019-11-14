/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Dataset model
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
module.exports = (sequelize, DataTypes) => {
  const Dataset = sequelize.define('Dataset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    projection: {
      type: DataTypes.STRING,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
    },
    url: {
      type: DataTypes.TEXT,
    },
    file_path: {
      type: DataTypes.STRING,
    },
    src_file_id: {
      type: DataTypes.INTEGER,
    },
    is_temporary: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    // freezeTableName: true
    tableName: 'dv_dataset',
  });

  Dataset.associate = (models) => {
    Dataset.hasMany(models.Attribute);
    Dataset.hasMany(models.File);
    Dataset.belongsTo(models.User);
  };
  return Dataset;
};



