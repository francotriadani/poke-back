const { DataTypes } = require('sequelize');
//https://pokeapi.co/api/v2/pokemon/?offset=0&limit=150 
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('Pokemon', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    imagen:{
      type:DataTypes.STRING,
      allowNull: false,
    },

    vida:{
      type:DataTypes.INTEGER,
      allowNull: false,
    },

    ataque:{
      type:DataTypes.INTEGER,
      allowNull: false,
    },

    defensa:{
      type:DataTypes.INTEGER,
      allowNull: false,
    },

    velocidad:{
      type:DataTypes.INTEGER,
    },

    altura:{
      type:DataTypes.STRING,
    },

    peso:{
      type:DataTypes.STRING,
    }
  });
};
