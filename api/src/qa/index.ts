// write a  funciton that takes a question and then saves it to the database, generates the answer and outputs followup quesitons

import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ANSWER_QUESTION_TOOL_SCHEMA,
  QA_PROMPT,
  qaOutputParser,
} from "./prompts.js";
import { SupabaseDatabase } from "database.js";
import { ArxivNote } from "notes/prompts.js";
import { Document } from "langchain/document";
import { formatDocumentsAsString } from "langchain/util/document";

const qaModel = async (
  documents: Array<Document>,
  question: string,
  notes: Array<ArxivNote>
) => {
  const model = new ChatOpenAI({
    model: "gpt-3.5-turbo-0125",
    temperature: 0.0,
  });

  const modelWithTool = model.bind({
    tools: [ANSWER_QUESTION_TOOL_SCHEMA],
  });

  const chain = QA_PROMPT.pipe(modelWithTool).pipe(qaOutputParser);

  const response = await chain.invoke({
    notes: notes,
    relevantDocuments: documents,
    question,
  });

  return response;
};

export const qaOutput = async (question: string, paperUrl: string) => {
  //  1.
  // 1. takes in question passes it to qaModel
  // 2. get back answers and followUPquesitons
  // 3. returns those?

  const database = await SupabaseDatabase.fromExistingIndex();

  const documents = await database.vectorStore.similaritySearch(question, 8, {
    url: paperUrl,
  });

  const notes = await database.getPaper(paperUrl);

  const answerAndFollowUp = await qaModel(
    documents,
    question,
    notes as unknown as ArxivNote[]
  );

  // before returning, we want to save the answeres to the database so we can cache for next time
  // 1. save the qa and followupQuestion to the database

  await Promise.all(
    answerAndFollowUp.map(async (qa) => {
      await database.saveQa(
        question,
        qa.answer,
        qa.followupQuestions,
        formatDocumentsAsString(documents)
      );
    })
  );

  return answerAndFollowUp;
};
