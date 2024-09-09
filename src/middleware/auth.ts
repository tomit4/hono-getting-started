import { getCookie } from "hono/cookie";
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authHeaderMiddleware = async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.text("Unauthorized: Missing or invalid token", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jsonwebtoken.verify(token, JWT_SECRET);

        // c.set("user", decoded);
        return await next();
    } catch (error) {
        return c.text("Unauthorized: Invalid token", 401);
    }
};

const authCookieMiddleware = async (c, next) => {
    const allCookies = getCookie(c);
    const accessToken = allCookies["access_token"];

    if (!accessToken) {
        return c.text("Unauthorized: Missing token", 401);
    }

    try {
        const decoded = jsonwebtoken.verify(accessToken, JWT_SECRET);
        // c.set("user", decoded);
        return await next();
    } catch (error) {
        return c.text("Unauthorized: Invalid token", 401);
    }
};

export { authCookieMiddleware, authHeaderMiddleware };
