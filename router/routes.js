const knex = require('../Database/db.connections')
const { createToken, verifyToken } = require('../auth/jwt.auth')
const router = require('express').Router()


// home
router.get('/', (req, res) => {
    res.send('Bonjour')
})

// register user here
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body                  // get users - name, email, and password from body
    const user = await knex('users').where({ email })           // checking email in database

    // for user not present in database
    if (user.length === 0) {
        await knex('users').insert({ name, email, password })
        return res.send('data inserted')
    }
    res.send('already user')
})

// login user if already a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body                            // get email and password from body
    const user = await knex('users').where({ email, password })     // checking credentials matched in database or not

    // if credentials matched
    if (user.length !== 0) {
        console.log(user);
        const token = createToken(user[0])          // generating token using jsonwebtoken
        res.cookie('cookie', token)                 // saving token in headers
        return res.send('logged in')
    }
    res.send('check your credentials and try again')

})

// add blog post if user is logged in
router.post('/blog', verifyToken, async (req, res) => {
    const { id } = req.userData[0]                          // get user id from header
    const { title, content } = req.body                     // get blog title and content from body
    const blog = await knex('blogs').where({ title })       // checking blog with given title is present in database or not    

    // add blog post if blog is not present in database 
    if (blog.length === 0) {
        await knex('blogs').insert({ title, content, user_id: id })
        return res.send('blog added')
    }
    res.send('blog exists')
})

// reactions ( likes / dislikes ) if user logged in
router.post('/react/:id', verifyToken, async (req, res) => {
    const { likes, dislikes } = req.body    // get reaction from body
    const { id } = req.userData[0]          // get user id from header
    const blog_id = req.params.id           // get blod id rom params

    const react = await knex('reactions').where({ user_id: id, blog_id })       // checking reaction to perticular blog by logged in user

    // checking if any reaction given or not
    if (!likes && !dislikes) {
        return res.send("no reaction found")
    }
    // checking if both reaction given at same time or not
    else if (likes && dislikes) {
        return res.send("you can't give both reaction at same time")
    }

    // checking given reaction is positive or negative
    if (react.length !== 0) {
        const liked = react[0].likes
        const disliked = react[0].dislikes

        // like if blog not liked by user
        if (likes && !liked) {
            await knex('reactions').where({ user_id: id, blog_id }).update({ blog_id, user_id: id, likes: 1 })
            await knex('reactions').where({ user_id: id, blog_id }).update({ blog_id, user_id: id, dislikes: 0 })
            res.send("Liked")
        }

        // remove like if blog already liked by user
        else if (likes && liked) {
            await knex('reactions').where({ user_id: id, blog_id }).update({ blog_id, user_id: id, likes: 0 })
            res.send("Like removed")

        }

        // dislike if blog not disliked by user
        else if (dislikes && !disliked) {
            await knex('reactions').where({ user_id: id, blog_id }).update({ blog_id, user_id: id, dislikes: 1 })
            await knex('reactions').where({ user_id: id, blog_id }).update({ blog_id, user_id: id, likes: 0 })
            res.send("Disliked")
        }

        // dislike if blog already disliked by user
        else if (dislikes && disliked) {
            await knex('reactions').where({ user_id: id, blog_id }).update({ blog_id, user_id: id, dislikes: 0 })
            res.send("Dislike removed")
        }

    }
    // if user giving first time reaction on a particular blog
    else if (react.length === 0) {
        // for positive reaction
        if (likes) {
            await knex('reactions').where({ user_id: id, blog_id }).insert({ blog_id, user_id: id, likes: 1 })
            res.send("Liked")
        }
        //for negative reaction
        else if (dislikes) {
            await knex('reactions').where({ user_id: id, blog_id }).insert({ blog_id, user_id: id, dislikes: 1 })
            res.send("Disliked")

        }
    }

})



module.exports = router