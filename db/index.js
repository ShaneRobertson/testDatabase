const { Client } = require("pg");

const client = new Client(
  "postgres://postgres:ganon3422@localhost:5432/juiceboz-dev"
);

const getAllUsers = async () => {
  const { rows } = await client.query(`
            SELECT id, username, name, location
            FROM users;
        `);
  return rows;
};

const getAllPosts = async () => {
  const { rows } = await client.query(`
        SELECT * FROM posts
    `);

  return rows;
};

const createUser = async ({ username, password, name, location }) => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
};

const createPost = async ({ authorId, title, content }) => {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
            INSERT INTO posts ("authorId", title, content)
            VALUES ($1, $2, $3)
            RETURNING *;
        `,
      [authorId, title, content]
    );

    return post;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (id, fields = {}) => {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [post],
    } = await client.query(
      `
            UPDATE posts
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, fields = {}) => {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [user],
    } = await client.query(
      `
            UPDATE users
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
};

const getPostByUser = async (userId) => {
  try {
    const { rows } = await client.query(`
            SELECT * FROM posts
            WHERE "authorId"=${userId}
        `);

    return rows;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    // first get the user (NOTE: Remember the query returns
    // (1) an object that contains
    // (2) a `rows` array that (in this case) will contain
    // (3) one object, which is our user.
    // if it doesn't exist (if there are no `rows` or `rows.length`), return null

    const {
      rows: [user],
    } = await client.query(`
    SELECT * FROM users
    WHERE id=${userId}
  `);

    if (!user) {
      return null;
    }
    delete user.password;

    const posts = await getPostByUser(userId);

    user.posts = posts;

    // if it does:
    // delete the 'password' key from the returned object
    // get their posts (use getPostsByUser)
    // then add the posts to the user
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getUserById
};
