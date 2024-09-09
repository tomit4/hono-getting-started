import { Hono } from "hono";
const app = new Hono();

app.get("/", c => c.text("List Books"));
app.get("/:id", c => {
    const id = c.req.param("id");
    return c.text(`Get Book: ${id}`);
});
app.post("/", c => c.text("Create Book"));

export default app;
