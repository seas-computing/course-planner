# Course Planner

[![Travis](https://img.shields.io/travis/com/seas-computing/course-planner.svg)](https://travis-ci.com/seas-computing/course-planner)
[![Codecov](https://img.shields.io/codecov/c/gh/seas-computing/course-planner.svg)](https://codecov.io/gh/seas-computing/course-planner)
[![Documentation](https://img.shields.io/badge/docs-TypeDoc-Blue.svg)](https://seas-computing.github.io/course-planner/)
![GitHub top language](https://img.shields.io/github/languages/top/seas-computing/course-planner.svg)

## Quick Start

This setup uses `docker` and `docker-compose` for local development, as defined in `docker-compose.yml`. Installation instructions for various platforms can be found [here][docker].

You'll also need to:

1. Copy `.env-example` to `.env` (`cp .env-example .env`) and fill in the appropriate values.
1. Clone [mark-one](https://github.com/seas-computing/mark-one) to a folder beside this project - e.g:

       .
       ├── course-planner
       ├── course-planner-etl
       ├── mark-one

       3 directories, 0 files

1. To start the project, run:
   ```sh
   docker-compose up
   ```

[docker]: https://docs.docker.com/install/
