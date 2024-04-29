// create a new supabase class
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Database } from "generated/db.js";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { ArxivNote } from "notes/prompts.js";

export const ARXIV_EMBEDDINGS_TABLE = "arxiv_embeddings";
export const ARXIV_PAPERS_TABLE = "arxiv_papers";
export const ARXIV_QUESTION_ANSWERING = "arxiv_question_answering";

export class SupabaseDatabase {
  client: SupabaseClient<Database, "public", any>;
  vectorStore: SupabaseVectorStore;

  constructor(client: SupabaseClient, vectorStore: SupabaseVectorStore) {
    this.client = client;
    this.vectorStore = vectorStore;
  }

  static async fromExistingIndex() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const privateKey = process.env.SUPABASE_PRIVATE_KEY;

    if (!supabaseUrl || !privateKey) {
      throw new Error("missing supabase access");
    }

    const client = createClient<Database>(supabaseUrl, privateKey);

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      {
        client: client,
        tableName: ARXIV_EMBEDDINGS_TABLE,
        queryName: "match_documents",
      }
    );

    return new this(client, vectorStore);
  }

  static async fromDocuments(documents: Document[]) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const privateKey = process.env.SUPABASE_PRIVATE_KEY;

    if (!supabaseUrl || !privateKey) {
      throw new Error("missing supabase access");
    }

    // make a new client
    const client = createClient<Database>(supabaseUrl, privateKey);
    // make a new vectorStore

    const vectorStore = await SupabaseVectorStore.fromDocuments(
      documents,
      new OpenAIEmbeddings(),
      {
        client: client,
        tableName: ARXIV_EMBEDDINGS_TABLE,
        queryName: "match_documents",
      }
    );

    return new this(client, vectorStore);
    // return the constructed class
  }

  async getPaper(
    paperUrl: string
  ): Promise<Database["public"]["Tables"]["arxiv_papers"]["Row"] | null> {
    const { data, error } = await this.client
      .from(ARXIV_PAPERS_TABLE)
      .select()
      .eq("arxiv_url", paperUrl);

    if (error || !data) {
      console.error("error getting paper from the database");
      return null;
    }
    return data[0];
  }

  async saveQa(
    question: string,
    answer: string,
    followupQuestions: string[],
    context: string
  ) {
    const { error } = await this.client.from(ARXIV_QUESTION_ANSWERING).insert({
      answer,
      context,
      followup_questions: followupQuestions,
      question,
    });

    if (error) {
      return null;
    }
    return;

    // answer: string | null
    // context: string | null
    // created_at: string | null
    // followup_questions: string[] | null
    // id: string
    // question: string | null
  }

  async addPaper({
    name,
    paperUrl,
    notes,
    paper,
  }: {
    name: string;
    paperUrl: string;
    notes: Array<ArxivNote>;
    paper: string;
  }) {
    const { data, error } = await this.client.from(ARXIV_PAPERS_TABLE).insert({
      name,
      arxiv_url: paperUrl,
      notes,
      paper,
    });

    if (!error) {
      return;
    }
    return data;
  }
}
