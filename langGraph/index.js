
import {
  StateGraph,
  StateSchema,
  START,
  END,
  MemorySaver,
} from "@langchain/langgraph";
 dsa
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import "dotenv/config";
// 1. Define State
const State = new StateSchema({
  review: z.string(),
  normalizedReview: z.string().default(""),
  analysisPrompt: z.string().default(
    "วิเคราะห์ความรู้สึกของรีวิวนี้ว่าเป็น Positive, Negative หรือ Neutral"
  ),
  sentiment: z.string().default(""),
  recommendation: z.string().default(""),
});

// 2. LLM
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite", 
  temperature: 0,
  streaming: false,
});

// Node A: เตรียมข้อมูล (ไม่ใช้ LLM)
async function prepare(state) {
  console.log("Preparing review...");

  return {
    normalizedReview: state.review.trim(),
  };
}

// Node B: วิเคราะห์รีวิว (ใช้ LLM)
async function analyze(state) {
  console.log("Analyzing with LLM...");

  const response = await model.invoke(`
    ${state.analysisPrompt}

    Review: ${state.normalizedReview}
  `);

  return {
    sentiment: String(response.content),
  };
}

// Node C: สร้างคำแนะนำ (ใช้ LLM)
async function recommend(state) {
  console.log("Generating recommendation...");

  const response = await model.invoke(`
    จากผลวิเคราะห์นี้ ช่วยให้คำแนะนำ:

    ${state.sentiment}
  `);

  return {
    recommendation: String(response.content),
  };
}

// 3. Checkpointer
const checkpointer = new MemorySaver();

// 4. Build Graph
export const graph = new StateGraph(State)
  .addNode("prepare", prepare)
  .addNode("analyze", analyze)
  .addNode("recommend", recommend)
  .addEdge(START, "prepare")
  .addEdge("prepare", "analyze")
  .addEdge("analyze", "recommend")
  .addEdge("recommend", END)
  .compile({ checkpointer });
