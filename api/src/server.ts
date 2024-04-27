import express from "express";
import { takeNotes } from "notes/index.js";
import { qaOutput } from "qa/index.js";

const main = () => {
  const app = express();
  const port = process.env.port || 8000;

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).send("hello world");
  });

  // make a new endpoint that calls takeNotes
  app.post("/take_notes", async (req, res) => {
    const { paperUrl, name } = req.body;
    // take notes requires
    // 1. pdfUrl: string, name: string
    const notes = await takeNotes(paperUrl, name);

    res.status(200).send(notes);
    return;
  });

  app.post("/qa", async (req, res) => {
    const { question, paperUrl } = req.body;

    const response = await qaOutput(question, paperUrl);
    res.status(200).send(response);
    return;
  });

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

main();
