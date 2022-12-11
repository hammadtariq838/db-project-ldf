const router = require("express").Router();
const {
  isAdmin,
  isOwner,
  isOwnerOrAdmin,
  authenticated,
} = require("../middleware/authorize");
const pool = require("../config/db");

//all posts and name

router.get("/", authenticated, async (req, res) => {
  try {
    const posts = await pool.query(
      "SELECT * FROM posts INNER JOIN users ON posts.userid = users.userid"
    );

    if (posts.rows.length === 0) {
      req.flash("error", "No posts found");
      res.redirect("/posts/new");
    }
    res.render("posts", { posts: posts.rows, userid: req.session.userid });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//create a post
router.get("/new", authenticated, (req, res) => {
  res.render("posts/new");
});

router.post("/new", authenticated, async (req, res) => {
  try {
    console.log(req.body);
    const { body } = req.body;
    const newPost = await pool.query(
      "INSERT INTO posts (body, userid) VALUES ($1, $2) RETURNING *",
      [body, req.session.userid]
    );

    if (newPost.rows.length === 0) {
      req.flash("error", "Post not created");
      res.redirect("/posts");
    }

    req.flash("success", "Post created");
    res.redirect("/posts");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//get a post
router.get("/:id", authenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await pool.query(
      "SELECT * FROM posts INNER JOIN users ON posts.userid = users.userid WHERE postid = $1",
      [id]
    );

    if (post.rows.length === 0) {
      req.flash("error", "Post not found");
      res.redirect("/posts");
    }

    const count = await pool.query(
      "SELECT COUNT(*) FROM comments WHERE postid = $1",
      [id]
    );

    console.log(count.rows[0].count);

    res.render("posts/show", {
      post: post.rows[0],
      count: count.rows[0].count,
      userid: req.session.userid,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// edit a post
router.get("/:id/edit", isOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await pool.query("SELECT * FROM posts WHERE postid = $1", [
      id,
    ]);

    if (post.rows.length === 0) {
      req.flash("error", "Post not found");
      res.redirect("/posts");
    }

    res.render("posts/edit", { post: post.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//update a post
router.put("/:id", isOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;

    await pool.query("UPDATE posts SET body = $1 WHERE postid = $2", [
      body,
      id,
    ]);

    req.flash("success", "Post updated");
    res.redirect("/posts");
  } catch (err) {
    req.flash("error", "Post not updated");
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//delete a post
router.delete("/:id", isOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM posts WHERE postid = $1", [id]);

    req.flash("success", "Post deleted");
    res.redirect("/posts");
  } catch (err) {
    req.flash("error", "Post not deleted");
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// comment /posts/:id/comments
router.post("/:id/comments", authenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;

    const newComment = await pool.query(
      "INSERT INTO comments (comment, userid, postid) VALUES ($1, $2, $3) RETURNING *",
      [body, req.session.userid, id]
    );

    if (newComment.rows.length === 0) {
      req.flash("error", "Comment not created");
      res.redirect("/posts");
    } else {
      req.flash("success", "Comment created");
      res.redirect(`/posts/${id}`);
    }
  } catch (err) {
    req.flash("error", "Comment not created");
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// show comments
router.get("/:id/comments", authenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await pool.query(
      "SELECT * FROM comments INNER JOIN users ON comments.userid = users.userid WHERE postid = $1",
      [id]
    );

    if (comments.rows.length === 0) {
      req.flash("error", "No comments found");
      res.redirect("/posts");
    } else {
      res.render("posts/comments", {
        comments: comments.rows,
        userid: req.session.userid,
      });
    }
  } catch (err) {
    req.flash("error", "No comments found");
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
