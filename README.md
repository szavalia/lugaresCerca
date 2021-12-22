# bd2
Trabajo final de BDII


# Instalacion de la API
1-Instalar node
2-Instalar los siguientes paquetes con npm i ${nombre}
    -redis
    -dotenv
    -express
    -mongo
3-Crear un archivo .env en este directorio y cargar los siguientes datos
    TRANSPORTES_CLIENT= //su hash de cliente
    TRANSPORTES_TOKEN= //su token de la api
    MONGO_DB_IP= //el host o ip de su mongo db (en nuestro caso corre en localhos, en el puerto default)
    MONGO_DB_DATABASE=final //el nombre de su database , si sigue nuestros imports se llama asi
    API_PORT= //el puerto en el que correra esta api
    REDIS_HOSTNAME= //el host o ip de su redis (en nuestro caso corre en localhost)
    REDIS_PORT= //el puerto en el que esta redis 
    REFRESH_TIME = //el tiempo en segundos que tardara en obtener las nuevas localizaciones
    MOCK_DATA = // flag -> 1 para usar datos generados, -> 0 para hacer request a la API del gobierno
4- Correr con node ./index.js