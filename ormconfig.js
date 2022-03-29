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
  ssl: {
    // We don't care if the certificate isn't signed by an official CA
    rejectUnauthorized: false,
  },
  entities: ['src/server/**/*.entity.ts'],
  migrations: ['src/server/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/server/migrations',
  },
};
