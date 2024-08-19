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
                SELECT user_id "userId",
                       first_name "firstName",
                       last_name "lastName",
                       is_customer "isCustomer",
                       email, phone
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

    async createUser(user) {

        let response;
        try {

            user = this.convertFieldsToSnakecase(user)

            response = await this.sql`
                INSERT INTO storefront.users ${this.sql(user)} 
                RETURNING user_id "userId",
                          first_name "firstName",
                          last_name "lastName",
                          is_customer "isCustomer",
                          email, phone;
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

                user = this.convertFieldsToSnakecase(user)
                const columns = Object.keys(user)

                return await this.sql`
                    UPDATE storefront.users 
                    SET ${this.sql(user, columns)}
                    WHERE user_id = ${BigInt(id)}
                    RETURNING user_id "userId", first_name "firstName", last_name "lastName", is_customer "isCustomer", email, phone
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
            // As long as the query doesn't yield an error, the requested record should not
            // exist - even if it never existed to begin with
            response = { message: `User '${userId}' removed successfully.` }
        } catch (error) {
            response = { error: `Error occurred when deleting User '${userId}': ${error.message}` }
        }

        return response
    }

    // TODO: Implement a non-hardcoded solution
    convertFieldsToSnakecase(user) {
        const updatedFields = {}
        let columns = Object.keys(user)

        for (let column of columns) {
            switch (column) {
                case 'firstName':
                    updatedFields.first_name = user[column]
                    break
                case 'lastName':
                    updatedFields.last_name = user[column]
                    break
                case 'isCustomer':
                    updatedFields.is_customer = user[column]
                    break
                default:
                    updatedFields[column] = user[column]
            }
        }
        return updatedFields
    }

}
