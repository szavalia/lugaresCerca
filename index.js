

require('dotenv').config();
const https = require('https');
const express = require('express');
const app = express();
const {TRANSPORTES_CLIENT ,TRANSPORTES_TOKEN} = process.env;
const API_URL = `https://apitransporte.buenosaires.gob.ar/colectivos/vehiclePositionsSimple?client_id=${TRANSPORTES_CLIENT}&client_secret=${TRANSPORTES_TOKEN}`
const { initMongo , closePlaces } = require('./mongo.js');
const { initRedis , saveVehiclePositions , getStats , getLocationFromId} = require('./redis.js');
const { getVehiclesPositionsMocked } = require('./mock.js');
const { getHeapStatistics } = require('v8');
let collection;
let client;

const EXPIRE_TIME_SECONDS = 60



app.get('/', async (req , res) =>{
    let id = 90005;
    let point = await getLocationFromId(id.toString());
    let values = await closePlaces(point , 10 );
    res.send({
        vehicle: id,
        position: point,
        near: values
    });
})

app.get('/stats', async (req , res) =>{
    res.send(await getStats());
})
app.listen(5000 , () => {
    console.log('server ready on 5000') 
    }
);



runApplication();

async function cycleRun(){
    //primero levanta las posiciones
    let vehicles = await getVehiclesPositionsMocked();
    await saveVehiclePositions(vehicles);

    //levanto todo de redis
    //me fijo cual fue la ultima request
    
    //levanto los scores de cantidad de consultas
    //let scores = await client.ZRANGE_WITHSCORES("access_by_id" ,  -5 , -1 );
    //scores = scores.reverse()
   // console.log(scores)
    //reinicio el ciclo
    setTimeout(async () => {await cycleRun()} , 1000 * 60 );
}

async function runApplication(){
    client = await initRedis();
    collection = await initMongo();
    cycleRun()
    return;
    //return data;
    //instanceEventListeners(client , getVehicles);
}



async function getVehiclesPositions(){
    https.get(API_URL , async (response) =>{ 
        let data = '';
        response.on('data' , (chunk) =>{
            data+=chunk
        });
        response.on('end' , () =>{
           return JSON.parse(data);    
        });
    })
}




/*{
        "route_id": "3713",
        "latitude": -34.64024,
        "longitude": -58.5617256,
        "speed": 0.277777,
        "timestamp": 1638211270,
        "id": "1825",
        "direction": 0,
        "agency_name": "MICROOMNIBUS SAAVEDRA S.A.T.A.C.I.",
        "agency_id": 82,
        "route_short_name": "153A",
        "tip_id": "107172-1",
        "trip_headsign": "a Bº Nuevo"
    }
*/