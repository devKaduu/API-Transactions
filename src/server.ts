import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

import { app } from "./app";

app.listen({ port: Number(process.env.PORT) }).then(() => {
  console.log("HTTP Server Running!");
});
