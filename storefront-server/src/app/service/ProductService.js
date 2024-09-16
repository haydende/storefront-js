import { DatabaseUtil } from "../util/DatabaseUtil.js";

class ProductService {

    sql

    constructor() {
        this.sql = DatabaseUtil.createConnection()
    }

    async getProductWithId(productId) {
        return await this.sql`
            SELECT *
            FROM products
            WHERE product_id = ${ BigInt(productId) }
        `
    }

    async createProduct(product) {
        if (product.productId) {
            throw new Error('Provided Product contains an ID.')
        }

        const columns = Object.keys(product)
        const values = Object.values(product)

        return await this.sql`
            INSERT INTO products (${ this.sql(product, columns) })
            VALUES
            ${ this.sql(product, values) }
            RETURNING *
        `
    }

    async updateProduct({productId, ...otherProductFields}) {
        if (!productId) {
            throw new Error('Provided Product does not contain an ID.')
        }

        const product = {productId, ...otherProductFields}
        const columns = Object.keys(product)

        return await this.sql`
            UPDATE products
            SET ${ this.sql(product, columns) }
            WHERE product_id = ${ BigInt(productId) }
            RETURNING *
        `
    }

    async deleteProduct(productId) {
        await this.sql`
            DELETE
            FROM products
            WHERE product_id = ${ BigInt(productId) }
        `
    }

}