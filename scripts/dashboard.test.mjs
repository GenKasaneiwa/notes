import assert from "node:assert/strict";
import { filterNotes, getAdjacentCategory, getSwipeDirection } from "./dashboard.js";

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

const categories = ["all", "Web", "AI / LLM", "読書"];
assert.equal(getAdjacentCategory(categories, "all", "next"), "Web");
assert.equal(getAdjacentCategory(categories, "Web", "previous"), "all");
assert.equal(getAdjacentCategory(categories, "読書", "next"), "all");
assert.equal(getAdjacentCategory(categories, "all", "previous"), "読書");
assert.equal(getAdjacentCategory(categories, "missing", "next"), "all");

assert.equal(getSwipeDirection(-90, 12), "next");
assert.equal(getSwipeDirection(90, 12), "previous");
assert.equal(getSwipeDirection(-30, 0), null);
assert.equal(getSwipeDirection(-90, 100), null);

console.log("dashboard filter tests passed");
