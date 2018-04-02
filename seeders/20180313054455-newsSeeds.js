'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('newsTags', [{}], {});
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('newsTags', [{}])
  }
};
