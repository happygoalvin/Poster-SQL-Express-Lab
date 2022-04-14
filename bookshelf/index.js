// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'foo',
      password:'tgc16bar',
      database:'poster_shop'
    }
  })
  const bookshelf = require('bookshelf')(knex)
  
  module.exports = bookshelf;