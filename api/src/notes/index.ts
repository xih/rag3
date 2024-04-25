// 1. goal: create take_notes
// 2. take pagesToDelete
// 3. converts PDF to a langchain document
// 4. stores notes in the database

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";

import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";

const loadPaperFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return response.data;
};

const savePaperFromUrl = async (url: string) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const randomName = uuidv4();
  const directory = "pdfs";

  if (!existsSync(directory)) {
    mkdirSync(directory);
    console.log("Directory created successfully.");
  } else {
    console.log("Directory already exists.");
  }

  const filePath = path.join("pdfs", `${randomName}.pdf`);

  await writeFile(filePath, response.data, "binary");
  console.log("written to file successfully");

  return filePath; // return the filePath that it was saved
};

const takeNotes = async (pdfUrl: string) => {
  if (!pdfUrl.endsWith("pdf")) {
    throw new Error("not a pdf");
  }

  // 1. get the pdf from axios
  const data = await loadPaperFromUrl(pdfUrl);
  const path = await savePaperFromUrl(pdfUrl);

  console.log(data, "data");
};

takeNotes("https://arxiv.org/pdf/2305.15334.pdf");
