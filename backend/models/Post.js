const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true }, // snapshot for fast display
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true }, 

    text: { type: String, trim: true, maxlength: 2000 },

    image: { type: String, default: null },

    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
      },
    ],

    comments: [CommentSchema],
  },
  { timestamps: true }
);

PostSchema.pre("validate", function (next) {
  if (!this.text && !this.image) {
    return next(new Error("A post needs text, an image, or both."));
  }
  next();
});

PostSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});
PostSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);
