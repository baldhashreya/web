'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ServiceId: {
        type: Sequelize.INTEGER
      },
      ServiceStartDate: {
        type: Sequelize.STRING
      },
      ZipCode: {
        type: Sequelize.STRING
      },
      ServiceHouslyRate: {
        type: Sequelize.DECIMAL
      },
      ServiceHours: {
        type: Sequelize.FLOAT
      },
      ExtraHours: {
        type: Sequelize.FLOAT
      },
      EndTime: {
        type: Sequelize.STRING
      },
      SubTotal: {
        type: Sequelize.DECIMAL
      },
      Discount: {
        type: Sequelize.DECIMAL
      },
      TotalCost: {
        type: Sequelize.DECIMAL
      },
      Comments: {
        type: Sequelize.STRING
      },
      PaymentTrasactionRefNo: {
        type: Sequelize.STRING
      },
      PaymentDue: {
        type: Sequelize.BOOLEAN
      },
      JobStatus: {
        type: Sequelize.BOOLEAN
      },
      SPAcceptedDate: {
        type: Sequelize.DATE
      },
      HasPets: {
        type: Sequelize.BOOLEAN
      },
      Status: {
        type: Sequelize.INTEGER
      },
      CreateDate: {
        type: Sequelize.DATE
      },
      ModifiedDate: {
        type: Sequelize.DATE
      },
      ModifiedBy: {
        type: Sequelize.INTEGER
      },
      RefundedAmount: {
        type: Sequelize.DECIMAL
      },
      Distance: {
        type: Sequelize.DECIMAL
      },
      HasIssue: {
        type: Sequelize.BOOLEAN
      },
      PaymentDone: {
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
    await queryInterface.dropTable('ServiceRequests');
  }
};