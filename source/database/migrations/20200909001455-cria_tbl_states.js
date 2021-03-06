'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('states', { 
      id           :  { type : Sequelize.INTEGER , autoIncrement : true, primaryKey:true },
      name_of_state  :  { type : Sequelize.STRING , allowNull: false },
      created_at:  { type: Sequelize.DATE , allownull: false },
      updated_at:  { type: Sequelize.DATE , allownull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('states');
  }
};
