
import { Model, DataTypes, ModelAttributes } from 'sequelize';
import { UserAddress } from './useraddress';

export class Users extends Model {
  id!: number;
  FirstName !: string;
  LastName ?: string;
  email !: string;
  Password !: string;
  MobileNumber !: string;
  Gender ?: number;
  Date_Of_Birth ?: string;
  User_Profile_Picture ?: string;
  Zipcode ?: string;
  WorkWithPets ?: boolean;
  LanguageId ?: number;
  NationalityId ?: number;
  RoleId ?: number;
  CreateDate ?: Date;
  ModifiedDate ?: Date;
  ModifiedBy ?: number;
  Status ?: number;
  IsApprove ?: boolean;
  createdAt !: Date;
  updatedAt !: Date;
};

export const UserModelAttributes: ModelAttributes = {
  id: {
    autoIncrement: true,
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  FirstName: {
    type: DataTypes.STRING
  },
  LastName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  Password :{
    type :DataTypes.STRING
  },
  MobileNumber:{
    type: DataTypes.STRING,
  },
  Gender :{
    type :DataTypes.INTEGER
  },
  Date_Of_Birth:{
    type:DataTypes.STRING
  },
  NationalityId:{
    type:DataTypes.INTEGER
  },
  User_Profile_Picture:{
    type:DataTypes.STRING
  },
  Zipcode:{
    type:DataTypes.STRING
  },
  WorkWithPets:{
    type:DataTypes.BOOLEAN
  },
  LanguageId: {
    type:DataTypes.INTEGER
  },
  RoleId:{
    type:DataTypes.INTEGER
  },
  Status :{
    type:DataTypes.INTEGER
  },
  IsApprove :{
    type: DataTypes.BOOLEAN
  },
  CreateDate :{
    type: DataTypes.DATE
  },
  ModifiedDate :{
    type: DataTypes.DATE
  },
  ModifiedBy : {
    type: DataTypes.INTEGER
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

