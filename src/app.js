const express = require("express");
const path = require("path");
const app = express();
require("./db/conn");
const Register = require("./models/register");
const Product = require("./models/product");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", template_path);

app.get("/", (req, res) => {
  res.render("temp_homepage", { pageTitle: "Welcome to EA, Sign In First" });
});

app.use((req, res, next) => {
  Register.findById("647a7b6d7ef10e245a6c674d")
    .then((userInDb) => {
      req.user = userInDb;
      next();
    })
    .catch((err) => console.log(err));
});

app.get("/login", (req, res) => {
  res.render("login", { pageTitle: "Sign In" });
});

app.get("/register", (req, res) => {
  res.render("register", { pageTitle: "Sign Up" });
});

app.get("/products", (req, res) => {
  res.render("products", { pageTitle: "Products" });
});

app.get("/our-team", (req, res) => {
  res.render("our_team", { pageTitle: "Our Team" });
});

app.get("/cart", (req, res) => {
  // Product.find().then((products) => {
  //   res.render("cart", { prods: products, pageTitle: "Cart" });
  // });
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.render("cart", {
        cart: user.cart,
        pageTitle: "Cart",
      });
    })
    .catch((err) => console.log(err));
});

app.post("/add-to-cart", (req, res) => {
  // Product.findById(req.body.id)
  //   .then((product) => {
  //     req.user.addToCart(product).then((result) => console.log("added"));
  //   })
  //   .catch((err) => console.log(err));

  req.user
    .addToCart(req.body.id)
    .then(() => console.log("added"))
    .catch((err) => console.log(err));
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmPassword;

    if (password === cpassword) {
      const newUser = new Register({
        email: req.body.email,
        password: password,
        confirmPassword: cpassword,
      });

      const registered = await newUser.save();
      // res.render("main_homepage");
      res.redirect("/login");
    } else {
      res.send("password are not match");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Register.findOne({ email: email });
    if (useremail.password === password) {
      // res.status(200).render("main_homepage");
      res.redirect("/home");
    } else {
      res.send("Email or Password is Incorrect");
    }
  } catch (error) {
    res.status(400).send("Account not found");
  }
});

app.post("/cart", async (req, res) => {
  try {
    const { imgURL, title, quantity, price, description } = req.body;

    const newProd = new Product({
      imgURL,
      title,
      quantity,
      price,
      description,
    });

    const added = await newProd.save();
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/delete-product", (req, res) => {
  try {
    Product.deleteOne({ _id: req.body.id }).then((result) => {
      res.redirect("home");
    });
  } catch (error) {
    res.send(error);
  }
});

app.post("/delete-item-cart", (req, res, next) => {
  req.user
    .removeCart(req.body.id)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
});

app.get("/about_us", (req, res) => {
  res.render("about_us", { pageTitle: "About Us" });
});

app.get("/home", (req, res) => {
  Product.find().then((products) => {
    res.render("main_homepage", {
      prods: products,
      pageTitle: "Welcome to EA",
      nameOfHeader: "List Items",
    });
  });
});

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
