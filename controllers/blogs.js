const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
    .populate("user", {
      username: 1,
      name: 1,
      id: 1
    })
    .populate("comments");
  response.json(blogs);
});

const getTokenFrom = request => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.post("/", async (request, response, next) => {
  const data = request.body;

  const token = getTokenFrom(request);

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: "token missing or invalid" });
    }

    const user = await User.findById(decodedToken.id);

    const blog = new Blog({
      title: data.title,
      author: data.author,
      likes: isNaN(data.likes) ? 0 : data.likes,
      url: data.url,
      user: user._id
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog.toJSON());
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);
    if (blog) {
      response.json(blog.toJSON());
    } else response.status(404).end();
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", async (request, response, next) => {
  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  };
  try {
    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
      .populate("user", { username: 1, name: 1 })
      .populate("comments");
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:id", (request, response) => {
  Blog.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => console.log("Error", error));
});

blogsRouter.post("/:id/comments", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);
    const comment = new Comment({
      comment: request.body.comment,
      blog: blog._id
    });
    const result = await comment.save();
    blog.comments = blog.comments.concat(result._id);
    await blog.save();
    response.status(201).json(result.toJSON());
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
