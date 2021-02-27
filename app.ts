import { Application, Router, RouterContext } from "./deps.ts";

const app = new Application();

const router = new Router();

router.get("/", (ctx: RouterContext) => {
  ctx.response.body = "hello world";
});

router.post("/users", async (ctx: RouterContext) => {
  const body = ctx.request.body({ type: "form-data" });
  const formData = await body.value.read();
  console.log(formData.fields);
  ctx.response.body = "hello world";
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = 8000;

app.listen({ port });
console.log(`Server running at http://localhost:${port}`);
