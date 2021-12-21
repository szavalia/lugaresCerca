//const { Cipher } = require('crypto');
//const { response } = require('express');
require('dotenv').config();
const { timeStamp } = require('console');
const https = require('https');
const redis = require('redis');
const client = redis.createClient();
const {MongoClient} = require('mongodb');

const {TRANSPORTES_CLIENT ,TRANSPORTES_TOKEN , MONGO_DB_DATABASE , MONGO_DB_IP} = process.env;

const API_URL = `https://apitransporte.buenosaires.gob.ar/colectivos/vehiclePositionsSimple?client_id=${TRANSPORTES_CLIENT}&client_secret=${TRANSPORTES_TOKEN}`
const MONGO_DB_URL =`mongodb://${MONGO_DB_IP}/${MONGO_DB_DATABASE}`;


const clientMongo = new MongoClient(MONGO_DB_URL);
let db;
let collection;

const EXPIRE_TIME_SECONDS = 60
runApplication();
async function cycleRun(){
    await getVehiclesPositionsFaked();
    await client.incr("api_requests");
    await client.set("last_position_request", Date.now() );
    await getFromRedisAllFaked();
    let last = await client.get("last_position_request")
    let time = new Date(parseInt(last));
    console.log(`last:${last}`)
    console.log(`last_date:${time}`)
    let scores = await client.ZRANGE_WITHSCORES("access_by_id" ,  -5 , -1 ,   );
    scores = scores.reverse()
    console.log(scores)
    setTimeout(async () => {await cycleRun()} , 1000 * 60 );
}

async function runApplication(){
    //redis
    await client.connect();   
    await client.set("test" , "Se seteo esta variable en tu redis" );
    //mongo
    await clientMongo.connect();
    db = await clientMongo.db('final');
    collection = await db.collection('locations');
    const findResult = await collection.find({
        '$geoWithin': { 
            '$center': [ [-54 , -34 ] , 200 ]
        }
    }).limit(5).toArray();
    //
    console.log(findResult);
    console.log("Eran " + findResult.length);
    //cycleRun()
    return;
    //return data;
    //instanceEventListeners(client , getVehicles);
}

async function getFromRedisAllFaked(){
    for( let i = 0 ; i<1000 ; i++)
    {
        await client.incr("access_total")
        await client.zIncrBy("access_by_id" , 90000-i , (90000+i).toString());
        let lat = await client.hGet((90000+i).toString() , 'lat' );
        let long =  await client.hGet((90000+i).toString() , 'long' );
        console.log(`id:${(90000+i)}`);
        console.log(`lat:${lat}`);
        console.log(`long:${long}`);
        console.log(`-----------`);
    }
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