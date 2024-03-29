const User = require('../models/user')

const usingMiddleware = async (req, res, next) => {
  try {
    if (req.session.user) {
      const findUserTest = await User.findById({ _id: req.session.user._id })
      req.user = findUserTest

      next()
    } else {
      next()
    }
  } catch (error) {
    res.json(error.message)
  }
}

module.exports = usingMiddleware
