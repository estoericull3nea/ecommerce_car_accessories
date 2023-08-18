require('dotenv').config()

const UserMessage = require('../models/Message')
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  host: process.env.HOST,
  auth: {
    user: process.env.USER_AUTH_FOR_MAILER,
    pass: process.env.PASS_AUTH_FOR_MAILER,
  },
})

transporter.verify((err) => {
  if (err) {
    console.log(err)
  }
})

// getting
const getHomepage = (req, res) => {
  const token = req.cookies['access_token'] // check token if generated
  res.render('homepage', {
    pageTitle: 'EA',
    token,
  })
}

const getOurTeam = (req, res) => {
  const token = req.cookies['access_token']
  res.render('team', { pageTitle: 'Our Team', token })
}

const getFAQ = (req, res) => {
  const token = req.cookies['access_token']
  res.render('faq', { pageTitle: 'FAQ', token })
}

const getTermsAndConditions = (req, res) => {
  const token = req.cookies['access_token']
  res.render('terms', { pageTitle: 'Terms and Conditions', token })
}

const getPrivacyPolicy = (req, res) => {
  const token = req.cookies['access_token']
  res.render('privacy', { pageTitle: 'Privacy Policy', token })
}

const getAboutUs = (req, res) => {
  const token = req.cookies['access_token']
  res.render('about', { pageTitle: 'About Us', token })
}
// end of getting

const postContactUsForm = (req, res) => {
  const { name, email, message } = req.body

  let transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    host: process.env.HOST,
    auth: {
      user: process.env.USER_AUTH_FOR_MAILER,
      pass: process.env.PASS_AUTH_FOR_MAILER,
    },
  })

  const newMessage = new UserMessage({
    name,
    email,
    message,
  })

  newMessage.save().then(() => {
    const mailOptions = {
      to: process.env.MY_EMAIL,
      from: email,
      subject: 'User Queries! || New Contact Form',
      text: message,
    }

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log('failed')
      }
      res.render('sentMessage')
    })
  })
}

module.exports = {
  getOurTeam,
  getFAQ,
  getTermsAndConditions,
  getPrivacyPolicy,
  getAboutUs,
  getHomepage,
  postContactUsForm,
}
