const express = require("express");
const router = express.Router(); // #1 - Create a new express Router

// 1. Import in the Poster model
const {
    Poster,
    MediaProperty,
    Tag
} = require('../models')

// Import in the Forms
const {
    createPosterForm,
    bootstrapField
} = require('../forms');

async function getPosterById(posterId) {
    // eqv of
    // select * from posters where id = ${productId}
    // retrieve the poster
    const posters = await Poster.where({
        'id': posterId
    }).fetch({
        require: true, // will cause an error if not found
        withRelated: ['mediaProperty', 'tags']
    });

    return posters;
}

async function getAllMediaProperties() {
    const allMediaProperties = await MediaProperty.fetchAll().map(mediaProperty => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    });
    return allMediaProperties;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    return allTags;
}

router.get('/', async function (req, res) {
    // 2. fetch all the posters (i.e, SELECT * from posters)

    let posters = await Poster.collection().fetch({
        withRelated: ['mediaProperty', 'tags']
    });
    res.render('posters/index', {
        'posters': posters.toJSON() // 3. Convert collection to JSON
    })
})

router.get('/create', async (req, res) => {

    const allMediaProperties = await getAllMediaProperties();

    const allTags = await getAllTags();

    const posterForm = createPosterForm(allMediaProperties, allTags);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {

    const allMediaProperties = await getAllMediaProperties();
    const allTags = await getAllTags();
    const posterForm = createPosterForm(allMediaProperties, allTags);

    posterForm.handle(req, {
        'success': async (form) => {

            // create an instance of the Poster model
            // if we refering to the MODEL directly, we are accessing the entire table
            // if we referring to the instance of the model, then we are accessing one row
            // eqv:
            /*
             insert into products (name, cost, description)
              values (?, ?, ?)
            */
            const poster = new Poster();
            poster.set('title', form.data.title);
            poster.set('cost', form.data.cost);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height', form.data.height);
            poster.set('width', form.data.width);
            poster.set('media_property_id', form.data.media_property_id);

            await poster.save();

            let tags = form.data.tags;
            if (tags) {
                // the reason we split tags by comma
                // is because attach function takes in an array of ids
                // add new tags to the M:M tags relationship
                await poster.tags().attach(tags.split(','));
            }
            req.flash("success_messages", `New Poster ${poster.get('title')} has been created`)

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:poster_id/update', async (req, res) => {
    // retrieve the poster
    const posters = await getPosterById(req.params.poster_id);

    // fetch all Media Property
    const allMediaProperties = await getAllMediaProperties();

    // fetch all tags
    const allTags = await getAllTags();

    const posterForm = createPosterForm(allMediaProperties, allTags);

    // fill in the existing fields
    posterForm.fields.title.value = posters.get('title');
    posterForm.fields.cost.value = posters.get('cost');
    posterForm.fields.description.value = posters.get('description');
    posterForm.fields.date.value = posters.get('date');
    posterForm.fields.stock.value = posters.get('stock');
    posterForm.fields.height.value = posters.get('height');
    posterForm.fields.width.value = posters.get('width');
    posterForm.fields.media_property_id.value = posters.get('media_property_id');
    let selectedTags = await posters.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'posters': posters.toJSON()
    })
})

router.post('/:poster_id/update', async (req, res) => {
    // fetch the poster we want to update
    const posters = await getPosterById(req.params.poster_id)
    const allMediaProperties = await getAllMediaProperties();
    const allTags = await getAllTags();

    // process the form 
    const posterForm = createPosterForm(allMediaProperties, allTags);
    posterForm.handle(req, {
        'success': async (form) => {

            let {
                tags,
                ...posterData
            } = form.data;

            posters.set(posterData);
            posters.save();

            let selectedTagIDs = tags.split(',');

            //  get all the existing tags
            let existingTags = await posters.related('tags').pluck('id');

            // remove all the tags that are not selected anymore
            let toRemove = existingTags.filter(id => selectedTagIDs.includes(id) === false);

            await posters.tags().detach(toRemove); // detach will take in an array of ids
            // those ids will be removed from the relationship
            // add in all the new tags
            await posters.tags().attach(selectedTagIDs);

            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:poster_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const posters = await getPosterById(req.params.poster_id);
    res.render('posters/delete', {
        'posters': posters.toJSON()
    })
})

router.post('/:poster_id/delete', async (req, res) => {
    const posters = await getPosterById(req.params.poster_id)
    await posters.destroy();
    res.redirect('/posters')
})


module.exports = router;