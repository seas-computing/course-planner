import child, { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { EntitySchema } from 'typeorm';

const exec = promisify(child.exec);

export interface MockDBOptions {
  databaseName: string;
  user: string;
  password: string;
  port: number;
  containerName: string;
  entities?: (string | EntitySchema)[];
}

const defaultOptions: MockDBOptions = {
  containerName: 'testing-database',
  databaseName: 'testing',
  user: 'testuser',
  password: 'testpwd',
  port: 7654,
};

enum CONTAINER_STATE {
  DEAD,
  RUNNING,
}

export default class MockDB {
  private name: string;

  private databaseName: string;

  private user: string;

  private password: string;

  private port: number;

  private state: CONTAINER_STATE;

  private container: ChildProcess;

  public constructor(options: MockDBOptions = defaultOptions) {
    this.name = options.containerName;
    this.databaseName = options.databaseName;
    this.user = options.user;
    this.password = options.password;
    this.port = options.port;
    this.state = CONTAINER_STATE.DEAD;
    process.on('beforeExit', this.stop);
    process.on('SIGINT', this.stop);
    process.on('SIGTERM', this.stop);
  }

  public get connectionOptions(): PostgresConnectionOptions {
    if (this.state === CONTAINER_STATE.RUNNING) {
      return {
        type: 'postgres',
        database: this.databaseName,
        username: this.user,
        password: this.password,
        host: 'localhost',
        port: this.port,
      };
    }
    return null;
  }

  public get readyToConnect(): boolean {
    return this.state === CONTAINER_STATE.RUNNING;
  }

  public async init(): Promise<void> {
    if (this.state === CONTAINER_STATE.RUNNING) {
      throw new Error(`Container "${this.name}" is already running.`);
    }
    console.log('Creating database container');
    this.container = spawn(
      'docker',
      [
        'container',
        'run',
        '--name',
        this.name,
        '--publish',
        `${this.port}:5432`,
        '--env',
        `POSTGRES_DB=${this.databaseName}`,
        '--env',
        `POSTGRES_USER=${this.user}`,
        '--env',
        `POSTGRES_PASSWORD=${this.password}`,
        'postgres:10.7',
      ],
      {
        detached: true,
        shell: true,
      }
    );

    this.container.stdout.on('data', (data) => {
      if (data.toString().includes('PostgreSQL init process complete')) {
        this.state = CONTAINER_STATE.RUNNING;
      }
    });

    this.container.stderr.on('data', (data) => {
      if (data.toString().includes('Error response from daemon')) {
        throw new Error(data.toString());
      }
    });

    this.container.on('error', (err) => {
      this.state = CONTAINER_STATE.DEAD;
      throw new Error(`Failed to create database with docker. Error: ${err.message}`);
    });
  }

  public async stop(): Promise<void> {
    console.log('stop called');
    if (this.state === CONTAINER_STATE.DEAD) {
      return;
    }
    try {
      await exec(
        [
          'docker',
          'container',
          'rm',
          '--force',
          this.name,
        ].join(' ')
      );
      console.log('destroyed');
      this.state = CONTAINER_STATE.DEAD;
      return;
    } catch ({ stderr }) {
      throw new Error(`Failed to remove container with docker. Error: ${stderr}`);
    }
  }
}
