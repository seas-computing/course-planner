# Course Planner

[![Travis](https://img.shields.io/travis/com/seas-computing/course-planner.svg)](https://travis-ci.com/seas-computing/course-planner)
[![Codecov](https://img.shields.io/codecov/c/gh/seas-computing/course-planner.svg)](https://codecov.io/gh/seas-computing/course-planner)
[![Documentation](https://img.shields.io/badge/docs-TypeDoc-Blue.svg)](https://seas-computing.github.io/course-planner/)
![GitHub top language](https://img.shields.io/github/languages/top/seas-computing/course-planner.svg)

## Quick Start

This setup uses `docker` and `docker-compose` for local development, as defined in `docker-compose.yml`. Installation instructions for various platforms can be found [here][docker].

1. Copy `.env-example` to `.env` (`cp .env-example .env`) and fill in the appropriate values.
1. Clone [mark-one](https://github.com/seas-computing/mark-one) to a folder beside this project - e.g:

       .
       ├── course-planner
       ├── course-planner-etl
       ├── mark-one

1. If in development, check out the develop branch:
   ```sh
   git checkout develop
   ```
1. Install the required packages:
   ```sh
   npm install
   ```
1. Start the project, run:
   ```sh
   docker-compose up
   ```
1. Run the database migrations:
   ```sh
   docker-compose exec node npm run orm -- migration:run
   ```
1. Run the database migrations generate if you have database schema changes:
   ```sh
   docker-compose exec node npm run orm -- migration:generate -n [name-of-the-migration]
   docker-compose exec node npm run orm -- migration:run
   ```
1. switch to course-planner-etl and migrate the data: 
   ```sh
   cd ../course-planner-etl
   git pull
   npm install
   npm run start
   ```

Note:
You need to remove the old data from docker volume in order to migrate new the data and schema, otherwise the old data and schema might cause issues. 

```sh
docker volume ls
docker volume rm course-planner_postgres_data
```

[docker]: https://docs.docker.com/install/
