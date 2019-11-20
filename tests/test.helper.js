const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "HTML is easy",
    author: "Bob Stuart",
    url: "http://www.google.com",
    likes: 12
  },
  {
    title: "HTML is hard",
    author: "Chris Stuart",
    url: "http://www.microcapstars.com",
    likes: 10
  }
];

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
};
