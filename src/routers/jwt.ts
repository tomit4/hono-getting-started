import { Hono } from "hono";
import jsonwebtoken from "jsonwebtoken";
import { setCookie } from "hono/cookie";

const app = new Hono();

const access_token = jsonwebtoken.sign({ foo: "bar" }, process.env.JWT_SECRET, {
    algorithm: "HS256",
});

app.get("/", c => {
    // NOTE: Example of setting in cookie (generally  more secure)
    setCookie(c, "access_token", access_token, {
        path: "/",
        secure: true,
        domain: "localhost",
        httpOnly: true,
        maxAge: 1000,
        expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
        sameSite: "Strict",
    });
    // NOTE: Example of including in headers
    c.header("Authorization", `Bearer: ${access_token}`);
    return c.text("JWT Page");
});

export default app;
