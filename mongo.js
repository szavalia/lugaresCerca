const {MongoClient} = require('mongodb');
const {MONGO_DB_DATABASE , MONGO_DB_IP} = process.env;
const MONGO_DB_URL =`mongodb://${MONGO_DB_IP}/${MONGO_DB_DATABASE}`;
const clientMongo = new MongoClient(MONGO_DB_URL);
const { incAmenity , incPlace} = require('./redis.js')
let db;
let collection;

async function initMongo(){
    await clientMongo.connect();
    db = await clientMongo.db('final');
    collection = await db.collection('locations');
    return collection;
}


async function closePlaces(point , limit){
    const findResult = await collection.aggregate(
        [{
                '$geoNear': { 
                        'near': {
                            "type":"Point",
                            "coordinates": [ point[1] , point[0] ] 
                        },
                        "maxDistance" : 500,
                        "distanceField":"distance",
                }
            }
        ]
    ).limit(limit).toArray();
    let values = [];
    findResult.forEach( (place) => {
        //no es necesario que sean async, las puedo subir a la bd y listo
        values.push( {
            name : place.properties.name,
            amenity : place.properties.amenity,
            website : place.properties.website,
            point : place.geometry.coordinates.reverse(),
            distance : place.distance
        })
    });
    return values;
}
module.exports = { initMongo , closePlaces } ;