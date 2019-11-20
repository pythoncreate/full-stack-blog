const Blog = require("../models/blog");

const dummy = blogs => {
  return (blogs = 1);
};

const totalLikes = blogs => {
  return blogs.reduce((a, b) => +a + +b.likes, 0);
};

const favoriteBlog = blogs => {
  if (!blogs || !blogs.length) {
    return undefined;
  }
  // Do not alter given array - slice it
  return blogs.slice().sort((a, b) => (a.likes > b.likes ? -1 : 1))[0];
};

const mostBlogs = blogs => {
  if (!blogs || !blogs.length) {
    return undefined;
  }
  return blogs
    .reduce((result, item) => {
      // ensure that author exists
      let idx = result.findIndex(b => b.author === item.author);
      if (idx === -1) {
        result.push({ author: item.author, blogs: 1 });
      } else {
        result[idx].blogs++;
      }
      return result;
    }, [])
    .sort((a, b) => (a.blogs > b.blogs ? -1 : 1))[0];
};

const mostLikes = blogs => {};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
