import { app } from "./app";

app.listen({ port: Number(process.env.PORT) }).then(() => {
  console.log("HTTP Server Running!");
});
