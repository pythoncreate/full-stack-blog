const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response, next) => {
  const { username, password, name } = request.body;

  if (!username || username.length < 3) {
    return response
      .status(400)
      .json({ error: "Please enter a username of 3 characters or greater" });
  }

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: "Please enter a password of 3 characters or greater" });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username: username,
      name: name,
      passwordHash
    });

    const savedUser = await user.save();

    response.json(savedUser);
  } catch (exception) {
    next(exception);
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");
  response.json(users);
});

usersRouter.get("/:id", async (request, response, next) => {
  try {
    const blog = await User.findById(request.params.id);
    if (user) {
      response.json(user.toJSON());
    } else response.status(404).end();
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:id", async (request, response, next) => {
  const body = request.body;
  const updateUser = {
    username: body.username,
    password: body.password,
    name: body.name,
    blogs: [body.blogs]
  };
  try {
    await User.findByIdAndUpdate(request.params.id, updateUser, {
      new: true
    });
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
