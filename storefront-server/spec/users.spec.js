import postgres from "postgres";
import { UserService } from '../src/app/util/users.js'
import { Wait } from "testcontainers";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

describe('Users', () => {

    let container;
    let containerPort;
    let sql;

    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    })

    beforeAll(async () => {

        let user = "peegee";
        let password = "somepassword";
        let database = "Storefront";
        let host = "localhost";

        process.env.PGUSER = user;
        process.env.PGPASSWORD = password;
        process.env.PGDATABASE = database;
        process.env.PGHOST = host;

        container = await new PostgreSqlContainer("postgres:16.2")
            .withExposedPorts(5432)
            .withDatabase(process.env.PGDATABASE)
            .withUsername(process.env.PGUSER)
            .withEnvironment({
                POSTGRES_USER: user,
                POSTGRES_PASSWORD: password
            })
            .withLogConsumer(stream => {
                stream.on("data", line => console.log(line))
                stream.on("err", line => console.error(line))
                stream.on("end", () => console.warn("The container's log stream has closed."))
            })
            .withCopyFilesToContainer([
                {
                    target: "/docker-entrypoint-initdb.d/create_schema.sql",
                    source: "./documentation/create_schema.sql"
                }
            ])
            .withWaitStrategy(
                Wait.forSuccessfulCommand(
                    `psql -U peegee -w somepassword -d storefront -c 'SELECT * FROM Storefront.users'`
                )
            )
            .start();

        containerPort = container.getMappedPort(5432);

        process.env.PGPORT = containerPort;

        sql = postgres({
            username: user,
            password: password,
            host: host,
            port: containerPort
        })
    })

    afterAll(async () => {
        if (container) {
            container.stop()

        }

        if (sql) {
            sql.end()
        }
    })

    it('initial-test', async () => {

        debugger;
        let target = new UserService();

        sql`
            insert into Storefront.Users ("first_name", "last_name", "email", "phone") 
            values ("first", "last", "flast@email.com", "1234456789")
        `

        debugger;
        let result = await sql`SELECT * FROM Storefront.users`
        console.log(result)

        debugger;
        const returnedValues = await target.getUsersWithFirstNameLike("first_name")

        console.log(returnedValues)
        expect(returnedValues).toBeTruthy()
    })

})
