'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceRequestAddresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AddressLine1: {
        type: Sequelize.STRING
      },
      AddressLine2: {
        type: Sequelize.STRING
      },
      City: {
        type: Sequelize.STRING
      },
      State: {
        type: Sequelize.STRING
      },
      PostalCode: {
        type: Sequelize.STRING
      },
      Mobile: {
        type: Sequelize.STRING
      },
      Email: {
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
    await queryInterface.dropTable('ServiceRequestAddresses');
  }
};