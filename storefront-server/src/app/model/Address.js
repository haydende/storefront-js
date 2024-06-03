import { BaseEntity } from "./BaseEntity.js";

export class Address extends BaseEntity {

    customerId;
    lineOne;
    lineTwo;
    cityOrTown;
    stateOrProvince;
    postalCode;
    country;
    isDefault;

}