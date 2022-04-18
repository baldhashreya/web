// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class ContactUsAttachment extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   ContactUsAttachment.init({
//     Name: DataTypes.STRING,
//     FileName: DataTypes.STRING
//   }, {
//     sequelize,
//     modelName: 'ContactUsAttachment',
//   });
//   return ContactUsAttachment;
// };

import { Model, DataTypes, ModelAttributes } from 'sequelize';

export class ContactUsAttachment extends Model{
  id !: number;

  Name?: string;

  FileName ?: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export const ContactUsAttachmentAttributes: ModelAttributes = {

  id: {
    autoIncrement: true,
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  Name: {
    type :DataTypes.STRING
  },
  FileName: {
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