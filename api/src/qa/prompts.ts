import { ChatOpenAI, OpenAIClient } from "@langchain/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { BaseMessageChunk } from "langchain/schema";

// https://platform.openai.com/docs/assistants/tools/function-calling
// 1. FUNCTION CALLING

export const ANSWER_QUESTION_TOOL_SCHEMA: OpenAIClient.ChatCompletionTool = {
  type: "function",
  function: {
    name: "answer_quesiton",
    description: "answer to the question",
    parameters: {
      type: "object",
      properties: {
        answer: {
          type: "string",
          description: "the answer to the question",
        },
        followupQuestions: {
          type: "array",
          items: {
            type: "string",
            description: "followup questions the student should also ask",
          },
        },
      },
      required: ["answer", "followupQuestions"],
    },
  },
};

export const QA_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "ai",
    `You are a tenured professor of computer science helping a student with their research.
  The student has a question regarding a paper they are reading.
  Here are their notes on the paper:
  {notes}
  
  And here are some relevant parts of the paper relating to their question
  {relevantDocuments}
  
  Answer the student's question in the context of the paper. You should also suggest followup questions.
  Take a deep breath, and think through your reply carefully, step by step.`,
  ],
  ["human", "Question: {question}"],
]);

export const qaOutputParser = (message: BaseMessageChunk) => {
  const toolCalls = message.additional_kwargs.tool_calls;

  if (!toolCalls) {
    throw new Error("missing tools");
  }

  const output = toolCalls
    .map((tool) => {
      const args = JSON.parse(tool.function.arguments);
      return args;
    })
    .flat();

  return output;
};
