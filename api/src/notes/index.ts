// 1. goal: create take_notes
// 2. take pagesToDelete
// 3. converts PDF to a langchain document
// 4. stores notes in the database

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";

import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { NOTES_TOOL_SCHEMA, NOTE_PROMPT, noteOutputParser } from "./prompts.js";
import { formatDocumentsAsString } from "langchain/util/document";
import { SupabaseDatabase } from "database.js";

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

const loadPdf = async (path: string) => {
  const loader = new PDFLoader(path);
  const docs = await loader.load();

  return docs;
};

const generateNotes = async (documents: Document[]) => {
  const documentsAsString = formatDocumentsAsString(documents);

  const model = new ChatOpenAI({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.0,
  });

  const modelWithTool = model.bind({
    tools: [NOTES_TOOL_SCHEMA],
  });

  const chain = NOTE_PROMPT.pipe(modelWithTool).pipe(noteOutputParser);

  const response = chain.invoke({
    paper: documentsAsString,
  });

  return response;
};

const takeNotes = async (pdfUrl: string, name: string) => {
  if (!pdfUrl.endsWith("pdf")) {
    throw new Error("not a pdf");
  }

  const database = await SupabaseDatabase.fromExistingIndex();
  // check that the PDFURL exists already
  const paper = await database.getPaper(pdfUrl);

  if (paper) {
    console.log(paper.notes);
    return paper.notes;
  }

  // 1. get the pdf from axios
  const data = await loadPaperFromUrl(pdfUrl);
  const path = await savePaperFromUrl(pdfUrl);

  // 2. convert pdf to langchain documents
  // load pdf
  const docs = await loadPdf(path);

  // 3. add newMetadata to the docs to allow the database to index by pdfURL
  const newDocs = docs.map((doc) => {
    return {
      ...doc,
      metadata: {
        ...doc.metadata,
        url: pdfUrl,
      },
    };
  });

  // 4. call generateNotes

  const notes = await generateNotes(newDocs);
  // 5. store the notes in supabase

  // const database = await SupabaseDatabase.fromDocuments(newDocs);

  // database.vectorStore.similaritySearch()

  // add paper to the dtabase
  // and addDocuments to the vector store
  // 6. return ntoes
  Promise.all([
    await database.addPaper({
      name,
      paperUrl: pdfUrl,
      notes,
      paper: formatDocumentsAsString(newDocs),
    }),
    database.vectorStore.addDocuments(newDocs),
  ]);

  return notes;
};

// takeNotes("https://arxiv.org/pdf/2404.15949.pdf", "test");
