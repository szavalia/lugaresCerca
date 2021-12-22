
const center = [-34.607070 , -58.456949 ]
const left = [-34.593922 , -58.5221863] //left
const bottom = [-34.55413 , -58.422731] //bottom
const deltaLat = Math.abs(center[0]- bottom[0]);
const deltaLong = Math.abs(center[1] - left[1]);

function generateRandomNumber( min , max) {
    return highlightedNumber = Math.random() * (max - min) + min;
};

function simLat(){
    let delta = generateRandomNumber(0 , deltaLat );
    if( Math.random < 0.5 ){
        delta = -delta;
    }
    return center[0] + delta;
}

function simLong(){
    let delta = generateRandomNumber(0 , deltaLong );
    if( Math.random < 0.5 ){
        delta = -delta;
    }
    return center[1] + delta;
}


async function getVehiclesPositionsMocked(){
    let array = []
    for( let i = 0 ; i<1000 ; i++)
    {
        array.push({
            id: (90000+i).toString(),
            latitude: simLat(),
            longitude: simLong()
        })
    }
    return array;
} 

module.exports = {getVehiclesPositionsMocked}