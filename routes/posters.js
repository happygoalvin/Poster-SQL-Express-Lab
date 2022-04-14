const express = require("express");
const router = express.Router(); // #1 - Create a new express Router

// 1. Import in the Poster model
const { Poster } = require('../models')

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

router.get('/', async function (req, res) {
    // 2. fetch all the posters (i.e, SELECT * from posters)

    let posters = await Poster.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON() // 3. Convert collection to JSON
    })
})

router.get('/create', async (req,res) => {
    const posterForm = createPosterForm();
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            const poster = new Poster();
            poster.set('title', form.data.title);
            poster.set('cost', form.data.cost);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height', form.data.height);
            poster.set('width', form.data.width);
            await poster.save();
            res.redirect('/posters')
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
    const posterForm = createPosterForm();

    // fill in the existing fields
    posterForm.fields.title.value = posters.get('title');
    posterForm.fields.cost.value = posters.get('cost');
    posterForm.fields.description.value = posters.get('description');
    posterForm.fields.date.value = posters.get('date');
    posterForm.fields.stock.value = posters.get('stock');
    posterForm.fields.height.value = posters.get('height');
    posterForm.fields.width.value = posters.get('width');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'posters': posters.toJSON()
    })
})

router.post('/:poster_id/update', async (req,res) => {
    // fetch the poster we want to update
    const posters = await getPosterById(req.params.poster_id)

    // process the form 
    const posterForm = createPosterForm();
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