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
            WHERE user_id = ${BigInt(id)}
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

    async createUser({user_id, first_name, last_name, email, phone}) {

        if (user_id != null) {
            throw Error("Provided User contains an ID.")
        }

        return await this.sql`
                INSERT INTO storefront.users ("first_name", "last_name", "email", "phone") 
                VALUES (${first_name}, ${last_name}, ${email}, ${phone})
                RETURNING *;
            `
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

    async deleteUser(userId) {
        await this.sql`
            DELETE FROM storefront.users
            WHERE user_id = ${BigInt(userId)}
        `
    }

}
