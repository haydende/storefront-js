import { BaseEntity } from "./BaseEntity.js";

export class User extends BaseEntity {

    firstName;
    lastName;
    email;
    phone;

    constructor({user_id, first_name, last_name, email, phone}) {
        super(user_id);
        this.firstName = first_name;
        this.lastName = last_name;
        this.email = email;
        this.phone = phone;
    }

}