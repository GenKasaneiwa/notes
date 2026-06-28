import assert from "node:assert/strict";
import { filterNotes } from "./dashboard.js";

const notes = [
  { title: "バックエンドで今流行りの構成は？", description: "PostgreSQL と Redis", category: "Web" },
  { title: "読書メモ", description: "物語思考の要点", category: "読書" },
  { title: "暮らしの買い物", description: "机まわり", category: "暮らし" },
];

assert.deepEqual(filterNotes(notes, { query: "", category: "all" }), notes);
assert.deepEqual(filterNotes(notes, { query: "redis", category: "all" }), [notes[0]]);
assert.deepEqual(filterNotes(notes, { query: "物語", category: "読書" }), [notes[1]]);
assert.deepEqual(filterNotes(notes, { query: "物語", category: "Web" }), []);
assert.deepEqual(filterNotes(notes, { query: "  ", category: "暮らし" }), [notes[2]]);

console.log("dashboard filter tests passed");
