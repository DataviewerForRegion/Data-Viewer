/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Attribute model
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
module.exports.default = (sequelize, DataTypes) => {
  const Attribute = sequelize.define('Attribute', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING,
    },
    is_label: {
      type: DataTypes.BOOLEAN,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    tableName: 'dv_attribute',
  });

  Attribute.associate = (models) => {
    Attribute.belongsTo(models.Dataset, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return Attribute;
};
