import "dotenv/config";
import { rankedSearchJobs, resolveSkillIdsByQuery } from "../server/db";
async function main() {
  const resolved = await resolveSkillIdsByQuery("js");
  const skillIds = Array.from(resolved);
  console.log("skillIds:", [...skillIds]);
  try {
    const res = await rankedSearchJobs({ query: "js", skillIds, pageSize: 5, cursor: null });
    console.log("OK rows:", res.rows.length, "totalExact:", res.totalExact, "totalWithTypo:", res.totalWithTypo);
  } catch (e: any) {
    console.log("ERR:", e?.message ?? e);
    if (e?.cause) console.log("CAUSE:", String(e.cause).slice(0, 300));
  }
  process.exit(0);
}
main();
