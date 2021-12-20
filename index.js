//const { Cipher } = require('crypto');
//const { response } = require('express');
const https = require('https');
//const redis = require('./redis.js');
const redis = require('redis');
const client = redis.createClient();
const TRANSPORTES_CLIENT = "b69c441fb3d44c38a9e534852e49c8da"
const TRANSPORTES_TOKEN = "E739cD458Bb64A8eAC0416c9Ab066c1b"
const API_URL = `https://apitransporte.buenosaires.gob.ar/colectivos/vehiclePositionsSimple?client_id=${TRANSPORTES_CLIENT}&client_secret=${TRANSPORTES_TOKEN}`
const EXPIRE_TIME_SECONDS = 60
runApplication();

async function runApplication(){
    await client.connect();   
    await client.set("test" , "Se seteo esta variable en tu redis" );
    await getVehiclesPositionsFaked();
    await getFromRedisAllFaked();
    return;
    //return data;
    //instanceEventListeners(client , getVehicles);
}


async function saveVehiclePositions(vehicles){
    console.log(vehicles);
    vehicles.forEach(async (element) => {
        console.log("------------")
        console.log(`vehicleId=${element.id}`);
        console.log(`latitude=${element.latitude}`);
        console.log(`longitude=${element.longitude}`);
        await client.HSET(element.id , 'lat' ,element.latitude  );
        await client.HSET(element.id , 'long' , element.longitude );
    });
    return vehicles;
}

async function getVehiclesPositionsFaked(){
        let array = []
        for( let i = 0 ; i<1000 ; i++)
        {
            array.push({
                id: (90000+i).toString(),
                latitude: -34.0 + i/100,
                longitude: -54.0 + i/100
            })
            
        }
        await saveVehiclePositions(array);
        return 
} 



async function getVehiclesPositions(){
    https.get(API_URL , async (response) =>{ 
        let data = '';
        response.on('data' , (chunk) =>{
            data+=chunk
        });
        response.on('end' , () =>{
           return saveVehiclePositions(JSON.parse(data));    
        });
    })
}

async function getFromRedisAllFaked(){
    for( let i = 0 ; i<1000 ; i++)
    {
        let lat = await client.hGet((90000+i).toString() , 'lat' );
        let long =  await client.hGet((90000+i).toString() , 'long' );
        console.log(`id:${(90000+i)}`);
        console.log(`lat:${lat}`);
        console.log(`long:${long}`);
        console.log(`-----------`);
    }
}





/*
function instanceEventListeners(conn , callback) {
   
    conn.on('end', () => {
        console.log('disconnected');
    });
    conn.on('reconnecting', () => {
        console.log('reconnecting');
    });
    conn.on('error', (err) => {
        console.log('error ', { err });
    });
    conn.on('connect', () => {
        console.log('connected to redis');
        callback();
    });
}*/



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