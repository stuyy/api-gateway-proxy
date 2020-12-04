import { createProxyMiddleware } from "http-proxy-middleware";

/**
 * Uses environment variables to switch between Development & Production Servers
 * Here we have a router that maps specific requests to their correct microservice.
 * We also have a pathRewrite set to a regular expression that consumes all characters after /api/
 * and then adds a "/" in front of it, and then is placed in front of the "/".
 * So if your request is /api/customers/payments, it'll consume "customers/payments" and
 * rewrite it to "/customers/payments"
 * We also have a target, this is the host the proxy is running on. You would want to
 * leave this as your localhost or the IP address of the Proxy Server
 */
const proxy = createProxyMiddleware({
  router: {
    "/auth": "http://localhost:5001",
    "/customers": "http://localhost:5002",
    "/payments": "http://localhost:5003",
  },
  target: "http://localhost:5000/",
  pathRewrite: {
    "^/api/(.*)$": "/$1",
  },
});

export default proxy;
