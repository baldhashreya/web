// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class UserRequest extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   UserRequest.init({
//     ServiceId: DataTypes.INTEGER
//   }, {
//     sequelize,
//     modelName: 'UserRequest',
//   });
//   return UserRequest;
// };

import { Model, DataTypes, ModelAttributes } from 'sequelize';

export class UserRequest extends Model{
    [x: string]: any;
    id !: number;
  
    ServiceId!: number;

    CustomerId !: number;

    IsAssign !: number;

    IsDeleted ?: boolean;

    Start !: string;

    End !: string;

    Time !: number;

    email !: string;

    HelperName !: string;

    createdAt!: Date;
  
    updatedAt!: Date;
}

export const UserRequestModelAttributes: ModelAttributes = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
    },
    ServiceId: {
        type : DataTypes.BIGINT
    },

    CustomerId:{
        type: DataTypes.INTEGER
    },

    IsAssign:{
        type: DataTypes.INTEGER
    },

    IsDeleted:{
        type: DataTypes.BOOLEAN
    },
    email:{
        type: DataTypes.STRING
    },
    Start: {
        type: DataTypes.STRING
    },
    End: {
        type: DataTypes.STRING
    },
    Time: {
        type: DataTypes.DOUBLE
    },
    HelperName:{
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}
