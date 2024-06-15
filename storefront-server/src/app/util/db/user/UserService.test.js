import { UserService } from './UserService.js'
import { User } from "../../../model/User.js";
import postgres from "postgres";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import console from 'console'

describe("UserService - Unit Tests", () => {

    const jestConsole = global.console
    let container;
    let containerPort;
    let sql;

    beforeAll(async () => {

        global.console = console

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
                stream.on("data", line => global.console.log(`container: ${line}`))
                stream.on("err", line => global.console.error(line))
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

        console.debug(`Attempting to connect with params:\n    username: ${user}\n    password: ${password}\n    database: ${database}\n    port: ${containerPort}`);
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
    }, 100000)

    afterAll(async () => {
        if (sql) {
            await sql.end()
        }

        if (container) {
            await container.stop()
        }

        global.console = jestConsole
    })

    beforeEach(async () => {
        await sql`DELETE FROM storefront.users;`
        await sql`ALTER SEQUENCE storefront.users_user_id_seq RESTART;`
    })

    describe("getUsersWithFirstNameLike", () => {

        it('can retrieve all users with like "first_name" value - only one record present', async () => {

            let target = new UserService();

            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone") 
                VALUES ('first', 'last', 'flast@email.com', '1234456789');
            `

            const returnedValues = await target.getUsersWithFirstNameLike("first")

            expect(returnedValues).toBeTruthy()
            expect(returnedValues).toHaveLength(1);

            let rowOne = new User(returnedValues[0]);

            expect(rowOne).toBeTruthy();
            expect(rowOne.id).toEqual("1");
            expect(rowOne.firstName).toEqual("first");
            expect(rowOne.lastName).toEqual("last");
            expect(rowOne.email).toEqual("flast@email.com");
            expect(rowOne.phone).toEqual("1234456789");
        })

        it('can retrieve all users with like "first_name" value - multiple records present, some don\'t match', async () => {

            let target = new UserService();

            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES 
                    ('Jerry', 'Jerryson', 'jjerryson@email.com', '123456789'),
                    ('Jerry', 'Johnson', 'jjohnson@email.com', '987654321'),
                    ('Terry', 'Terryson', 'tterryson@email.com', '546372819'),
                    ('Jerry', 'Jackson', 'jjackson@email.com', '918273645'),
                    ('David', 'Smith', 'dsmith@somedomain.com', null);
            `

            const returnedValues = await target.getUsersWithFirstNameLike("Jerry");

            expect(returnedValues).toBeTruthy();
            expect(returnedValues).toHaveLength(3);

            let userOne = new User(returnedValues[0]);
            expect(userOne).toBeTruthy();
            expect(userOne.id).toEqual("1");
            expect(userOne.firstName).toEqual("Jerry");

            let userTwo = new User(returnedValues[1]);
            expect(userTwo).toBeTruthy();
            expect(userTwo.id).toEqual("2");
            expect(userTwo.firstName).toEqual("Jerry");

            let userThree = new User(returnedValues[2]);
            expect(userThree).toBeTruthy();
            expect(userThree.id).toEqual("4");
            expect(userThree.firstName).toEqual("Jerry");

        })

        it('will return an empty list when no records match', async () => {

            let target = new UserService();

            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES 
                    ('Michael', 'Jones', 'mj@email.com', null),
                    ('John', 'Smith', 'smithj@email.com', null),
                    ('Heidi', 'Lawrence', 'hlaw@email.com', null);`

            const returnedValues = await target.getUsersWithFirstNameLike("Jerry");

            expect(returnedValues).toBeTruthy();
            expect(returnedValues).toHaveLength(0);
        })
    })

    describe('updateUser', () => {

        it('will update a record when not all fields are provided', async () => {

            let target = new UserService();

            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES 
                    ('Peter', 'Pan', 'pan@email.com', null),
                    ('John', 'Smith', 'jsmith@email.com', null)
            `

            const updatedUsers = await target.updateUser({user_id: 1, last_name: 'Something'});
            const updatedUser = updatedUsers[0];

            expect(updatedUser).toBeTruthy();
            expect(updatedUser.last_name).toBeTruthy()

            const returnedUsers = await target.getUserWithId(1)
            const actualUser = returnedUsers[0]

            expect(updatedUser.last_name).toEqual(actualUser.last_name)

        })

    })

    describe('createUser', () => {

        it('will create a new user when the table is empty', async () => {

            let target = new UserService()

            const newUser = {
                first_name: "Mary",
                last_name: "Jane",
                email: "mj@email.com",
                phone: "1234456789"
            }

            const insertResponse = await target.createUser(newUser)
            const savedUser = insertResponse[0]

            const queryResponse = await target.getUserWithId(savedUser.user_id)
            const actualUser = queryResponse[0]

            expect(savedUser).toEqual(actualUser)

        })

    })

    describe('deleteUser', () => {

        it('will delete a user when only an id is provided', async () => {

            let target = new UserService();

            const newUser = {
                first_name: "Mary",
                last_name: "Jane",
                email: "mj@email.com",
                phone: "1234456789"
            }

            const insertResponse = await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES (${newUser.first_name}, ${newUser.last_name}, ${newUser.email}, ${newUser.phone})
                RETURNING *
            `
            const savedUser = insertResponse[0]

            await target.deleteUser(savedUser.user_id)

            const queryResponse = await target.getUserWithId(savedUser.user_id)

            expect(queryResponse.length).toEqual(0)

        })

    })

})
