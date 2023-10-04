const axios = require("axios");
const { request } = require("express");
const {Router} = require("express");
const {Type} =  require("../db")

const router = Router();


router.get("/", async (req, res) => {
    try {
        //traemos de la api los tipos, los mapeamos, y por cada elemento hacemos una promise 77 del valor de la url
      let typeApi = await axios.get("https://pokeapi.co/api/v2/type");
      typeApi = typeApi.data.results.map((tipo) => axios.get(tipo.url));
        
      //creamos una variable qie nos devuelva todas las promises resueltas
      const tiposAll = await Promise.all(typeApi);
        
      //mapeamos los valores de las promises y seleccionamos el valor guardado en .name
      let tiposName = tiposAll.map((p) => {
        return p.data.name;
      });
      
      //mapeamos y hacemos un find or create en la tabla type, si no coincide, crea un nuevo elemento
      tiposName.map((tipo) => {
        Type.findOrCreate({
          where: { nombre: tipo },
        });
      });
  
      const allTypes = await Type.findAll();
      // allTypes.push({nombre:'todos',id:100})
      res.status(200).json(allTypes);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  module.exports = router;
  