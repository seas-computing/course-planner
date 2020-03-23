import child, { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

/**
 * Wraps Node's exec function for a promise interface
 */
const exec = promisify(child.exec);

/**
 *  Options that can be passed to an instance of the mock database, setting
 *  details like port, user/password, and container name.
 */
export interface MockDBOptions {
  databaseName: string;
  user: string;
  password: string;
  port: number;
  containerName: string;
}


/**
 * Reasonable defaults for creating a testing db container. In cases where you
 * would need multiple containers running, each would need a different name and
 * port, at a minimum.
 */
const defaultOptions: MockDBOptions = {
  containerName: 'testing-database',
  databaseName: 'testing',
  user: 'testuser',
  password: 'testpwd',
  port: 7654,
};

/**
 * In this implementation, our container is only either running or dead, but
 * in the future we may want to add the functionality to start/stop the
 * container, so an enum makes that easier than an isRunning boolean.
 */
enum CONTAINER_STATE {
  DEAD,
  RUNNING,
}


/**
 * Provides a simple API for starting and stopping a single database container,
 * using Node's child_process API to pass commands to the docker CLI. As such,
 * this requires docker to be running on the machine, and requires the parent
 * of the node process to have permission to interact with it.
 */
export default class MockDB {
  /** A name for identifying the container */
  private name: string;

  /** A name for the database inside the container */
  private databaseName: string;

  /** The user account who will own the database */
  private user: string;

  /** The password for the user account */
  private password: string;

  /** The external port which will forward to 5432 */
  private port: number;

  /** Whether the container is running or dead */
  private state: CONTAINER_STATE;

  /** A reference to the running child_process attached to the container */
  private container: ChildProcess;

  public constructor(options: MockDBOptions = defaultOptions) {
    this.name = options.containerName;
    this.databaseName = options.databaseName;
    this.user = options.user;
    this.password = options.password;
    this.port = options.port;
    this.state = CONTAINER_STATE.DEAD;
    // Adds listeners for the Node process events to clean up the container
    // if the test run stops unexpectedly.
    process.on('beforeExit', this.stop);
    process.on('SIGINT', this.stop);
    process.on('SIGTERM', this.stop);
  }

  /**
   * Outputs the basic connection parameters needed to connect to the database
   * from TypeORM. Formatted to be passed into the contstructor of the
   * [[ConfigService]]
   */
  public get connectionEnv(): { [key: string]: string } {
    if (this.state === CONTAINER_STATE.RUNNING) {
      return {
        DB_DATABASE: this.databaseName,
        DB_USERNAME: this.user,
        DB_PASSWORD: this.password,
        DB_HOSTNAME: 'localhost',
        DB_PORT: this.port.toString(),
      };
    }
    return null;
  }

  /**
   * Spawns a child process attached to the call to 'container run'.
   * @returns {Promise} resolves once the container is running, or rejects
   *                    if there is an error.
   */
  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.state === CONTAINER_STATE.RUNNING) {
        reject(new Error(`Container "${this.name}" is already running.`));
      }
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
        // The postgres container will stop and restart once after setting up
        // the initial user and database. So we need to wait for this message
        // to appear before it's ready to accept connections
        if (data.toString().includes('PostgreSQL init process complete')) {
          this.state = CONTAINER_STATE.RUNNING;
          resolve();
        }
      });

      this.container.stderr.on('data', (data) => {
        // Errors from the postgres process inside the container will be
        // written to stderr, but won't be flagged as Error events, so we need
        // to watch for them here and reject
        if (data.toString().includes('Error response from daemon')) {
          reject(new Error(data.toString()));
        }
      });

      this.container.on('error', (err) => {
        // Handles errors thrown by the docker command, rather than the postgres process
        this.state = CONTAINER_STATE.DEAD;
        reject(new Error(`Failed to create database with docker. Error: ${err.message}`));
      });
    });
  }

  /**
   * stops the running container 'docker container stop'.
   * @returns {Promise} resolves once the container is stopped, or rejects
   *                    if there is an error stopping it
   */
  public async stop(): Promise<void> {
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
      this.state = CONTAINER_STATE.DEAD;
      return;
    } catch ({ stderr }) {
      throw new Error(`Failed to remove container with docker. Error: ${stderr}`);
    }
  }
}
