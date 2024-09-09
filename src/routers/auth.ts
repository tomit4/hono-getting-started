import { Hono } from "hono";

const app = new Hono().basePath("/auth");

app.get("/welcome", c => {
    return c.text("Auth Page");
});

export default app;
