
import postgres from 'postgres'
import console from 'console'
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import express from 'express'

const jestConsole = global.console
let container
let containerPort

export let app
export let sql

export async function preSuiteSetup(routerImportPath, endpointPath) {
    global.console = console;

    let user = "peegee";
    let password = "somepassword";
    let database = "storefront";
    let host = "localhost";

    process.env.PGUSER = user;
    process.env.PGPASSWORD = password;
    process.env.PGDATABASE = database;
    process.env.PGHOST = host;

    container = await new PostgreSqlContainer("postgres:16.2")
        .withExposedPorts(5432)
        .withUsername(user)
        .withPassword(password)
        .withLogConsumer(stream => {
            stream.on("data", line => global.console.log(`container: ${line.trim()}`))
            stream.on("err", line => global.console.error(line.trim()))
            stream.on("end", () => global.console.log("The container's log stream has closed."))
        })
        .withCopyFilesToContainer([
            {
                target: "/docker-entrypoint-initdb.d/create_schema.sql",
                source: "./documentation/create_schema.sql"
            }
        ])
        .start();

    containerPort = container.getMappedPort(5432);
    process.env.PGPORT = containerPort;

    console.debug(
        `Attempting to connect to '${host}:${containerPort}' with params:\n`,
        `    username: ${user}\n`,
        `    password: ${password}\n`,
        `    database: ${database}\n`,
        `    port: ${containerPort}`
    );

    sql = postgres({
        username: user,
        password: password,
        database: database,
        host: host,
        port: containerPort
    });

    let retries = 0;
    const maxRetries = 50;
    const retryInterval = 2000;

    while (retries < maxRetries) {
        try {
            await sql`SELECT NOW()`;
            global.console.log(
                `PostgreSQL container successfully started with name [${container.startedTestContainer.name}] and port [${containerPort}]`
            );
            break;
        } catch (err) {
            console.log(`Oops. That didn't work! Error: ${err}`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }

    let routerImport = await import(routerImportPath)
    const router = routerImport.router

    app = express()
    app.use(endpointPath, router)
}

export async function postSuiteSetup() {
    if (sql) {
        await sql.end();
    }

    if (container) {
        await container.stop();
    }

    global.console = jestConsole;

}

export async function preTestSetup() {
    await sql`DELETE FROM storefront.users;`
    await sql`ALTER SEQUENCE storefront.users_user_id_seq RESTART;`
}

export function assertFieldsMatch(objectOne, objectTwo) {
    const objOneKeys = Object.keys(objectOne)
    const objTwoKeys = Object.keys(objectTwo)

    expect(objOneKeys.length).toEqual(objTwoKeys.length)
    for (const key of objOneKeys) {
        expect(objectOne[key]).toBeDefined()
        expect(objectOne[key]).toEqual(objectTwo[key])
    }
}
