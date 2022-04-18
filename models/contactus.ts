// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class ContactUs extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   ContactUs.init({
//     name: DataTypes.STRING,
//     email: DataTypes.STRING,
//     mobilenumber: DataTypes.STRING,
//     message: DataTypes.STRING,
//     uploadfile: DataTypes.STRING,
//     subjecttype: DataTypes.STRING
//   }, {
//     sequelize,
//     modelName: 'ContactUs',
//   });
//   return ContactUs;
// };

import { Model, DataTypes, ModelAttributes } from 'sequelize';

export class ContactUs extends Model {
  id!: number;

  Name !: string;

  email?: string;

  mobilenumber?:string;

  subjectType ?: string;

  message ?: string;

  fileName ?: string;

  CreatedBy ?: number;

  IsDeleted ?: boolean;

  createdAt!: Date;

  updatedAt!: Date;
};

export const ContactUsModelAttributes: ModelAttributes = {
  id: {
    autoIncrement: true,
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  Name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  mobilenumber:{
    type: DataTypes.STRING
  },
  subjectType:{
    type:DataTypes.STRING
  },
  CreatedBy:{
    type:DataTypes.INTEGER
  },
  message: {
    type:DataTypes.STRING
  },
  fileName: {
    type:DataTypes.STRING
  },

  IsDeleted: {
    type: DataTypes.BOOLEAN
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