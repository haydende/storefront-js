import { sql } from '../src/app/util/database.js'
import { getUsersWithFirstNameLike } from '../src/app/util/users.js'
import { GenericContainer } from "testcontainers";

describe('Users', () => {

    let container;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
        container = await new GenericContainer("postgres:16.2")
            .withExposedPorts(5432)
            .withEnvironment({
                POSTGRES_PASSWORD: "somepassword"
            })
            .start();
    })

    afterAll(async () => {
        container.stop()
    })

    it('initial-test', () => {

        sql`
            insert into Storefront.Users ("first_name", "last_name", "email", "phone") 
            values ("first", "last", "flast@email.com", "1234456789")
        `

        expect(false).toBeTruthy()
    })

})
