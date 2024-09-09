import { Hono } from "hono";

const app = new Hono().basePath("/user");
app.get("/", c => c.text("List Users"));
app.post("/", c => c.text("Create User"));

export default app;
