
import {  Sequelize } from 'sequelize';
import { CityModelAttributes } from './city';
import {  ContactUsModelAttributes } from "./contactus";
import { FavoriteAndBlockedModelAttributes } from './favoriteandblocked';
import { RatingModelAttributes } from './rating';

import { ServiceRequestModelAttributes } from './servicerequest';
import { ServiceRequestAddressModelAttributes } from './servicerequestaddress';
import { ServiceRequestExtraModelAttributes } from './servicerequestextra';
import { StateModelAttributes } from './state';
import { TestModelAttributes } from './test';
import {  UserModelAttributes } from './user';
import {  UserAddressModelAttributes } from './useraddress';
import { UserRequestModelAttributes } from './userrequest';
import { ZipCodeModelAttributes } from './zipcode';
import { ContactUsAttachmentAttributes } from './contactusattachment';
const env = process.env.NODE_ENV || 'development';

const config = require('../config/config')[env];
const  sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);

export { Sequelize, sequelize };



export const ContactUsDefineModel = sequelize.define(
    'ContactUs',
    {
      ...ContactUsModelAttributes
    },
    {
      tableName: 'ContactUs'
    }
    
);


export const UserDefineModel = sequelize.define(
   'Users',
   {
     ...UserModelAttributes
   },
   {
     tableName:'Users'
   }

); 

export const UserRequestDefineModel = sequelize.define(
  'UserRequest',
  {
    ...UserRequestModelAttributes
  },
  {
    tableName:'UserRequest'
  }
)

export const UserAddressDefineModel = sequelize.define(
  'UserAddress',
  {
    ...UserAddressModelAttributes
  },
  {
    tableName:'UserAddress'
  }
);

export const FavoriteAndBlockedDefineModel = sequelize.define(
  'FavoriteAndBlocked',
  {
    ...FavoriteAndBlockedModelAttributes
  },
  {
    tableName:'FavoriteAndBlocked'
  }
);

export const CityDefineModel = sequelize.define(
  'City',
  {
    ...CityModelAttributes
  },
  {
    tableName:'City'
  }
);

export const StateDefineModel = sequelize.define(
  'State',
  {
    ...StateModelAttributes
  },
  {
    tableName:'State'
  }
);

export const ServiceRequestDefineModel = sequelize.define(
  'ServiceRequest',
  {
    ...ServiceRequestModelAttributes
  },
  {
    tableName:'ServiceRequest'
  }
);

export const RatingDefineModel = sequelize.define(
  'Rating',
  {
    ...RatingModelAttributes
  },
  {
    tableName:'Rating'
  }
);

export const ServiceRequestAddressDefineModel = sequelize.define(
  'ServiceRequestAddress',
  {
    ...ServiceRequestAddressModelAttributes
  },
  {
    tableName:'ServiceRequestAddress'
  }
);

export const ServiceRequestExtraDefineModel = sequelize.define(
  'ServiceRequestExtra',
  {
    ...ServiceRequestExtraModelAttributes
  },
  {
    tableName:'ServiceRequestExtra'
  }
);

export const ContactUsAttachmentDefineModel = sequelize.define(
  'ContactUsAttachment',
  {
    ...ContactUsAttachmentAttributes
  },
  {
    tableName:'ContactUsAttachment'
  }
);



// export const TestDefineModel = sequelize.define(
//   'Test',
//   {
//     ...TestModelAttributes
//   },
//   {
//     tableName:'Test'
//   }
// );

export const ZipCodeDefineModel = sequelize.define(
  'ZipCode',
  {
    ...ZipCodeModelAttributes
  },
  {
    tableName:'ZipCode'
  }
);

UserDefineModel.hasMany(UserAddressDefineModel);
UserAddressDefineModel.belongsTo(UserDefineModel);


UserAddressDefineModel.hasMany(ServiceRequestDefineModel);

UserDefineModel.hasMany(UserRequestDefineModel);

ContactUsDefineModel.hasOne(ContactUsAttachmentDefineModel);
ContactUsAttachmentDefineModel.belongsTo(ContactUsDefineModel);

StateDefineModel.hasMany(CityDefineModel);
CityDefineModel.hasMany(ZipCodeDefineModel);



UserRequestDefineModel.hasOne(RatingDefineModel);



UserDefineModel.hasMany(ServiceRequestDefineModel);
ServiceRequestDefineModel.belongsTo(UserDefineModel);




ServiceRequestDefineModel.hasOne(ServiceRequestExtraDefineModel);
ServiceRequestExtraDefineModel.belongsTo(ServiceRequestDefineModel);










