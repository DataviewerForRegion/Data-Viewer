/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file File model
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
module.exports.default = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    is_child: {
      type: DataTypes.BOOLEAN,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
    },
  }, {
  //  freezeTableName: true
    tableName: 'dv_file',
  });
  File.associate = (models) => {
    File.belongsTo(models.Dataset, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return File;
};
