const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName:'posters',
    mediaProperty() {
        return this.belongsTo('MediaProperty')
    }
});

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName:'media_properties',
    poster() {
        return this.hasMany('Poster')
    }
});

module.exports = { Poster, MediaProperty };