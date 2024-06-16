import { Database } from '../database'

export class AddressService {

    sql;

    constructor() {
        this.sql = Database.createConnection();
    }

    async getAddressesForCustomerId(customerId) {
        return await this.sql`
            SELECT * 
            FROM storefront.addresses
            WHERE customer_id == ${customerId}
        `
    }

    async createAddress(address) {
        const addressId = address.address_id
        const customerId = address.customer_id

        if (addressId != null) {
            throw Error('Provided Address contains an ID.')
        }
        if (!customerId) {
            throw Error('Provided Address contains no Customer ID.')
        }

        const columns = Object.keys(address)
        const values = Object.values(address)

        return await this.sql`
            INSERT INTO storefront.addresses (${this.sql(address, columns)})
            VALUES ${this.sql(address, values)}
            RETURNING *
        `
    }

    async updateAddress({addressId, ...otherAddressFields}) {

        if (addressId == null) {
            throw Error('Provided Address does not contain an ID.')
        }

        const address = { addressId, ...otherAddressFields }
        const columns = Object.keys(address)

        return await this.sql`
            UPDATE storefront.addresses 
            SET ${this.sql(address, columns)}
            WHERE address_id = ${BigInt(addressId)}
            RETURNING *
        `
    }

    async deleteAddress(addressId) {
        await this.sql`
            DELETE FROM storefront.addresses
            WHERE address_id = ${BigInt(addressId)}
        `

    }

}