'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FavoriteAndBlockeds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      IsFavorite: {
        type: Sequelize.BOOLEAN
      },
      IsBlocked: {
        type: Sequelize.BOOLEAN
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      TargetUserId: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('FavoriteAndBlockeds');
  }
};