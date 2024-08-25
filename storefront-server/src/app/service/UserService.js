import { DatabaseUtil } from '../util/DatabaseUtil.js'
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class UserService {

    sql;

    constructor() {
       this.sql = DatabaseUtil.createConnection();
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
            const errorStr = `Error occurred while getting User with ID '${id}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async createUser(user) {

        let response;
        try {
            user = convertFieldsToSnakecase(user)
            response = await this.sql`
                INSERT INTO storefront.users ${this.sql(user)} 
                RETURNING user_id "userId",
                          first_name "firstName",
                          last_name "lastName",
                          is_customer "isCustomer",
                          email, phone;
            `
        } catch (error) {
            const errorStr  = `Error occurred when inserting new User record: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async updateUser(id, user) {

        let response;
        try {
            user = convertFieldsToSnakecase(user)
            const columns = Object.keys(user)
            return await this.sql`
                UPDATE storefront.users
                SET ${this.sql(user, columns)}
                WHERE user_id = ${BigInt(id)}
                RETURNING user_id "userId",
                          first_name "firstName",
                          last_name "lastName",
                          is_customer "isCustomer",
                          email, phone
            `
        } catch (error) {
            const errorStr = `Error occurred when updating User '${id}: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
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
            const errorStr = `Error occurred when deleting User '${userId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }

        return response
    }


}
