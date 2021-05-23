import { Application, Router, RouterContext } from "./deps.ts";
import { scryptHash } from "./deps.ts";
import { Database, DataTypes, Model, SQLite3Connector } from "./deps.ts";
import { jwtCreate, jwtVerify } from "./deps.ts";

const app = new Application();

const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

const connector = new SQLite3Connector({
  filepath: "./database.db",
});

const db = new Database({ connector });

class User extends Model {
  static table = "user";
  static timestamps = true;
  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, length: 20, unique: true },
    password: { type: DataTypes.STRING, length: 250 },
  };
}

db.link([User]);
await db.sync({ drop: true });

interface UserSchema {
  username: string;
  password: string;
}

User.create({
  username: "tosone",
  password: "aaa",
});

const secret = "secret";

router.get("/", (ctx: RouterContext) => {
  ctx.response.body = "hello world";
})
  .post("/users", async (ctx: RouterContext) => {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value as UserSchema;
    const username: string = data.username;
    const password: string = data.password;
    if (password == "" || username == "") {
      ctx.response.status = 401;
      ctx.response.body = {
        msg: "username and password are required",
      };
      return;
    }
    var hashPassword = await scryptHash(password);

    const u = await User.where("username", username).get();
    if (u.length === 1) {
      ctx.response.status = 409;
      ctx.response.body = {
        msg: "username already exist",
      };
      return;
    }

    await User.create({
      username,
      password: hashPassword,
    });

    const token = await jwtCreate(
      { alg: "HS512", typ: "JWT" },
      { username },
      secret,
    );

    ctx.response.status = 201;
    ctx.response.body = {
      username,
      token: token,
    };
  })
  .get("/auth", async (ctx: RouterContext) => {
    const authorization = ctx.request.headers.get("authorization");
    if (authorization === "" || authorization === null) {
      ctx.response.status = 200;
      ctx.response.body = {
        msg: "token is invalid",
      };
      return;
    }
    const token = authorization.substring(7);
    const u = await jwtVerify(token, secret, "HS512");
    const username: string = u.username as string;
    const user = await User.select("username")
      .where("username", username)
      .get();
    if (user.length !== 1) {
      ctx.response.status = 401;
      ctx.response.body = {
        msg: "token is invalid",
      };
      return;
    }
    ctx.response.body = {
      username,
    };
  });

const port = 8000;

app.listen({ port });
console.log(`Server running at http://localhost:${port}`);
