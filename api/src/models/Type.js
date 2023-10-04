const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    // defino el modelo
    sequelize.define('Type', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      nombre: {
        type:DataTypes.STRING,
        allowNull: false,
      }
    });
  };
  