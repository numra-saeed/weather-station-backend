const Sequelize = require('sequelize');
const config = require('dotenv').config({path:'../.env'});

const sequelize = new Sequelize(process.env.POSTGRES_DBNAME, process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASS, {
  dialect: 'postgres',
  logging: false,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  pool: {
    max: Number(process.env.MAX_DB_CONNECTIONS) || 100,
    min: Number(process.env.MIN_DB_CONNECTIONS) || 50,
    idle: Number(process.env.IDLE_DB_TIME) || 10000,
    acquire: Number(process.env.ACQUIRE_DB) || 60000,
    evict: Number(process.env.EVICT_DB) || 1000
  }
});

exports.Models = async function () {

  var models = {};
  try {

    models.user = await sequelize.define('user', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      key: Sequelize.STRING
    });

    models.observations = await sequelize.define('observations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      city: Sequelize.STRING,
      timestamp: Sequelize.STRING,
      temperature: Sequelize.DECIMAL,
      humidity: Sequelize.DECIMAL,
      pressure: Sequelize.DECIMAL,
      lat: Sequelize.DECIMAL,
      lon: Sequelize.DECIMAL
    });

    return models;
  }
  catch (err) {
    return (err);
  }
}


exports.dbsync = async function () {
  try {
    let mdl = await this.Models();
    await sequelize.sync({
      force: false  //careful when setting this to true . this will override table structures and will erase data
    });
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.healthcheck = async function () {
  try {
    let data = await sequelize.query("SELECT NOW()", { type: sequelize.QueryTypes.SELECT });
    return data;

  } catch (error) {
    return new Promise((resolve, reject) => {
      return reject(error);
    })
  }
}