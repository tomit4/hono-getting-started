import { Hono } from "hono";

const app = new Hono().basePath("/auth-cookie");

app.get("/welcome", c => {
    return c.text("Auth Cookie Page");
});

export default app;
