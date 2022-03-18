const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /orders handlers needed to make the tests pass

//--------VERIFICATIONS--------
// verify that order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({ status: 404, message: `Order cannot be found ${orderId}.  Sorry.` });
}

// verify deliverTo property
function deliverToValid(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo.length) {
    return next();
  }
  next({ status: 400, message: `Order must include a deliverTo` });
}

// verify mobileNumber
function mobileNumberValid(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber.length) {
    return next();
  }
  next({ status: 400, message: `Order must include a mobileNumber` });
}

// verify that dishes is included correctly
function dishesValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!dishes) {
    next({ status: 400, message: `Order must include a dish` });
  }
  if (!Array.isArray(dishes) || !dishes.length) {
    next({ status: 400, message: `Order must include at least one dish` });
  }
  return next();
}

// verify dishQuantity //! maybe fix this so it returns multiple dish errors
function quantityValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const badDish = dishes.find(
    (dish) => !dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)
  );
  if (badDish) {
    const index = dishes.indexOf(badDish);
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }
  next();
}

// verify orderId matches
function orderIdMatches(req, res, next) {
  const { orderId } = req.params;
  const {
    data: { id },
  } = req.body;
  if (!id || orderId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not mathch route id. Order: ${id}, Route: ${orderId}.`,
  });
}

// verify status exists
function statusValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  const possibleStatus = ["pending", "preparing", "out-for-delivery"];
  if (status === "delivered") {
    next({ status: 400, message: `A delivered order cannot be changed` });
  }
  if (!status || !status.length || !possibleStatus.includes(status)) {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery or delivered`,
    });
  }
  next();
}

// verify status isn't pending
function pendingStatusValid(req, res, next) {
  const { order } = res.locals;
  if (order.status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`,
  });
}
//-----------------------------

// GET: list out all orders
function list(req, res, next) {
  res.json({ data: orders });
}

// GET: list out one indiviual order
function read(req, res, next) {
  res.json({ data: res.locals.order });
}

// POST: create a new order
function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = { id: nextId(), deliverTo, mobileNumber, dishes };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// PUT: update a specific order
function update(req, res, next) {
  const order = res.locals.order;
  const {
    data: { deliverTo, mobileNumber, dishes, status },
  } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.status = status;
  res.json({ data: order });
}

// DELETE: delete a particular order
function destroy(req, res, next) {
  const { orderId } = req.params;
  const indexOfOrder = orders.findIndex((order) => orderId === order.id);
  orders.splice(indexOfOrder, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    deliverToValid,
    mobileNumberValid,
    dishesValid,
    quantityValid,
    create,
  ],
  update: [
    orderExists,
    orderIdMatches,
    statusValid,
    deliverToValid,
    mobileNumberValid,
    dishesValid,
    quantityValid,
    update,
  ],
  delete: [orderExists, pendingStatusValid, destroy],
};

/**
 * before editing:
 * // verify dishQuantity //! maybe fix this so it returns multiple dish errors
function quantityValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const dishIssue = dishes.some((dish) => {
    if (dish.quantity === false || dish.quantity <= 0 || isNaN(dish.quantity)) {
      const badDish = dish;
    }
  });
  if (dishIssue) {
    const badDishIndex = dishes.indexOf(badDish);
    next({
      status: 400,
      message: `Dish ${badDishIndex} must have a quantity that is an integer greater than 0`,
    });
  }
  next();
}
 */
