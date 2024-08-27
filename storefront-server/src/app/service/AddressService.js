import { DatabaseUtil } from '../util/DatabaseUtil.js'
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class AddressService {

    sql;

    constructor() {
        this.sql = DatabaseUtil.createConnection();
    }

    async getAddressWithId(id) {
        let response
        try {
            response = await this.sql`
                SELECT address_id "addressId",
                       user_id "userId",
                       line_1 "line1",
                       line_2 "line2",
                       city_or_town "cityOrTown",
                       state_or_province "stateOrProvince",
                       postal_code "postalCode",
                       is_default "isDefault",
                       country
                FROM storefront.addresses
                WHERE address_id = ${BigInt(id)};
            `
        } catch (error) {
            const errorStr = `Error occurred while getting Address with ID '${id}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async getAddressesForCustomerId(userId) {

        let response;
        try {
            response = await this.sql`
                SELECT address_id "addressId",
                       user_id "userId",
                       line_1 "line1",
                       line_2 "line2",
                       city_or_town "cityOrTown",
                       state_or_province "stateOrProvince",
                       postal_code "postalCode",
                       is_default "isDefault",
                       country
                FROM storefront.addresses
                WHERE user_id = ${BigInt(userId)}
            `
        } catch (error) {
            const errorStr = `Error occurred while getting Address for User with ID '${userId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async createAddress(address) {

        let response;
        try {
            address = convertFieldsToSnakecase(address)
            response = await this.sql`
                INSERT INTO storefront.addresses ${this.sql(address)}
                RETURNING address_id "addressId",
                          user_id "userId",
                          line_1 "line1",
                          line_2 "line2",
                          city_or_town "cityOrTown",
                          state_or_province "stateOrProvince",
                          postal_code "postalCode",
                          is_default "isDefault",
                          country
            `
        } catch (error) {
            let errorStr = `Error occurred while inserting new Address record: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async updateAddress(id, address) {

        let response
        try {
            address = convertFieldsToSnakecase(address)
            const columns = Object.keys(address)
            response =  await this.sql`
                UPDATE storefront.addresses 
                SET ${this.sql(address, columns)}
                WHERE address_id = ${BigInt(addressId)}
                RETURNING address_id "addressId",
                          user_id "userId",
                          line_1 "line1",
                          line_2 "line2",
                          city_or_town "cityOrTown",
                          state_or_province "stateOrProvince",
                          postal_code "postalCode",
                          is_default "isDefault",
                          country
            `
        } catch (error) {
            const errorStr = `Error occurred while updating Address '${id}: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }

        return response
    }

    async deleteAddress(addressId) {

        let response
        try {
            await this.sql`
                DELETE FROM storefront.addresses
                WHERE address_id = ${BigInt(addressId)}
            `
            response = { message: `Address '${addressId}' deleted successfully.` }
        } catch (error) {
            const errorStr = `Error occurred when deleting Address '${addressId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }

        return response
    }

}