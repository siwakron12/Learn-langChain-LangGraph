import { graph } from "./index.js";

const config = {
  configurable: {
    thread_id: "review-001",
  },
};

// รอบแรก
const result = await graph.invoke(
  {
    review: "สินค้าดีมาก แต่จัดส่งช้าไปหน่อย",
  },
  config
);

console.log("First result:", result);

// 1. ดู Checkpoint History
const history = [];

for await (const snapshot of graph.getStateHistory(config)) {
  history.push(snapshot);
}

// 2. เลือก Checkpoint ก่อนเข้า Node analyze
const target = history.find(
  (snapshot) => snapshot.next.includes("analyze")
);

if (!target) {
  throw new Error("Checkpoint before analyze not found");
}

// 3. เปลี่ยน Prompt ณ Checkpoint นั้น
const forkConfig = await graph.updateState(
  target.config,
  {
    analysisPrompt:
      "วิเคราะห์รีวิวนี้อย่างละเอียด โดยเน้นข้อเสียและปัญหาที่ลูกค้าพบ"
  }
);

// 4. Replay ต่อจาก Checkpoint ที่แก้ไขแล้ว
const replayResult = await graph.invoke(
  null,
  forkConfig
);

console.log("Replay result:", replayResult);