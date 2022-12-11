const pool = require("../config/db");


const isAdmin = (req, res, next) => {
    if (!req.session.isAuth || !req.session.isAdmin) {
        req.flash('error', 'You must be an admin to do that!');
        return res.redirect('/posts');
    }
    next();
}

const isOwner = (req, res, next) => {
    // if the id in params is posted by the user
    const check = pool.query("SELECT * FROM posts WHERE postid = $1 AND userid = $2", [req.params.id, req.session.userid]);
    console.log(check.rows[0]);
    if (check.rows[0] === undefined) {
        req.flash('error', 'You must be the owner to do that!');
        return res.redirect('/posts');
    }
    next();
}

const isOwnerOrAdmin = async (req, res, next) => {
    const check = await pool.query("select * from posts where userid = $1 and postid = $2", [req.session.userid, req.params.id]);

    console.log(check.rows[0]);
    console.log(req.params.id);
    console.log(req.session.userid);
    console.log(!req.session.isAuth || (!check && !req.session.isAdmin));

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