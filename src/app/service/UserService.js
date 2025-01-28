import { DatabaseUtil } from '../util/DatabaseUtil.js'
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class UserService {

    sql;

    constructor() {
       this.sql = DatabaseUtil.createConnection();
    }

    async loginUser(email, password) {
        let response
        try {
            response = await this.sql`
                SELECT user_id "userId",
                       email,
                       password
                FROM users
                WHERE email = ${email} AND password = ${password};
            `
        } catch (error) {
            const errorStr = `Error occurred while checking credentials for user with email: ${email}: ${error}`
            console.error(errorStr)
            return error
        }
        return response[0] != null
    }

    async getUserWithId(id) {

        let response;
        try {
            response = await this.sql`
                SELECT user_id "userId",
                       first_name "firstName",
                       last_name "lastName",
                       is_customer "isCustomer",
                       profile_pic_base64 "profilePic",
                       email, phone
                FROM users
                WHERE user_id = ${BigInt(id)}
            `
        } catch (error) {
            const errorStr = `Error occurred while getting User with ID '${id}': ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async createUser(user) {

        let response;
        try {
            user = convertFieldsToSnakecase(user)
            response = await this.sql`
                INSERT INTO users ${this.sql(user)} 
                RETURNING user_id "userId",
                          first_name "firstName",
                          last_name "lastName",
                          is_customer "isCustomer",
                          profile_pic_base64 "profilePic",
                          email, phone;
            `
        } catch (error) {
            const errorStr  = `Error occurred when inserting new User record: ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async updateUser(id, user) {

        let response;
        try {
            user = convertFieldsToSnakecase(user)
            const columns = Object.keys(user)
            return await this.sql`
                UPDATE users
                SET ${this.sql(user, columns)}
                WHERE user_id = ${BigInt(id)}
                RETURNING user_id "userId",
                          first_name "firstName",
                          last_name "lastName",
                          is_customer "isCustomer",
                          profile_pic_base64 "profilePic",
                          email, phone
            `
        } catch (error) {
            const errorStr = `Error occurred when updating User '${id}: ${error.message}`
            console.error(errorStr)
            response = error
        }

        return response
    }

    async deleteUser(userId) {

        let response;
        try {
            await this.sql`
                DELETE FROM users
                WHERE user_id = ${BigInt(userId)}
            `
            // As long as the query doesn't yield an error, the requested record should not
            // exist - even if it never existed to begin with
            response = { message: `User '${userId}' removed successfully.` }
        } catch (error) {
            const errorStr = `Error occurred when deleting User '${userId}': ${error.message}`
            console.error(errorStr)
            response = error
        }

        return response
    }


}
