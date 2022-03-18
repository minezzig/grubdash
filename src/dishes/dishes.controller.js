const { clear } = require("console");
const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//----------VERIFICATIONS ----------
// verify that :dish exists
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish not found ${dishId}. Sorry` });
}

// veryify name property
function nameValid(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name.length) {
    return next();
  }
  next({ status: 400, message: "Dish must include a name." });
}
// veryify description property
function descriptionValid(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description.length) {
    return next();
  }
  next({ status: 400, message: "Dish must include a description." });
}
// veryify price property
function priceValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    next({ status: 400, message: "Dish must include a price" });
  }
  if (!Number.isInteger(price) || price <= 0) {
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }

  return next();
}
// veryify image_url property
function imageUrlValid(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url.length) {
    return next();
  }
  next({ status: 400, message: "Dish must include a image_url." });
}
// verify dishId
function dishIdMatches(req, res, next) {
  const { dishId } = req.params;
  const {
    data: { id },
  } = req.body;
  if (!id || dishId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

//--------------------------------

// GET:  list all dishes
function list(req, res, next) {
  res.json({ data: dishes });
}
// GET: read particular dish
function read(req, res, next) {
  res.json({ data: res.locals.dish });
}
// POST: create a new dish
function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
// PUT: update a particular dish
function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.status(200).json({ data: dish }); // !is this 201 or 200?
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [nameValid, descriptionValid, priceValid, imageUrlValid, create],
  update: [
    dishExists,
    dishIdMatches,
    nameValid,
    descriptionValid,
    priceValid,
    imageUrlValid,
    update,
  ],
};
