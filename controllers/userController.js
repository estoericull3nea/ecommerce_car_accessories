const notifier = require('node-notifier')
const Product = require('../models/product')
const UserModel = require('../models/user')
const bcrypt = require('bcryptjs')

const addBookmark = async (req, res) => {
  try {
    req.user.addToBookmark(req.body.id).then(async () => {
      const product = await Product.findOne({ _id: req.body.id })

      notifier.notify({
        title: `Product ${product.title}!`,
        message: 'Added to bookmark!',
        wait: false,
      })
      res.redirect('/products')
    })
  } catch (error) {
    res.json(error.message)
  }
}

const getProfile = async (req, res) => {
  if (req.user) {
    const user = await UserModel.findById({ _id: req.user._id }).populate(
      'bookmarkId'
    )
    const cartCount = user.cart.items.length

    res.render('profile', {
      pageTitle: 'Profile',
      cartCount,
      user,
    })
  } else {
    res.render('profile', {
      pageTitle: 'Profile',
      cartCount: 0,
      user: null,
    })
  }
}

const editProfile = async (req, res) => {
  try {
    const { username, age, address, gender } = req.body
    const toBeUpdateOfUser = {}

    if (username) {
      toBeUpdateOfUser.username = username
    }

    if (age) {
      if (age < 0 || age > 300) toBeUpdateOfUser.age = ''
      else toBeUpdateOfUser.age = age
    }

    // if (address) {
    //   toBeUpdateOfUser.address = address
    // }

    if (gender) {
      toBeUpdateOfUser.gender = gender
      toBeUpdateOfUser.address = address
    }

    let profileToBeUpdate = ''
    if (req.file) {
      profileToBeUpdate = '/listOfPfps/' + req.file.originalname
      toBeUpdateOfUser.pfp = profileToBeUpdate
    }

    if (req.user) {
      await req.user.addToListOfPfp(profileToBeUpdate)
      await UserModel.findByIdAndUpdate(req.user._id, toBeUpdateOfUser)

      req.flash('success_msg', 'Profile Updated!')
      res.redirect('/user/profile')
    }
  } catch (error) {
    res.json(error.message)
  }
}

const deleteProfile = async (req, res) => {
  try {
    if (req.user.pfp === '/icons/default_pfp.png') {
      req.flash('error_msg', 'Nothing Change.')
      res.redirect('/user/profile')
    } else {
      req.user.deletePfp().then(() => {
        req.flash('success_msg', 'Profile Deleted!')
        res.redirect('/user/profile')
      })
    }
  } catch (error) {
    res.json(error.message)
  }
}

const deleteOneBookmark = async (req, res) => {
  req.user
    .deleteBookmark(req.body.id)
    .then(() => {
      notifier.notify({
        message: 'Bookmark Removed!.',
        wait: false,
      })
      res.redirect('/user/profile')
    })
    .catch((err) => console.log(err))
}

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body
    const match = await bcrypt.compare(password, req.user.password)
    if (match) {
      await UserModel.findByIdAndDelete(req.user.id)
      setTimeout(() => {
        req.session.destroy()
      }, 2000)

      req.flash('success_msg', 'Account deleted.')
      res.redirect('/auth/login')
    } else {
      req.flash('error_msg', 'Incorrect password.')
      res.redirect('/user/profile')
    }
  } catch (error) {
    res.json(error.message)
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body
    const match = await bcrypt.compare(oldPassword, req.user.password)
    if (match) {
      if (newPassword === confirmNewPassword) {
        const hashedPass = await bcrypt.hash(newPassword, 10)
        await UserModel.findByIdAndUpdate(req.user.id, { password: hashedPass })
        req.flash('success_msg', 'Password changed.')
        res.redirect('/auth/login')
      } else if (newPassword.length < 6) {
        req.flash('error_msg', 'Password must be 6 characters.')
        res.redirect('/user/profile')
      } else {
        req.flash('error_msg', 'Password not match.')
        res.redirect('/user/profile')
      }
    } else {
      req.flash('error_msg', 'Incorrect password.')
      res.redirect('/user/profile')
    }
  } catch (error) {
    res.json(error.message)
  }
}

module.exports = {
  addBookmark,
  getProfile,
  editProfile,
  deleteProfile,
  deleteOneBookmark,
  deleteAccount,
  forgotPassword,
}
