import postgres from 'postgres';
import console from 'console';
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import express from "express";
import supertest from "supertest";

describe('User Route Integration Tests', () => {

    const jestConsole = global.console
    let container;
    let containerPort;
    let sql;
    let userRouter;

    beforeAll(async () => {
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

        let userRouteImport = await import("./UserRoute.js")
        userRouter = userRouteImport.userRouter
    }, 100000)

    beforeEach(async () => {
        await sql`DELETE FROM storefront.users;`
        await sql`ALTER SEQUENCE storefront.users_user_id_seq RESTART;`
    })

    afterAll(async () => {
        if (sql) {
            await sql.end();
        }

        if (container) {
            await container.stop();
        }

        global.console = jestConsole;
    })

    describe('GET /users/id', () => {

        it('will return the User with the matching ID', async () => {

            const statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone) 
                VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
                       ('Jane', 'Doe', 'janedoe@email.com', '123456789')
                RETURNING *;
            `

            let userOne = statementResponse[0]
            let userTwo = statementResponse[1]

            const app = express()
            app.use('/users', userRouter)

            const response = await supertest(app)
                .get(`/users/${userOne.user_id}`)
                .send()

            const body = response.body
            expect(body.user_id).toBe(userOne.user_id)
            expect(body.first_name).toBe(userOne.first_name)
            expect(body.last_name).toBe(userOne.last_name)
            expect(body.email).toBe(userOne.email)
            expect(body.phone).toBe(userOne.phone)
        })

        it('will return a 404 response when no Users exist', async () => {

            const app = express()
            app.use('/users', userRouter)

            const response = await supertest(app)
                .get('/users/2')
                .send()

            expect(response.statusCode).toBe(404);

        })

        it('will return a 404 response when no matching Users exist', async () => {

            const statementResponse = await sql`
                INSERT INTO storefront.users (first_name, last_name, email, phone) 
                VALUES ('John', 'Doe', 'johndoe@email.com', '987654321'),
                       ('Jane', 'Doe', 'janedoe@email.com', '123456789')
                RETURNING *;
            `

            const app = express()
            app.use('/users', userRouter)

            const response = await supertest(app)
                .get('/users/5')
                .send()

            expect(response.statusCode).toBe(404);

        })

    })

})