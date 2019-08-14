const {
  DB_HOSTNAME,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
} = process.env;

module.exports = {
  type: 'postgres',
  host: DB_HOSTNAME,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  migrations: ['src/server/migrations/*.ts'],
  entities: ['src/server/entities/*.entity.ts'],
  cli: {
    entitiesDir: 'src/server/entities',
    migrationsDir: 'src/server/migrations',
  },
};
