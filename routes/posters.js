const express = require("express");
const router = express.Router(); // #1 - Create a new express Router

// 1. Import in the Poster model
const { Poster, MediaProperty } = require('../models')

// Import in the Forms
const { createPosterForm, bootstrapField } = require('../forms');

async function getPosterById(posterId) {
    // eqv of
    // select * from posters where id = ${productId}
    // retrieve the poster
    const posters = await Poster.where({
        'id': posterId
    }).fetch({
        require:true // will cause an error if not found
    });

    return posters;
}

async function getAllMediaProperties() {
    const allMediaProperties = await MediaProperty.fetchAll().map( mediaProperty => {
        return [ mediaProperty.get('id'), mediaProperty.get('name')]
    });
    return allMediaProperties;
}

router.get('/', async function (req, res) {
    // 2. fetch all the posters (i.e, SELECT * from posters)

    let posters = await Poster.collection().fetch({
        withRelated: ['mediaProperty']
    });
    res.render('posters/index', {
        'posters': posters.toJSON() // 3. Convert collection to JSON
    })
})

router.get('/create', async (req,res) => {

    const allMediaProperties = await getAllMediaProperties();

    const posterForm = createPosterForm(allMediaProperties);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {

    const allMediaProperties = await getAllMediaProperties();

    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
            // 2. Save data from form into the new product instance
            const poster = new Poster(form.data);
            await poster.save();
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:poster_id/update', async (req,res) => {
    // retrieve the poster
    const posters = await getPosterById(req.params.poster_id);

    // fetch all Media Property
    const allMediaProperties = await getAllMediaProperties();

    const posterForm = createPosterForm(allMediaProperties);

    // fill in the existing fields
    posterForm.fields.title.value = posters.get('title');
    posterForm.fields.cost.value = posters.get('cost');
    posterForm.fields.description.value = posters.get('description');
    posterForm.fields.date.value = posters.get('date');
    posterForm.fields.stock.value = posters.get('stock');
    posterForm.fields.height.value = posters.get('height');
    posterForm.fields.width.value = posters.get('width');
    posterForm.fields.media_property_id.value = posters.get('media_property_id');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'posters': posters.toJSON()
    })
})

router.post('/:poster_id/update', async (req,res) => {
    // fetch the poster we want to update
    const posters = await getPosterById(req.params.poster_id)

    // fetch all Media Property
    const allMediaProperties = await getAllMediaProperties();

    // process the form 
    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
            posters.set(form.data);
            posters.save();
            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'posters': posters.toJSON()
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