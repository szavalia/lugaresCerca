const {REDIS_HOSTNAME , REDIS_PORT } = process.env
const redis = require('redis');
const client = redis.createClient({
    host: REDIS_HOSTNAME,
    port: REDIS_PORT,
});

async function initRedis(){
    await client.connect();
    return client;
}

async function saveVehiclePositions(vehicles){
    //aumento la cant de requests a la api
    await client.incr("api_requests");
    //updateo la ultima posicion
    await client.set("last_position_request", Date.now() );

    vehicles.forEach(async (element) => {
        await client.HSET(element.id , 'lat' ,element.latitude  );
        await client.HSET(element.id , 'long' , element.longitude );
        
    });

    return vehicles;
}

async function getLocationFromId( id ){
    let exists = await client.exists(id);
    if ( exists == 0){
        return { error:1 }
    }
    let point = [];
    point.push(parseFloat(await client.hGet(id, 'lat')));
    point.push(parseFloat(await client.hGet(id, 'long')));
    return point;
}

async function getStats(){
    let stats = {}
    let last = await client.get("last_position_request")
    stats.lastRequestToApi= new Date(parseInt(last));
    stats.requestCount = await client.get("api_requests")
    stats.amenityRank = (await getAmenityCount()).reverse()
    stats.topTenPlaces = (await getPlaceCount()).reverse()
    return stats;
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

async function incAmenity(name){
    await client.zIncrBy("amenityRank" , 1 , name);
}
async function incPlace(name){
    await client.zIncrBy("placeRank" , 1 , name);
}
async function getAmenityCount(){
    return await client.ZRANGE_WITHSCORES("amenityRank" , 0 , -1);
}

async function getPlaceCount(){
    return await client.ZRANGE_WITHSCORES("placeRank" , -10 , -1 );
}

module.exports = { 
    initRedis, 
    saveVehiclePositions, 
    getStats, 
    getLocationFromId,
    incAmenity,
    incPlace
};
