import "dotenv/config";
import { facetCountsForJobs } from "../server/db";
const res = await facetCountsForJobs({ query: "js", skillIds: [] });
console.log(JSON.stringify(res, null, 1).slice(0, 300));
process.exit(0);
