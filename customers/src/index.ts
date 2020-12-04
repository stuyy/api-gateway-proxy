import "./bin";
import express from "express";
import session from "express-session";

const { ENVIRONMENT, COOKIE_SECRET } = process.env;

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      maxAge: 3600000 * 24,
    },
    secret: COOKIE_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/customers", (req, res) => {
  res.send({
    msg: "Customers API",
  });
});

app.listen(PORT, () =>
  console.log(`Running on Port ${PORT} in ${ENVIRONMENT} mode.`)
);
