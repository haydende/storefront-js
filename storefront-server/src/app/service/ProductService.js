import { DatabaseUtil } from "../util/DatabaseUtil.js";
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class ProductService {

    sql

    constructor() {
        this.sql = DatabaseUtil.createConnection()
    }

    async getProductWithId(productId) {
        let response
        try {
            response = await this.sql`
                SELECT product_id "productId", name, brand,
                       description, price, quantity
                FROM products
                WHERE product_id = ${BigInt(productId)};
            `
        } catch (error) {
            const errorStr = `Error occurred while getting Product with ID '${productId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async createProduct(product) {

        let response
        try {
            product = convertFieldsToSnakecase(product)
            response = await this.sql`
                INSERT INTO products (${this.sql(product)})
                RETURNING product_id "productId", name, brand,
                          description, price, quantity;
            `
        } catch (error) {
            const errorStr = `Error occurred when inserting a new Product record: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async updateProduct(id, product) {

        let response
        try {
            product = convertFieldsToSnakecase(product)
            const columns = Object.keys(product)
            response = await this.sql`
                UPDATE products 
                SET ${this.sql(product, columns)}
                WHERE product_id = ${BigInt(id)}
                RETURNING product_id "productId", name, brand,
                          description, price, quantity;
            `
        } catch (error) {
            const errorStr = `Error occurred when updating a Product '${id}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async deleteProduct(productId) {

        let response
        try {
            await this.sql`
                DELETE FROM products
                WHERE product_id = ${BigInt(productId)}
            `
        } catch (error) {
            const errorStr = `Error occurred when deleting Product '${productId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

}