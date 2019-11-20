const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const Blog = require("../models/blog");
const helper = require("./test.helper");

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs returned", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body.length).toBe(helper.initialBlogs.length);
});

test("make sure id is defined", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

// test("the first blog is about Chris Adventures", async () => {
//   const response = await api.get("/api/blogs");

//   expect(response.body[0].title).toBe("HTML is easy");
// });

// test("all blogs are returned", async () => {
//   const response = await api.get("/api/blogs");

//   expect(response.body.length).toBe(initialBlogs.length);
// });

// test("a specific blog is within the returned blogs", async () => {
//   const response = await api.get("/api/blogs");

//   const titles = response.body.map(r => r.title);
//   expect(titles).toContain("HTML is easy");
// });

// test("blog without content is not added", async () => {
//   const newBlog = {};

//   await api
//     .post("/api/blogs")
//     .send(newBlog)
//     .expect(400);

//   const response = await api.get("/api/blogs");

//   expect(response.body.length).toBe(initialBlogs.length);
// });

test("a valid blog can be added ", async () => {
  const newBlog = {
    title: "Love ASYNC",
    author: "Bob Stuart",
    url: "http://www.google.com",
    likes: 15
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  expect(response.body.length).toBe(helper.initialBlogs.length + 1);
});

test("should set empty likes to 0", async () => {
  const blog = {
    title: "Fresh Prince of Bel Air",
    author: "Will Smith",
    url: "www.freshprince.com"
  };

  const response = await api
    .post("/api/blogs")
    .send(blog)
    .expect(200);

  const itemID = response.body.id;

  const blogResponse = await api.get("/api/blogs");

  const filtered = blogResponse.body.filter(i => i.id === itemID);

  console.log(filtered);

  expect(filtered[0].likes).toBe(0);
});

test("blog with missing content is not added", async () => {
  const blogPost = {
    author: "Will Smith",
    likes: 35
  };

  const response = await api
    .post("/api/blogs")
    .send(blogPost)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length);
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map(r => r.title);

    expect(contents).not.toContain(blogToDelete.title);
  });
});

describe("update a blog", () => {
  test("should update blog likes", async () => {
    const blog = {
      title: "Monkey Bizness",
      author: "Curious George",
      url: "https://curiousgeorge.com",
      likes: 5
    };

    // Arrange - create
    const response = await api
      .post("/api/blogs")
      .send(blog)
      .expect(200);

    const itemID = response.body.id;

    blog.likes += 5;

    // Act - update likes
    await api
      .put(`/api/blogs/${itemID}`)
      .send(blog)
      .expect(204);

    const blogResponse = await api.get(`/api/blogs/${itemID}`);

    expect(blogResponse.body.likes).toBe(10);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
