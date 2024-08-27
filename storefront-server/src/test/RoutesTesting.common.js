
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
    await sql`DELETE FROM storefront.addresses`
    await sql`DELETE FROM storefront.users;`
    await sql`ALTER SEQUENCE storefront.users_user_id_seq RESTART;`
}

export function assertFieldsMatch(objectOne, objectTwo) {
    const objOneKeys = Object.keys(objectOne)
    const objTwoKeys = Object.keys(objectTwo)

    expect(objOneKeys.length).toEqual(objTwoKeys.length)
    for (const key of objOneKeys) {
        global.console.debug('RoutesTesting.common :: assertFieldsMatch:', `Comparing objOne.${key}: [${objectOne[key]}], objTwo.${key}: [${objectTwo[key]}]`)
        expect(objectOne[key]).toBeDefined()
        expect(objectOne[key]).toEqual(objectTwo[key])
    }
}

export async function insertUserRecords() {
    return await sql`
        INSERT INTO storefront.users (first_name, last_name, email, phone)
        VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
               ('Jane', 'Doe', 'janedoe@email.com', '123456789'),
               ('Jonah', 'Doe', 'jonahdoe@email.com', '192837465')
        RETURNING user_id "userId",
                  first_name "firstName",
                  last_name "lastName",
                  email, phone;
    `
}

export async function insertAddressRecords() {
    return await sql`
        INSERT INTO storefront.addresses 
            (user_id, line_1, line_2, city_or_town, state_or_province, postal_code, country, is_default)
        VALUES 
            (1, '1 Somewhere Place', null, 'Somewhereville', 'Someshire', 'SM1 2AB', 'United Kingdom', true),
            (1, '40 Business Park', 'Floor 2', 'Anothertown', 'Someshire', 'SM1 5JD', 'United Kingdom', false),
            (2, '2b Another Road', null, 'Towntown', 'Countchester', 'CD1 2EF', 'United Kingdom', true)
        RETURNING address_id "addressId",
                  user_id "userId",
                  line_1 "line1",
                  line_2 "line2",
                  city_or_town "cityOrTown",
                  state_or_province "stateOrProvince",
                  postal_code "postalCode",
                  is_default "isDefault",
                  country;
    `
}
