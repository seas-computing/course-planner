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

1. To start the project, run:
   ```sh
   docker-compose up
   ```

1. Run the database migration:
   ```sh
   docker-compose exec node npm run orm -- migration:run
   ```

1. switch to course-planner-etl and migrate the data: 
   ```sh
   npm run start
   ```

Note:
For Mac user, virtual image data 9for docker) is located on ~/Library/Containers/com.docker.docker/Data/vms/0 .
Need to remove the old data from docker volume inorder to migrate new data with new schema, otherwise old data and schema might cause issues. 

```sh
$ screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty 
```
press Ctrl+a, followed by pressing k and y to kill the session.



[docker]: https://docs.docker.com/install/
