import "./bin";
import express from "express";
import session from "express-session";
import proxy from "./proxy";
import authenticate from "./auth.middleware";

const { ENVIRONMENT, COOKIE_SECRET } = process.env;

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      maxAge: 86400000,
    },
    secret: COOKIE_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

// Sets the default route to "/api"
app.use("/api", authenticate, proxy);

// Listen to requests
app.listen(PORT, () =>
  console.log(`Running on Port ${PORT} in ${ENVIRONMENT} mode.`)
);
