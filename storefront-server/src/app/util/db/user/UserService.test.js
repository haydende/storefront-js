import postgres from "postgres";
import { UserService } from './UserService.js'
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import {User} from "../../../model/User.js";

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
                stream.on("end", () => console.log("The container's log stream has closed."))
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

    beforeEach(async () => {
        await sql`DELETE FROM storefront.users;`
        await sql`ALTER SEQUENCE storefront.users_user_id_seq RESTART;`
    })

    describe("getUsersWithFirstNameLike", () => {

        it('can retrieve all users with like "first_name" value - only one record present', async () => {

            // Given...
            // ...we have the UserService created
            let target = new UserService();

            // ...we insert a new user to the database
            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone") 
                VALUES ('first', 'last', 'flast@email.com', '1234456789');
            `

            // When...
            // ...we use the UserService to get all users with "first_name" like 'first'
            const returnedValues = await target.getUsersWithFirstNameLike("first")

            // Then...
            // ...we verify the records that have been returned
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

            // Given...
            // ...we initialise the UserService
            let target = new UserService();

            // ...we insert a set of users into the database
            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES 
                    ('Jerry', 'Jerryson', 'jjerryson@email.com', '123456789'),
                    ('Jerry', 'Johnson', 'jjohnson@email.com', '987654321'),
                    ('Terry', 'Terryson', 'tterryson@email.com', '546372819'),
                    ('Jerry', 'Jackson', 'jjackson@email.com', '918273645'),
                    ('David', 'Smith', 'dsmith@somedomain.com', null);
            `

            // When...
            // ...we use the UserService to get all users with "first_name" like 'Jerry'
            const returnedValues = await target.getUsersWithFirstNameLike("Jerry");

            // Then...
            // ...we verify the records that have been returned
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

            // Given...
            // ...we initialise the UserService
            let target = new UserService();

            // ...we insert a set of users into the database
            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES 
                    ('Michael', 'Jones', 'mj@email.com', null),
                    ('John', 'Smith', 'smithj@email.com', null),
                    ('Heidi', 'Lawrence', 'hlaw@email.com', null);`

            // When...
            // ...we use the UserService to get all users with "first_name" like 'Jerry'
            const returnedValues = await target.getUsersWithFirstNameLike("Jerry");

            // Then...
            // ...we verify that an empty list is returned, as no records match the criteria
            expect(returnedValues).toBeTruthy();
            expect(returnedValues).toHaveLength(0);
        })

        it('will update a record when an incomplete object is passed', async () => {

            // Given...
            // ...we initialise the UserService
            let target = new UserService();

            // ...we insert a set of users into the database
            await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone")
                VALUES 
                    ('Peter', 'Pan', 'pan@email.com', null),
                    ('John', 'Smith', 'jsmith@email.com', null)
            `

            // When...
            // ...we use the UserService to update the user with an ID of 1
            const updatedUsers = await target.updateUser({user_id: 1, first_name: 'Something'});
            const updatedUser = updatedUsers[0];

            // Then...
            // ...we make sure the statement has returned an updated User
            expect(updatedUser).toBeTruthy();
            expect(updatedUser.first_name).toBeTruthy()

            // ...we retrieve the User from the database again, for reference
            const returnedUsers = await target.getUserWithId(1)
            const actualUser = returnedUsers[0]

            // ...we compare the 'first_name' field for both
            expect(updatedUser.first_name).toEqual(actualUser.first_name)

        })
    })

})
