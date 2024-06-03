import { BaseEntity } from "./BaseEntity.js";

export class Order extends BaseEntity {

    customerId;
    basketId;
    paymentInfoId;
    addressId;
    price;
    dateCreated;

}