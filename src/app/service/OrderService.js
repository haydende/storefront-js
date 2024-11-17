
import { DatabaseUtil } from '../util/DatabaseUtil.js'
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class OrderService {

    sql;

    constructor() {
        this.sql = DatabaseUtil.createConnection();
    }

    async getOrderWithId(orderId) {
        let response
        try {
            response = await this.sql`
                SELECT order_id "orderId",
                       address_id "addressId",
                       basket_id "basketId",
                       payment_info_id "paymentInfoId"
                FROM orders
                WHERE order_id = ${BigInt(orderId)}
            `
        } catch (error) {
            const errorStr = `Error occurred when getting Order with id '${orderId}': ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async createOrder(order) {
        let response
        try {
            order = convertFieldsToSnakecase(order)
            response = await this.sql`
                INSERT INTO orders ${this.sql(order)}
                RETURNING order_id "orderId",
                          address_id "addressId",
                          basket_id "basketId",
                          payment_info_id "paymentInfoId"
            `
        } catch (error) {
            const errorStr = `Error occurred when creating new Order: ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async updateOrder(id, order){
        let response
        try {
            order = convertFieldsToSnakecase(order)
            const columns = Object.keys(order)

            response = this.sql`
                UPDATE orders 
                SET ${this.sql(order, columns)}
                WHERE order_id = ${BigInt(id)}  
                RETURNING order_id "orderId",
                          address_id "addressId",
                          basket_id "basketId",
                          payment_info_id "paymentInfoId"
            `
        } catch (error) {
            const errorStr = `Error occurred when updating Order '${id}': ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async deleteOrder(orderId) {
        let response
        try {
            await this.sql`
                DELETE FROM orders
                WHERE order_id = ${BigInt(orderId)}
            `
            response = { message: `Order '${orderId}' successfully removed` }
        } catch (error) {
            const errorStr = `Error occurred when deleting Order '${orderId}': ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

}