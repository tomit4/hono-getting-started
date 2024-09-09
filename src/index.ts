import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { secureHeaders } from "hono/secure-headers";

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { swaggerUI } from "@hono/swagger-ui";
import { pinoLogger } from "hono-pino-logger";

import bookRoute from "./routers/books";
import userRoute from "./routers/users";
import authRoute from "./routers/auth";
import authCookieRoute from "./routers/auth-cookie";
import jwtRoute from "./routers/jwt";

import corsConfig from "./middleware/cors";
import { authCookieMiddleware, authHeaderMiddleware } from "./middleware/auth";

const app = new OpenAPIHono();

app.use(pinoLogger());
app.use(secureHeaders());
app.use(cors(corsConfig));
app.use("/auth/*", authHeaderMiddleware);
app.use("/auth-cookie/*", authCookieMiddleware);

app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.use(
    "/dinotocat.png",
    serveStatic({ path: "./static/images/dinotocat.png" }),
);

app.get("/", serveStatic({ path: "./static/demo/index.html" }));

app.doc("/swagger", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "API",
    },
});

app.use("/docs", swaggerUI({ url: "/swagger" }));

const testSchema = z.object({
    message: z.string(),
});

const apiRoute = createRoute({
    method: "get",
    path: "/hello",
    responses: {
        200: {
            description: "Respond a message",
            content: {
                "application/json": {
                    schema: testSchema,
                },
            },
        },
    },
});

app.openapi(apiRoute, c => {
    return c.json({ message: "hello" });
});

const apiRouteTwo = createRoute({
    method: "post",
    path: "/hello",
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                },
            },
        },
    },
    responses: {
        200: {
            description: "Respond a message",
            content: {
                "application/json": {
                    schema: testSchema,
                },
            },
        },
    },
});

app.openapi(
    apiRouteTwo,
    zValidator("json", testSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "Invalid Format Passed." }, 400);
        }
        return c.json({ message: "hello there" });
    }),
);

app.get("/welcome", ({ header, status, html }) => {
    header("X-Message", "Hello!");
    header("Content-Type", "text/plain");

    status(201);

    return html("<h1>Thank you for coming!<h1>");
});

app.get("/welcome-2", ({ req, res, body }) => {
    console.log("req :=>", req);
    console.log("res :=>", res);
    return body("<h1>Thank you for coming again!!</h1>", 201, {
        "X-Message": "Hello!",
        "Content-Type": "text/html",
    });
});

app.route("/", userRoute);
app.route("/book", bookRoute);
app.route("/jwt", jwtRoute);
app.route("/", authRoute);
app.route("/", authCookieRoute);

app.notFound(c => {
    return c.json({ message: "404 not found" });
});

export default {
    port: process.env.PORT || 8000,
    fetch: app.fetch,
};
