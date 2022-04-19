const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName: 'posters',
    mediaProperty: function () {
        return this.belongsTo('MediaProperty')
    },
    tags: function () {
        return this.belongsToMany('Tag')
    }
});

const Tag = bookshelf.model('Tag', {
    tableName: 'tags',
    posters: function () {
        return this.belongsToMany('Poster')
    }
})

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName: 'media_properties',
    posters: function () {
        return this.hasMany('Poster')
    }
});

const User = bookshelf.model('User', {
    tableName: 'users'
})

module.exports = {
    Poster,
    MediaProperty,
    Tag,
    User
};