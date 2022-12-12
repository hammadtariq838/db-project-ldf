const router = require("express").Router();
const {
    isAdmin,
    isOwner,
    isOwnerOrAdmin,
    authenticated,
} = require("../middleware/authorize");
const pool = require("../config/db");

// profile page
router.get("/", authenticated, async (req, res) => {
    const userid = req.session.userid;
    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE userid = $1",
            [userid]
        );
        const posts = await pool.query(
            "SELECT * FROM posts WHERE userid = $1",
            [userid]
        );
        const votes = await pool.query(
            "SELECT * FROM votes WHERE userid = $1",
            [userid]
        );
        if (user.rows.length === 0) {
            req.flash("error", "No user found");
            res.redirect("/posts");
        }
        res.render("profile/profile", {
            user: user.rows[0],
            posts: posts.rows,
            votes: votes.rows,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});



// edit profile
router.get("/edit", authenticated, async (req, res) => {
    const userid = req.session.userid;
    try {
        const user = await pool.query(
            "SELECT * FROM users WHERE userid = $1",
            [userid]
        );
        if (user.rows.length === 0) {
            req.flash("error", "No user found");
            res.redirect("/posts");
        }
        res.render("profile/edit", { user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post("/edit", authenticated, async (req, res) => {
    const userid = req.session.userid;
    try {
        const { username, email, bio } = req.body;
        const user = await pool.query(
            "UPDATE users SET username = $1, email = $2, bio = $3 WHERE userid = $4 RETURNING *",
            [username, email, bio, userid]
        );
        if (user.rows.length === 0) {
            req.flash("error", "No user found");
            res.redirect("/profile");
        }
        req.flash("success", "Profile updated");
        res.redirect("/profile");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


module.exports = router;