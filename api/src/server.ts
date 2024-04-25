import express from "express";

const main = () => {
  const app = express();
  const port = process.env.port || 8000;

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).send("hello world");
  });

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

main();
