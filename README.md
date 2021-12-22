# Trabajo final de BDII
## Introducción
El objetivo del proyecto es exponer una página web que pueda ser accedida desde los monitores de los colectivos de la ciudad para mostrar los lugares de interés cercanos al mismo.

El proyecto tiene 2 partes: una API, que hace uso de los datos guardados en las bases de MongoDB y Redis, y un cliente web, que muestra la información procesada por la API de una forma útil. 

Este proyecto fue realizado para la materia Bases de Datos 2 dictada en el Instituto Tecnológico de Buenos Aires en el 2021. El profesor a cargo de la materia es Diego Ariel Aizemberg (https://github.com/aaizemberg). 

## Importación de los datos
Usamos MongoDB para guardar datos espaciales de OpenStreetMap, donde se listan las ubicaciones de interés. 
Los datasets que usamos están en la carpeta data de este proyecto, pero se pueden descargar datos actualizados desde https://overpass-turbo.eu/ siguiendo las instrucciones del Anexo 1:

Para importar los datasets a MongoDB, primero tenemos que copiarlos al repo parándonos en el root de este proyecto y usando:

    docker cp datasets.zip my_mongo_container:/

Luego de entrar al contenedor usando docker exec, podemos descomprimir el .zip y tenemos nuestros datasets listos para importar. Es recomendado hacerlo dentro de un directorio nuevo dentro del contenedor. Debería verse así:

    arts_centre.json 
    cafe.json 
    fast_food.json 
    mercados.json 
    pub.json 
    bar.json 
    cinema.json  
    ice_cream.json 
    pharmacy.json 
    theatre.json

Luego, creamos una database "final" y la collection "locations" dentro de la misma.
Ahora, para cada uno de los json vamos a usar mongoimport:
        
    mongoimport --db final --collection locations --type json [NOMBRE_DEL_JSON].json --legacy --jsonArray
    
Para conseguir el token de la API de transporte del GCBA, seguir las instrucciones disponibles en https://www.buenosaires.gob.ar/desarrollourbano/transporte/apitransporte

***
## Instalacion de la API
1) Instalar node

2) Instalar los siguientes paquetes con npm i ${nombre}
    -redis
    -dotenv
    -express
    -mongo

3) Crear un archivo .env en este directorio y cargar los siguientes datos

        TRANSPORTES_CLIENT= [Su hash de cliente]
        TRANSPORTES_TOKEN= [Su token de la api]
        MONGO_DB_IP= [El host o ip de su mongo db (en nuestro caso corre en localhos, en el puerto default)]
        MONGO_DB_DATABASE=final [El nombre de su database, si sigue nuestros imports se llama asi]
        API_PORT= [El puerto en el que correra esta api]
        REDIS_HOSTNAME= [El host o ip de su redis (en nuestro caso corre en localhost)]
        REDIS_PORT= [el puerto en el que esta redis]
        REFRESH_TIME = [El tiempo en segundos que tardara en obtener las nuevas localizaciones]
        MOCK_DATA = [Setearlo 1 para usar datos autogenerados o en 0 para hacer request a la API del gobierno]

4) Correr con

        node ./index.js

***
## Instalación del cliente web

Clonar el repo https://github.com/anitacruz/PaginaBD2, o descomprimir el archivo cliente.zip en el root. Este es un proyecto Maven, y usamos un servidor Tomcat para hostearlo. 

1) Descargar Apache Tomcat 8
2) Copiar el archivo webapp.war en la raíz de este proyecto a la carpeta "webapps" del Tomcat
3) Iniciar el servidor de Tomcat corriendo startup.sh haciendo 
        
        ./PATH_TO_TOMCAT/bin/startup.sh 
    
4) Voila! Si ya iniciaste las bases de Redis y MongoDB para que se conecte la API, el Tomcat debería responder tus pedidos en localhost:8080




***
## Anexo 1

    node
        [amenity=fast_food]
        (around:40000, -34.6039112,-58.3708228);
    out;

Reemplazar la amenity fast_food por cada una de la siguiente lista:

    - arts_centre
    - bar
    - cafe
    - cinema
    - fast_food
    - ice_cream
    - mercados
    - pharmacy
    - pub
    - theatre

Luego, descargar los datos como un GeoJSON tocando 
   
    Export -> download/copy as GeoJSON

Luego

