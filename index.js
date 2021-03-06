

require('dotenv').config();
const https = require('https');
const express = require('express');
const app = express();
const {TRANSPORTES_CLIENT ,TRANSPORTES_TOKEN , API_PORT , REFRESH_TIME , MOCK_DATA} = process.env;
const API_URL = `https://apitransporte.buenosaires.gob.ar/colectivos/vehiclePositionsSimple?client_id=${TRANSPORTES_CLIENT}&client_secret=${TRANSPORTES_TOKEN}`
const { initMongo , closePlaces } = require('./mongo.js');
const { getVehiclesPositionsMocked } = require('./mock.js');
const { initRedis , saveVehiclePositions , getStats , getLocationFromId, incPlace, incAmenity} = require('./redis.js');
let collection;
let client;

app.get('/:id', async (req , res) =>{
    let id = req.params.id;
    let point = await getLocationFromId(id.toString());
    if( point.error){
        res.send({
        error: 1,
        description: 'vehicle id not found'
        })
    }
    else{
        let values = await closePlaces(point , 3 );
        res.send({
            vehicleId: id,
            position: point,
            near: values
        });
        values.forEach( async (value) => {
            if(value.name){
                await incPlace(value.name);
            }
            if(value.amenity){
                await incAmenity(value.amenity)
            }
        });
    }
})

app.get('/app/stats', async (req , res) =>{
    res.send(await getStats());
})

app.listen(API_PORT , () => {
    console.log(`server ready on ${API_PORT}`) 
    }
);

if(MOCK_DATA == 1 ){
    console.log('Data simulation is ON')
}else{
    
    console.log('Data simulation is OFF , requesting to API')
}


runApplication();

async function cycleRun(){
    let vehicles = [];
    //primero levanta las posiciones
    if( MOCK_DATA == 1 ){
        vehicles = await getVehiclesPositionsMocked();
    }else{
        vehicles = await getVehiclesPositions();
    }
    //manejo todo lo que es subir al redis la data
    await saveVehiclePositions(vehicles);

    setTimeout(async () => {await cycleRun()} , 1000 * REFRESH_TIME );
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
        "trip_headsign": "a B?? Nuevo"
    }
*/