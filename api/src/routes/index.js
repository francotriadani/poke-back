const { Router } = require('express');
const {Pokemon,Type} = require('../db');
const axios = require("axios");

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
/*router.use('/pokemons', Pokemon);
router.use('/types', Type)*/

const getPokemonsApi = async () => {

    //traemos de la api los primeros 150 resultados
    let primeraPromesa = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=151&offset=0");
    
    //si la variable, tiene .results, mapeamos, el pokemon.url de cada elemento traido
    primeraPromesa = primeraPromesa.data.results?.map((pokemon) =>axios.get(pokemon.url));
    
    //devolvemos primeroapromesa terminada
    const promesas = await Promise.all(primeraPromesa);
    console.log(promesas)
  
    //mapeamos lo elementos de la promesa, y devolvemos objetos con los  valores solicitados
    const pokemonesListos = promesas.map((p) => {
      return {
        id: p.data.id,
        nombre: p.data.name,
        vida: p.data.stats[0].base_stat,
        ataque: p.data.stats[1].base_stat,
        defensa: p.data.stats[2].base_stat,
        velocidad: p.data.stats[5].base_stat,
        altura: p.data.height,
        peso: p.data.weight,
        tipo: p.data.types.map((t) => t.type.name),
        imagen: p.data.sprites.other.home.front_default,
      };
    });
    return pokemonesListos;
  };
  
  //creamos la variable para almacenar los pokemons de la db
  const getPokemonsDB = async () => {
    let pokemonesDB = await Pokemon.findAll({ include: Type });
  
    pokemonesDB = pokemonesDB.map((poke) => {
      return {
        id: poke.id,
        nombre: poke.nombre,
        vida: poke.vida,
        ataque: poke.ataque,
        defensa: poke.defensa,
        velocidad: poke.velocidad,
        altura: poke.altura,
        peso: poke.peso,
        tipo: poke.Types.map((t) => t.nombre),
        creadoDb: poke.creadoDb,
        imagen: poke.imagen,
      };
    });
    return pokemonesDB;
  };

  //concatenamos los resultados de la api y la db
const getAllPokemons = async () => {
    const pokemonsDb = await getPokemonsDB();
    const pokemonsApi = await getPokemonsApi();
  
  const allPokemons = pokemonsDb.concat(pokemonsApi);
  
    return allPokemons;
};
  
//empezaos con las routes
router.get("/", async (req, res) => {
  try {
      //atrapamos el parametro que nos llega por query
      const { nombre } = req.query;
      let allPokemons = await getAllPokemons();
        
      //si esta el query nombre:
      /*si la variable, tiene longitud , devuelve un status 200 y envia el valor de la variable; de no ser asi, 
      envia un status 400 y envia el mensaje advirtiendo la inexistencia*/
      if (nombre) {
        let pokemonName = await allPokemons.filter((poke) =>
          poke.nombre.toLowerCase().includes(nombre.toLowerCase())
        );

        pokemonName.length
          ? res.status(200).send(pokemonName) 
          : res.status(404).send("Pokemon no encontrado");
      } else {
        //console.log(allPokemons);
        res.status(200).send(allPokemons);
      }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
  
/*GET | /pokemons/:idPokemon
    Esta ruta obtiene el detalle de un pokemon específico. Es decir que devuelve un objeto con la información pedida en el detalle de un pokemon.
    El pokemon es recibido por parámetro (ID).
    Tiene que incluir los datos del tipo de pokemon al que está asociado.
    Debe funcionar tanto para los pokemones de la API como para los de la base de datos.*/
  router.get("/:idPokemon", async (req, res) => {
  try {
    const { idPokemon } = req.params;
    
    let allPokemons = await getAllPokemons();
    
    if (!idPokemon) res.send("no mandaste un Id");

    if (idPokemon) {
      let pokemonId = await allPokemons.filter(
        (poke) => poke.id.toString() === idPokemon.toString()
      )
    
      pokemonId.length
        ? res.status(200).send(pokemonId)
        : res.status(404).send("No se encontro el Pokemon");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
  
  // Esta ruta recibirá todos los datos necesarios para crear un pokemon y relacionarlo con sus tipos solicitados.
  //Debe crear un pokemon en la base de datos, y este debe estar relacionado con sus tipos indicados (al menos uno).
router.post("/", async (req, res) => {
  //hacemos un destructuring del body
  const { id, nombre, vida, ataque, defensa, velocidad, altura, peso, imagen, tipo } =
      req.body;
      
  //hacemos un await p coincidir nombre con el nombre en nuestra bdd
  const pokemonCreado = await Pokemon.findOne({
    where: {
      nombre: nombre,
    },
  });
  
  try {
    //si el pokemon esta creado nos devuelv u status 200 y el mensje
    if (pokemonCreado) res.status(200).json("Tu pokemon ya esta creado");

    //de no ser asi, hacemos un pokemon.create
    if (!pokemonCreado) {
      const newPokemon = await Pokemon.create({
        nombre,
        vida,
        ataque,
        defensa,
        velocidad,
        altura,
        peso,
        imagen,
        });
        //creamos la variable que contenga el tipo
        let tipoDb = await Type.findAll({
          where: { nombre: tipo },});
        
        //vincular el tipo a la otra tabla
        newPokemon.addType(tipoDb);
  
        //console.log(newPokemon);
  
        res.status(201).json("¡Pokemon creado con exito!");
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });
  
  //hacer un ipdate para odificar algun pokemon creado
  router.put("/:idPokemon", async (req, res) => {
    try {
      const { idPokemon } = req.params;
      const pokemon = req.body;
  
      const pokemonModificado = await Pokemon.update(pokemon, {
        where: { id: idPokemon },
      });
  
      res.status(200).json('pokemon modificado con exito');
    } catch (error) {
      res.status(400).json({ "mensaje de error": error });
    }
  });
  
  ////creamos un delete para eliminar un pokemon 
  router.delete("/:idPokemon", async (req, res) => {
    try {
      const { idPokemon } = req.params;
      await Pokemon.destroy({ where: { id: idPokemon } });
  
      res.status(200).json({'Acabas de Borrar el pokemon con id': idPokemon});
    } catch (error) {
      res.status(400).json({ "mensaje de error": error });
    }
  });

module.exports = router;
