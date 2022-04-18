'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContactUs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      mobilenumber: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      subjectType: {
        type: Sequelize.STRING
      },
      fileName: {
        type: Sequelize.STRING
      },
      CreatedBy: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER
      },
      IsDeleted: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('ContactUs');
  }
};