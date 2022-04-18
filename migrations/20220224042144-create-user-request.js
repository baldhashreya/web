'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ServiceId: {
        type: Sequelize.INTEGER
      },
      CustomerId: {
        type: Sequelize.INTEGER
      },
      IsAssign:{
        type: Sequelize.INTEGER
      },
      IsDeleted:{
        type: Sequelize.BOOLEAN
      },
      email:{
        type: Sequelize.STRING
      },
      Start: {
        type: Sequelize.STRING
      },
      End:{
        type: Sequelize.STRING
      },
      Time:{
        type: Sequelize.INTEGER
      },
      HelperName:{
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserRequests');
  }
};