const router = require("express").Router();
const {
    isAdmin,
    isOwner,
    isOwnerOrAdmin,
    authenticated,
} = require("../middleware/authorize");
const pool = require("../config/db");

// comments
router.get("/:id", authenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await pool.query(
            "SELECT * FROM comments INNER JOIN users ON comments.userid = users.userid WHERE postid = $1",
            [id]
        );
        if (comments.rows.length === 0) {
            req.flash("error", "No comments found");
            res.redirect("/posts");
        }
        res.render("comments", {
            comments: comments.rows,
            userid: req.session.userid,
            postid: id,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// create a comment
router.post("/:id", authenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req.body;
        const newComment = await pool.query(
            "INSERT INTO comments (body, userid, postid) VALUES ($1, $2, $3) RETURNING *",
            [body, req.session.userid, id]
        );
        if (newComment.rows.length === 0) {
            req.flash("error", "Comment not created");
            res.redirect("/posts");
        }
        req.flash("success", "Comment created");
        res.redirect(`/comments/${id}`);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// delete a comment
router.delete("/:id", authenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await pool.query(
            "SELECT * FROM comments WHERE commentid = $1",
            [id]
        );
        if (comment.rows.length === 0) {
            req.flash("error", "Comment not found");
            res.redirect("/posts");
        }
        if (comment.rows[0].userid !== req.session.userid) {
            req.flash("error", "Not authorized");
            res.redirect("/posts");
        }
        const deleteComment = await pool.query(
            "DELETE FROM comments WHERE commentid = $1",
            [id]
        );
        if (deleteComment.rowCount === 0) {
            req.flash("error", "Comment not deleted");
            res.redirect("/posts");
        }
        req.flash("success", "Comment deleted");
        res.redirect("/posts");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
