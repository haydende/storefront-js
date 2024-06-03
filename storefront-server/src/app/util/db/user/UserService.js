import { Database } from '../database.js'

export class UserService {

    sql;

    constructor() {
       this.sql = Database.createConnection();
    }

    async getUserWithId(id) {
        return await this.sql`
            SELECT * 
            FROM storefront.users
            WHERe user_id == ${id}
        `
    }

    async getUsersWithFirstNameLike(firstName) {
        return await this.sql`
            SELECT *
            FROM storefront.users
            WHERE first_name like ${firstName}
        `;
    }

    async getUsersWithLastNameLike(lastName) {
        return await this.sql`
            SELECT * 
            FROM storefront.users
            WHERE last_name like ${lastName}
        `;
    }

    async createUser({userId, firstName, lastName, email, phone}) {
        if (userId != null) {
            return await sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone") 
                VALUES ('${firstName}', '${lastName}', '${email}', '${phone}')
                RETURNING *;
            `
        } else {
            throw Error("Provided User contains an ID.")
        }
    }

}
