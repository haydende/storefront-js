import { Database } from '../database.js'

export class UserService {

    sql;

    constructor() {
       this.sql = Database.createConnection();
    }

    async getUserWithId(id) {
        let response;

        try {
            response = await this.sql`
                SELECT * 
                FROM storefront.users
                WHERE user_id = ${BigInt(id)}
            `
        } catch (error) {
            let errorStr = `Error occurred while getting User with ID '${id}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr}
        }
        return response
    }

    async createUser({firstName, lastName, email, phone}) {

        let response;
        try {
            response = await this.sql`
                    INSERT INTO storefront.users ("first_name", "last_name", "email", "phone") 
                    VALUES (${firstName}, ${lastName}, ${email}, ${phone})
                    RETURNING *;
                `
        } catch (error) {
            response = { error: `Error occurred when inserting new User record: ${error.message}`}
        }
        return response
    }

    async updateUser(id, user) {

        let response;
        if (id) {
            try {
                const columns = Object.keys(user)

                return await this.sql`
                    UPDATE storefront.users 
                    SET ${this.sql(user, columns)}
                    WHERE user_id = ${BigInt(id)}
                    RETURNING *
                `
            } catch (error) {
                response = { error: `Error occurred when updating User '${id}: ${error.message}` }
            }
        } else {
            response = { error: 'Provided User has no ID!' };
        }

        return response
    }

    async deleteUser(userId) {

        let response;
        try {
            await this.sql`
                DELETE FROM storefront.users
                WHERE user_id = ${BigInt(userId)}
            `
            response = { message: `User '${userId}' removed successfully.` }
        } catch (error) {
            response = { error: `Error occurred when deleting User '${userId}': ${error.message}` }
        }

        return response
    }

}
