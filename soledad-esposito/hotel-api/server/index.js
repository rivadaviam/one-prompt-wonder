import { app } from "./app.js";

const port = Number(process.env.PORT) || 8787;

app.listen(port, () => {
  console.log(`API ready at http://localhost:${port}`);
});
