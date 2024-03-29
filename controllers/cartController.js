const UserModel = require('../models/user')
const Product = require('../models/product')

const notifier = require('node-notifier')

const getCart = async (req, res) => {
  try {
    if (req.user) {
      const user = await UserModel.findById({ _id: req.user._id })
      const cartCount = user.cart.items.length

      const populateProductId = await user.populate('cart.items.productId')
      const populated = populateProductId.cart.items

      const allIdToRemove = []
      for (let i = 0; i < populateProductId.cart.items.length; i++) {
        allIdToRemove.push(populateProductId.cart.items[i].productId.id)
      }

      const user_address = user.address

      res.render('cart', {
        pageTitle: 'Cart',
        cartCount,
        populated,
        allIdToRemove,
        user_address,
        user,
      })
    } else {
      res.render('cart', {
        pageTitle: 'Cart',
        populated: undefined,
        cartCount: 0,
        allIdToRemove: [],
        user_address: '',
        user: null,
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const addToCart = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.id })
    req.user
      .addToCart(req.body.id)
      .then(() => {
        notifier.notify({
          title: `Product ${product.title}!`,
          message: 'Added.',
          wait: false,
        })
        res.redirect('/products')
      })
      .catch((err) => console.log(err))
  } catch (error) {
    res.json(error.message)
  }
}

const deleteItemInCart = async (req, res) => {
  const product = await Product.findOne({ _id: req.body.id })

  req.user
    .removeCart(req.body.id)
    .then(() => {
      notifier.notify({
        title: `Product ${product.title}!`,
        message: 'Removed!.',
        wait: false,
      })
      res.redirect('/cart')
    })
    .catch((err) => console.log(err))
}

module.exports = {
  getCart,
  deleteItemInCart,
  addToCart,
}
