const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

  
    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-comments.text -__v")
        .lean({ virtuals: true }),
      Post.countDocuments(),
    ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      totalPosts: total,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load the feed.", error: err.message });
  }
});

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim() && !req.file) {
      return res.status(400).json({ message: "Add some text, an image, or both." });
    }

    let image = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      image = `data:${req.file.mimetype};base64,${base64}`;
    }

    const post = await Post.create({
      user: req.user.id,
      username: req.user.username,
      text: text?.trim() || undefined,
      image,
    });

    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: "Could not create the post.", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean({ virtuals: true });
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: "Could not load the post.", error: err.message });
  }
});

router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const existingIndex = post.likes.findIndex((l) => l.user.toString() === req.user.id);
    let liked;

    if (existingIndex > -1) {
      post.likes.splice(existingIndex, 1); 
      liked = false;
    } else {
      post.likes.push({ user: req.user.id, username: req.user.username }); 
      liked = true;
    }

    await post.save();
    res.json({
      liked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not update the like.", error: err.message });
  }
});

router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    post.comments.push({
      user: req.user.id,
      username: req.user.username,
      text: text.trim(),
    });

    await post.save();
    res.status(201).json({
      commentsCount: post.comments.length,
      comments: post.comments,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not add the comment.", error: err.message });
  }
});

module.exports = router;
