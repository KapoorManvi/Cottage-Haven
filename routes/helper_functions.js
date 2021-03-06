//database connection
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'midterm'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE email = $1;
  `, [email])
  .then(res => res.rows);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE u_id = $1
  `, [id])
  .then(res => res.rows[0]);
}
exports.getUserWithId = getUserWithId;

/**
 * Get admin with ID
 */

const getAdminWithId = function(id) {
  return pool.query(`
  SELECT * FROM admins
  WHERE admin_id = $1
  `, [id])
  .then(res => res.rows[0]);
}
exports.getAdminWithId = getAdminWithId;


/**
 * Get properties for an Admin
 */

const getPropertiesForId = function(admin_id) {
  return pool.query(`
  SELECT * FROM properties
  WHERE owner_id = $1
  `, [admin_id])
  .then(res => res.rows[0]);
}
exports.getPropertiesForId = getPropertiesForId;



const getPropertyById = function(property_id) {
  return pool.query(`
  SELECT properties.*, users.name as owner FROM properties
  JOIN users ON users.u_id = properties.owner_id
  WHERE property_id = $1
  `, [property_id])
  .then(res => res.rows[0]);
}
exports.getPropertyById = getPropertyById;



/**
 *
 * Getting favourites for a user
 *
 */
const getFavouritesFor = function(id) {
  return pool.query(`
  SELECT p.property_id,owner_id,title,description,photo_url_1,photo_url_2,photo_url_3,photo_url_4,price,parking_spaces,number_of_bathrooms,number_of_bedrooms,street,city,province,post_code,sold,photo_url_5
  FROM properties as p
  JOIN favourites as f ON f.property_id = p.property_id
  WHERE f.u_id = $1
  `, [id])
  .then(res => res.rows);
}
exports.getFavouritesFor = getFavouritesFor;



/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
  INSERT INTO users (
    name, email, password
  ) VALUES ($1, $2, $3)
  RETURNING *
  `, [user.name, user.email, user.password])
  .then(res => res.rows[0]);
}
exports.addUser = addUser;



/**
 *
 * Add a property as a favourite for a specific user
 *
 */
const addtoFavourites =  function(u_id, property_id) {
  return pool.query(`
  INSERT INTO favourites (
    u_id, property_id
  ) VALUES ($1, $2)
  RETURNING *
  `, [u_id, property_id])
  .then(res => res.rows[0]);
}
exports.addtoFavourites = addtoFavourites;



const delFromFavourites =  function(u_id, property_id) {
  return pool.query(`
  DELETE FROM favourites
  WHERE u_id = $1 AND property_id = $2
  RETURNING *
  `, [u_id, property_id])
  .then(res => res.rows[0]);
}
exports.delFromFavourites = delFromFavourites;



const delFromProperties =  function(property_id) {
  return pool.query(`
  DELETE FROM properties
  WHERE property_id = $1
  RETURNING *
  `, [property_id])
  .then(res => res.rows[0]);
}
exports.delFromProperties = delFromProperties;


const SetAsSold =  function(property_id) {
  return pool.query(`
  UPDATE properties
  SET sold = 'true'
  WHERE property_id = $1
  RETURNING *
  `, [property_id])
  .then(res => res.rows[0]);
}
exports.SetAsSold = SetAsSold;







/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(minimum_price,maximum_price) {
   let queryString = `
   SELECT *
   FROM properties
   WHERE price >= $1 AND price < $2
   ORDER BY price
   LIMIT 20;
   `;
   return pool.query(queryString, [minimum_price,maximum_price])
   .then(res => res.rows)
   .catch(res => console.log(res));
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool.query(`
  INSERT INTO properties
   (owner_id,
    title,
    description,
    photo_url_1,
    photo_url_2,
    photo_url_3,
    photo_url_4,
    photo_url_5,
    price,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
    street,
    city,
    province,
    post_code,
    sold)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  RETURNING *
  `, [property.owner_id, property.title, property.description, property.photo_url_1,
    property.photo_url_2, property.photo_url_3, property.photo_url_4, property.photo_url_5,
    property.price, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.street,
   property.city, property.province, property.post_code, property.sold])
  .then(res => res.rows[0])
  .catch(res => (console.log(res)));
}
exports.addProperty = addProperty;


//Messages/////

//Retrieves messages from database and displays them for user when user lands on messages page
const getMessages = function(userId) {

  return pool.query(`
  SELECT * FROM messages
  WHERE receiver_id = $1;
  `, [userId])
  .then(res => res.rows);
}
exports.getMessages = getMessages;

//Sends message data on compose form submit to database
const sendMessage = function(message) {
  console.log("MESSAGE:", message);

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  return pool.query(`
  INSERT INTO messages (
    sender_id,
    receiver_id,
    content,
    sent_date
  ) VALUES ($1, $2, $3, $4)
  RETURNING *
  `, [message.sender_id, message.receiver_id, message.content, date])
  .then(res => res.rows[0])
  .catch(res => (console.log(res)));
}
exports.sendMessage = sendMessage;

//Populates "to" field as a receiver drop down menu
const getAllUsers = function(callback) {
  return pool.query(`
  SELECT * FROM users
  ORDER BY name ASC
  `)
  .then(res => callback(res.rows));
}
exports.getAllUsers = getAllUsers;

//Deletes a message from the actioning user's inbox
const deleteMessage = function(messageId) {

  return pool.query(`
  DELETE FROM messages
  WHERE id = $1;
  `, [messageId])
  .then(res => res.rows[0]);
}
exports.deleteMessage= deleteMessage;
