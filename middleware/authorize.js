const pool = require("../config/db");


const isAdmin = (req, res, next) => {
    if (!req.session.isAuth || !req.session.isAdmin) {
        req.flash('error', 'You must be an admin to do that!');
        return res.redirect('/posts');
    }
    next();
}

const isOwner = async (req, res, next) => {
    const check = await pool.query("SELECT * FROM posts WHERE postid = $1 AND userid = $2", [req.params.id, req.session.userid]);
    console.log(req.params.id) // '415e57bc-4a9b-408b-9513-7f0bee959be7'
    console.log(req.session.userid) // '5ce848f8-2e1c-41d5-918e-a90e343b8e0a'
    console.log(check.rows);
    if (check.rows[0] === undefined) {
        req.flash('error', 'You must be the owner to do that!');
        return res.redirect('/posts');
    }
    next();
}

const isOwnerOrAdmin = async (req, res, next) => {
    const check = await pool.query("select * from posts where userid = $1 and postid = $2", [req.session.userid, req.params.id]);
    console.log(check)

    if (!req.session.isAuth || (!check.rows[0] && !req.session.isAdmin)) {
        req.flash('error', 'You must be the owner or an admin to do that!');
        return res.redirect('/posts');
    }
    next();
}

const authenticated = (req, res, next) => {
    if (!req.session.isAuth) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports = {
    isAdmin,
    isOwner,
    isOwnerOrAdmin,
    authenticated
}