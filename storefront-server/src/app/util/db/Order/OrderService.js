
import { Database } from '../database.js'

class OrderService {

    sql;

    constructor() {
        this.sql = Database.createConnection();
    }

    async getOrderWithId(orderId) {
        return await this.sql`
            SELECT * 
            FROM storefront.orders
            WHERE order_id = ${BigInt(orderId)}
        `
    }

    async createOrder({ orderId, basketId, customerId, ...otherFields }) {
        if (orderId) {
            throw new Error('Provided Order contains an ID')
        }
        if (!basketId) {
            throw new Error('Provided Order does not contain a Basket ID.')
        }
        if (!customerId) {
            throw new Error('Provided Order does not contain a Customer ID.')
        }

        const order = { basketId, customerId, ...otherFields };
        const columns = Object.keys(order)
        const values = Object.values(order)

        return this.sql`
            INSERT INTO storefront.orders (${this.sql(order, columns)})
            VALUES ${this.sql(order, values)}
            RETURNING *
        `
    }

    async updateOrder({ orderId, ...otherFields}){
        if (!orderId) {
            throw new Error('Provided Order does not contain an ID')
        }

        const order = { orderId, ...otherFields }
        const columns = Object.keys(order)

        return this.sql`
            UPDATE storefront.orders 
            SET ${this.sql(order, columns)}
            WHERE order_id = ${BigInt(orderId)}  
            RETURNING *
        `
    }

    async deleteOrder(orderId) {
        await this.sql`
            DELETE FROM storefront.orders
            WHERE order_id = ${BigInt(orderId)}
        `
    }

}