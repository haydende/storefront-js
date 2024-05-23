import postgres from "postgres";
import { UserService } from './users.js'
import { PostgreSqlContainer } from "@testcontainers/postgresql";

describe("UserService - Unit Tests", () => {

    let container;
    let containerPort;
    let sql;

    beforeAll(async () => {

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
            .start();

        containerPort = container.getMappedPort(5432);

        process.env.PGPORT = containerPort;

        console.log(`Attempting to connect with params:\n   username: ${user}\n   password: ${password}\n   database: ${database}`);
        sql = postgres({
            username: user,
            password: password,
            database: database,
            host: host,
            port: containerPort
        })

        let retries = 0;
        const maxRetries = 50;
        const retryInterval = 2000;

        while (retries < maxRetries) {
            try {
                await sql`SELECT NOW()`;
                console.log("It worked!");
                break;
            } catch (err) {
                console.log(`Oops. That didn't work! Error: ${err}`);
                retries++;
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }
    }, 100000)

    afterAll(async () => {
        if (sql) {
            await sql.end()
        }

        if (container) {
            await container.stop()

        }
    })

    it('can retrieve all users from the users table', async () => {

        // Given we have the UserService created
        let target = new UserService();

        // and we insert a new user to the database
        await sql`
            insert into storefront.users ("first_name", "last_name", "email", "phone") 
            values ('first', 'last', 'flast@email.com', '1234456789')
        `

        const returnedValues = await target.getUsersWithFirstNameLike("first")

        expect(returnedValues).toBeTruthy()
        expect(returnedValues).toHaveLength(1);

        let rowOne = returnedValues[0];

        expect(rowOne).toBeTruthy();
        expect(rowOne.user_id).toEqual("1");
        expect(rowOne.first_name).toEqual("first");
        expect(rowOne.last_name).toEqual("last");
        expect(rowOne.email).toEqual("flast@email.com");
        expect(rowOne.phone).toEqual("1234456789");
    })

})
