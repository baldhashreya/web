import { UserDefineModel,
    ContactUsDefineModel, 
    ServiceRequestDefineModel,
    ServiceRequestExtraDefineModel, 
    UserAddressDefineModel,
    FavoriteAndBlockedDefineModel,
    UserRequestDefineModel,
    ContactUsAttachmentDefineModel,
    RatingDefineModel,
    CityDefineModel,
    ZipCodeDefineModel} from "./index";
import { Sequelize } from "sequelize";

const env = process.env.NODE_ENV || 'development';

const config = require('../config/config')[env];
const  sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);

export { Sequelize, sequelize };


export interface DBRequest_ZipCodes{
    sequelize: Sequelize;
    Request_ZipCodes : any;
}

export interface DbRating{
    sequelize: Sequelize;
    Rating : any;
}

export interface DBUserContact{
    sequelize: Sequelize;
    Users : any;
}

export interface DBServiceRequest{
    sequelize: Sequelize;
    ServiceRequest : any;
}
export interface DbContect {
    sequelize: Sequelize;
    ContactUs: (any);
}

export interface DbContactUsAttechment {
    sequelize: Sequelize;
    ContactUsAttachment : any;
}

export interface DBUserRequest {
    sequelize: Sequelize;
    UserRequest: (any);
}

export interface DbServiceRequestExtra {
    sequelize: Sequelize;
    ServiceRequestExtra: (any);
}

export interface DbUserAddress {
    sequelize : Sequelize;
    UserAddress : any;
}

export interface DbFavoriteAndBlocked {
    sequelize : Sequelize;
    FavoriteAndBlocked : any;
}

export interface DbZipCode{
    sequelize : Sequelize;
    ZipCode : any;
}

export interface DbCity{
    sequelize : Sequelize;
    City: any;
}
  
export const DbContactUsAttechment: DbContactUsAttechment = {
    sequelize: sequelize,
    ContactUsAttachment: ContactUsAttachmentDefineModel
}
export const dbContact: DbContect = {
    sequelize: sequelize,
    ContactUs: ContactUsDefineModel
}

export const dbUser: DBUserContact = {
    sequelize: sequelize,
    Users : UserDefineModel,
}

export const DbRating: DbRating = {
    sequelize: sequelize,
    Rating: RatingDefineModel
}

export const dbFavoriteAndBlocked: DbFavoriteAndBlocked = {
    sequelize: sequelize,
    FavoriteAndBlocked : FavoriteAndBlockedDefineModel,
}

export const dbServiceRequest: DBServiceRequest = {
    sequelize: sequelize,
    ServiceRequest : ServiceRequestDefineModel,
}

export const dbServiceRequestExtra: DbServiceRequestExtra = {
    sequelize: sequelize,
    ServiceRequestExtra : ServiceRequestExtraDefineModel
}

export const dbUserAddress : DbUserAddress = {
    sequelize : sequelize,
    UserAddress : UserAddressDefineModel
}

export const DBUserRequest : DBUserRequest = {
    sequelize : sequelize,
    UserRequest : UserRequestDefineModel
}

export const DbCity: DbCity = {
    sequelize : sequelize,
    City : CityDefineModel
}

export const DbZipCode: DbZipCode = {
    sequelize : sequelize,
    ZipCode : ZipCodeDefineModel
}