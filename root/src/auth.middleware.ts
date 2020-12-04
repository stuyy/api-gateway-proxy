import { Request, Response } from "express";

/**
 * This function is a gateway that only allows authenticated requests to be forwarded to the other microservices.
 * This is an optional middleware I'm using. You can use this to do any additional logic you'd wish
 * before forwarding the request.
 * e.g: Check if the user is authenticated already by searching the Database for the user's session ID.
 * @param req Request
 * @param res Response
 * @param next Next
 */

export default function authenticate(
  req: Request,
  res: Response,
  next: Function
) {
  console.log("Hello?");
  const { sessionID } = req;
  // Check if sessionID is in the Redis DB
  // If it is, call next() which will call the next middleware, in our case it'll be the proxy middleware.
  next();
}
