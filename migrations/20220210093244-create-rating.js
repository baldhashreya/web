'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ratings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      RatingFrom:{
        type: Sequelize.INTEGER
      },
      RatingTo:{
        type: Sequelize.INTEGER
      },
      Ratings: {
        type: Sequelize.DECIMAL
      },
      Comments: {
        type: Sequelize.STRING
      },
      RatingDate: {
        type: Sequelize.DATE
      },
      OnTimeArrival: {
        type: Sequelize.DECIMAL
      },
      Friendlly: {
        type: Sequelize.DECIMAL
      },
      QualityOfService: {
        type: Sequelize.DECIMAL
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
    await queryInterface.dropTable('Ratings');
  }
};