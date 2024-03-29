const mongoose = require('mongoose')
const Product = require('../models/product')
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
    },
    address: {
      type: String,
    },
    pfp: {
      type: String,
    },
    default_pfp: {
      type: String,
    },
    listOfPfp: {
      type: [String],
    },
    bookmarkId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      required: true,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          qty: {
            type: Number,
            required: true,
          },
        },
      ],
      totalPrice: Number,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  { timestamps: true }
)

UserSchema.methods.deleteBookmarkAndCart = async function () {
  this.cart.items.splice(0, this.cart.items.length)
  this.bookmarkId.splice(0, this.bookmarkId.length)
  return this.save()
}

UserSchema.methods.deletePfp = async function () {
  this.pfp = '/icons/default_pfp.png'
  return this.save()
}

UserSchema.methods.addToListOfPfp = async function (pfpURL) {
  if (pfpURL) {
    if (!this.listOfPfp.includes(pfpURL)) {
      this.listOfPfp.push(pfpURL)
    }
    return this.save()
  }
}

UserSchema.methods.addToCart = async function (productId) {
  const product = await Product.findById(productId)

  if (product) {
    const cart = this.cart
    const isExisting = cart.items.findIndex(
      (objInItems) =>
        new String(objInItems.productId).trim() ===
        new String(product._id).trim()
    )

    if (isExisting >= 0) {
      cart.items[isExisting].qty += 1
    } else {
      cart.items.push({ productId: product._id, qty: 1 })
    }
    if (!cart.totalPrice) {
      cart.totalPrice = 0
    }
    cart.totalPrice += product.price
    return this.save()
  }
}

UserSchema.methods.addToBookmark = async function (productId) {
  const product = await Product.findById(productId)
  if (product) {
    if (!this.bookmarkId.includes(productId)) {
      this.bookmarkId.push(productId)
    }

    return this.save()
  }
}

UserSchema.methods.removeCart = async function (productId) {
  const cart = this.cart
  const isExisting = cart.items.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  )
  if (isExisting >= 0) {
    const prod = await Product.findById(productId)
    cart.totalPrice -= prod.price * cart.items[isExisting].qty
    cart.items.splice(isExisting, 1)
    return this.save()
  }
}

UserSchema.methods.deleteBookmark = async function (bookmarkId) {
  for (let i = 0; i < this.bookmarkId.length; i++) {
    if (this.bookmarkId[i]._id == bookmarkId) {
      this.bookmarkId.splice(i, 1)
      return this.save()
    }
  }
}

UserSchema.methods.removeAllCart = async function () {
  const cart = this.cart
  cart.items.splice(0, cart.items.length)
  this.cart.totalPrice = 0
  return this.save()
}

module.exports = new mongoose.model('User', UserSchema)
