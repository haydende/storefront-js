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
            WHERe user_id = ${BigInt(id)}
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

    async updateUser(user) {

        if (user.user_id == null) {
            throw Error("Provided user has no ID!")
        }

        const columns = Object.keys(user)

        return await this.sql`
            UPDATE storefront.users 
            SET ${this.sql(user, columns)}
            WHERE user_id = ${BigInt(user.user_id)}
            RETURNING *
        `
    }

}
