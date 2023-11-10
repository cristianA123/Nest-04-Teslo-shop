<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Modules
* Auth (JWT, Guards)
* User
* Product

# Tech Used
* Nest
* Postgres
* TypeOrm
* Docker-compose
* Typescript

# Teslo Api

1. Clonar proyecto
2. ``` npm i ```
3. clonar  el archivo ``` .env.template ``` y renombrarlo a ``` .env ```
4. Cambiar las variables de entorno
5. Levantar la base de datos
```
docker-compose up -d
```
6. Levantar: 
``` npm run start:dev ```

7. Ejecutar Seed para cargar data:

```
localhost:3000/api/seed
```
