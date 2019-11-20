const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: { type: String, minlength: 3, unique: true, required: true },
  name: { type: String, required: true },
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog"
    }
  ]
});

userSchema.set("toJSON", {
  transform: doc => ({
    // eslint-disable-next-line no-underscore-dangle
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    blogs: doc.blogs
  })
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;
