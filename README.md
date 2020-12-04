# Setting up an API Gateway & Microservices with a Proxy Server with Node.js, Express, and Digital Ocean

# Introduction

## What is a Proxy Server?

A proxy server is a server application that takes care of forwarding requests from a client or host to other hosts & servers. You can think of it similar to when going to a restaurant to eat.

You talk to the waiter and tell them what you would like to eat, rather than going straight to the cook. The waiter is a "proxy" for the cook, the waiter represents the cook by taking orders and requests, writing them down, and then passing along those requests to the cook.

The cook then finishes everything up, gives it to the waiter, and the waiter returns to your table with your meal.

## API Gateway

What is an API Gateway? An API Gateway is an application that is thought of as a middleman between the client, (Web, Mobile, Desktop app) and the backend services, (Node.js, Java, Python APIs).

The API Gateway is responsible for many things, one of it can be acting as a reverse proxy or proxy server by taking requests from a client and forwarding it to another host that provides a resource, and then sending it back to the client.

API Gateways can also take care of other things such as caching, rate limiting, etc. but we won't go into that.

## Setting up a Proxy Server as an API

There are a few steps to this procedure:

- We will use 2 separate cloud servers. You can purchase from AWS or Digital Ocean.
- We need to set up a Proxy Server application. If you want to use the one in this repository, go ahead. The installation instructions are down below.
- We will need to configure our cloud service's Firewall. This makes things VERY easy and I would highly recommend it for security concerns.
- We will need to setup NGINX on both of our cloud servers.

### 1) Setting up a Node.js Proxy Server

We will use a Proxy Server to setup an API Gateway. You can use any library you'd like depending on the environment you're in. I use Node.js, so I'll use [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) to handle proxying requests.

The Proxy Server will basically be our entry point to our entire application. In a microservice architecture, you face many issues involving things such as exposure of your microservices to the public. You don't want to allow your microservices to be reached directly from anyone. The only application that should be allowed to make requests to your microservices is the Proxy Server.

If you want to build your own proxy server you can, if you want to use the code in this repository, go right ahead. Below are the instructions on how to set up the project.

The project has 3 directories, it could have more for each additional microservice.

Each directory has its own `package.json` file, we do not share dependencies, so you'll need to either install the dependencies once at the root level, or go into each directory and run `npm i` or `yarn install`.

Each project has an `env` folder which has two .env files, `.env.dev` and `.env.prod`. This project uses `dotenv` as a dependency. You do not need to follow this structure, you can simply create one `.env` file and call dotenv's config function. However, I set this up to make it easy to switch between environments like `DEVELOPMENT` and `PRODUCTION`.

To run each application, you can run `yarn dev` or `npm run dev`. Note that in order for the scripts to work you'll need Typescript and ts-node installed, as well as nodemon. The dev script uses nodemon with ts-node as an interpreter.

`root` runs on Port 5000. `authentication` runs on Port 5001, and `customers` runs on Port 5002.

You can try to make a request to `http://localhost:5000/api/auth` or `http://localhost:5000/api/customers` and it should proxy the request successfully.

I encourage you to dive into the code yourself to learn how it works and use it to fit your needs. If you want to manage the proxy settings, they're located in `root/src/proxy.ts`. You can refer to [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) and look at their documentation.

### 2) Deploying our Applications to a VPS

Choose any VPS provider. AWS, Digital Ocean, Linode, etc. Preferably, choose one that comes with a Firewall. Digital Ocean comes with one, and I use Digital Ocean, so we'll use Digital Ocean.

It doesn't matter how you deploy your apps to a VPS, just make sure they're on there. We're not going to make this tutorial any more complicated, we won't set up a CI/CD tool or any Github Actions. Just use `scp` to transfer your files, make sure you remove the `node_modules` folder first otherwise it'll take much longer. Or if you forked the repository and have Github setup, you can just clone the repository to your server. You can do something like `scp -r project_directory server_username@server_hostname:~/destination/of/files` which will securely transfer your files from your local machine to your server in the path `~/destination/of/files`.

When you set up Digital Ocean for the first time, it will allow you to login as a root user, and it won't have `ufw` enabled. You can manage these things later. If you want to test your app on the VPS, you can just install Node.js or whatever tools you need, assuming you're using a different proxy app written in another language, and then run the app. You should be able to visit your application directly via the http://IP_ADDRESS:PORT since your firewall is not enabled.

You never want to allow ports to be enabled like that. This is where NGINX comes in. With NGINX, we can use it as a reverse proxy which will allow us to make a request to our IP address without the Port, (or a domain name if you configured it).

### 3) Configuring NGINX

Make sure you install NGINX first, or Apache, doesn't matter. If you prefer Apache and you know how to configure it yourself, then use it.

To install NGINX, simply do:

`sudo apt update`
`sudo apt install nginx`

Once NGINX is installed, you should ensure that NGINX is running, you can visit your ip address or domain name, and it should show a default web page. If you have `ufw` enabled, make sure you enable Nginx, you can do `sudo ufw allow 'Nginx HTTP'` to allow HTTP (Port 80 by default), or `sudo ufw allow 'Nginx Full'` to allow NGINX fully (HTTP and HTTPS).

We need to configure NGINX so that it will forward our requests to our Node.js application. Again, you don't want to allow a port directly and expose an application. Instead, let NGINX reverse proxy requests to that port.

Below is a simple configuration for our server, let's assume we have some random domain, google.com. This will allow us to visit google.com/api and it will proxy the request to localhost:5000. Since our app is listening on Port 5000, this makes sense.

I also have a rewrite rule that will consume any routes after `/api` and then when it's proxy passed, it is prefixed with `/api/$1` where `$1` is the captured value from the regular expression `^\/api\/(.*)$`.

```
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /var/www/html;
        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location /api {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                # try_files $uri $uri/ =404;
                rewrite ^\/api\/(.*)$ /api/$1 break;
                proxy_pass http://localhost:5000;
        }
}
```

Now, if you try to visit your ip address with `/api`, it should proxy pass the request to your Node.js App. Make sure your app is also running. The app won't do anything because we need to also setup NGINX on our 2nd server, the server that hosts our Microservices.

### 4) Setting up NGINX on Server B, the Microservices Host

Below is yet another simple NGINX configuration. Remember to install NGINX on the server.

This configuration has four locations, but focus on the three that are prefixed with `/api`. Each location proxy passes to localhost with a specific port. That is because we have each microservice running on its own port, and to allow access to it from our proxy server, we need to ensure NGINX is configured properly so that if our Proxy Server were to make a request to our Microservices, it can actually reach it.

Before you configure the firewall, I would urge you to try and configure NGINX on the microservices' server, and then visit each endpoint by going to `http://ip-address:5001/api/auth`, and then making sure it actually works. If you can verify the request is being made and a response is successful without the firewall enabled, then that means it is working, but we need the firewall to allow requests only from our Gateway's host.

```
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/html;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name _;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }

        location /api/auth {
                proxy_pass http://localhost:5001;
        }

        location /api/customers {
                proxy_pass http://localhost:5002;
        }

        location /api/payments {
                proxy_pass http://localhost:5003;
        }
}
```

Next we need to make sure only our Proxy Server's host is allowed to make requests to our 2nd server that hosts all of our microservices. We will configure our Cloud provider's firewall.

### 4) Configuring Digital Ocean's Firewall

In order to ensure our Proxy Server is the only host that can communicate directly with our microservices, we will host it on a separate server. Ideally, there are many ways you can handle this, but personally I feel like the best way to due this out of security concerns is by having two servers. Server A will host the Proxy Server application that forwards requests to Server B, which will host our microservice applications.

Server B will have a Firewall enabled, and not _just_ the built-in firewall that Ubuntu provides, ufw. Most Cloud Service providers such as Amazon Web Services and Digital Ocean provide their own Firewall that you can enable as an extra layer of security.

On Server B, we will ensure that we add a Firewall rule that only allows HTTP/s connections on Port 80 coming FROM Server A.

In this picture, you can see I have an inbound rule for HTTP set to allow connections from "api-gateway" which is the name of my Digital Ocean droplet. You can also manually enter IP addresses. Digital Ocean makes it easy to select options for your configurations, so I don't need to manually enter the IP of my api gateway host.

_Note_: Port 80 is the default port for HTTP that is configured by web servers like NGINX. If you have it set to a different port, then you need to ensure the Port Range is what you had set it to in NGINX or Apache.

![image](https://imgur.com/weuaiD0.png)

Now that we have the Firewall configured from our provider, we can additionally configure ufw to add an extra layer of security. Also note that if ufw is enabled but does not allow HTTP requests to Port 80, then it won't work.

To check the status of your firewall

`ufw status`

to allow a specific IP ADDRESS to access a specific PORT

`ufw allow from IP_ADDRESS to any port PORT`'

You can delete these rules at any time by doing `ufw status numbered` to check the rule number, and then `ufw delete RULE_NUMBER` providing the rule number.

### 5) Conclusion

Everything should technically work. If everything was done properly, then you should not be able to make direct requests to any of your microservices with its host's IP, but instead request the Proxy Server's host IP and providing the correct URL.

## Microservices

For a few months I've been interested in how microservice architecture works. There were a few problems that I had initially thought out, one of them being how we can persist the state of each request to ensure only authenticated users can access our protected resources.

When you have a monolith application, you literally only have 1 application running on a single port. Your web or mobile clients will call your monolith API every time it needs data. There are no other applications running that serve resources.

This can be a good or bad thing. There are many pros and cons and trade-offs on why you would want to use a monolith application vs. a microservice architecture, and vice versa. However, I will only focus on the pros of microservice to avoid going off-topic.

Microservices allow us to decouple our application into, literally, "micro" services. Instead of having all of your main endpoints under a single application, you split each main endpoint into its own microservice.

For example, consider the following endpoints:

```
GET /api/customers/orders/:orderId
GET /api/customers/orders/:orderId/payment

GET /api/customers/payments/methods
POST /api/customers/payments
DELETE /api/customers/payments
PUT /api/customers/payments
```

We have our "main" endpoint as "customers". Customers can have orders, payments, etc. While this is a relatively small application, it can grow overtime as we may need to add more endpoints, such as a feature that allows a customer to view their charges, or a feature that allows a customer to request a refund.

It gets to a point where you end up re-deploying your changes to production as a whole rather than as a single isolated change. It would be nice to not have to deploy our whole app and watch it break everything in production, rather deploy a single service and if it breaks we know what exactly caused it and it makes it easier to debug.

So intead of having our routes in one API, we can split it up into 2 microservices, one for the customers' orders, and one for the customers' payments.

The domain of each microservice should be self-explanatory. Orders Microservice should resemble all of the orders a customer has made (they can also be called transactions if you'd like). The payments microservice should be responsible for receiving Payment info, creating a payment method, etc.

These microservices then would run on their own port, e.g: Orders runs on Port 4001 and Payments runs on Port 4002, since you cannot have more than 1 process running on the same port.

We can then make requests to the Orders API, without needing to worry about it ever affecting the Payments API.

There are obviously many downsides to microservices, one of them being the fact that we may need to end up making additional network requests to other microservices to retrieve certain resources.
