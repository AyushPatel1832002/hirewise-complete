import re

path = "scripts/seed.mjs"
src = open(path).read()

old_push = None
for line in src.split("\n"):
    if "We are looking for a talented" in line:
        old_push = line
        break
assert old_push, "jobValues push not found"

# The push block: it may span 1-2 lines (the template string literal continues)
# Replace the whole push statement with a version that references reqNames/allSkillNames.
# We'll replace the block from "const published = rand() < 0.85;" through the push's closing ");" and
# the subsequent [req, pref] lines, reordering: select skills first, then build description.

# Find indices in line list
lines = src.split("\n")
start = None
for i, l in enumerate(lines):
    if "const published = rand() < 0.85" in l:
        start = i
        break
end = None
for i in range(start, len(lines)):
    if "})`);" in lines[i] and start is not None and i < start + 5:
        end = i
        break
# find the [req, pref] = line right after the push
req_pref_idx = None
for i in range(end + 1, end + 5):
    if "const [req, pref]" in lines[i]:
        req_pref_idx = i
        break

block = lines[start:req_pref_idx + 1]
new_block = [
    "    const published = rand() < 0.85;",
    "    // Required vs preferred skills: first 2-4 required, rest preferred (needed early for description)",
    "    const [req, pref] = [template.cat.slice(0, 2 + Math.floor(rand() * 3)), template.cat.slice(2 + Math.floor(rand() * 3))];",
    "    const allSkillNames = [...req, ...pref].map((s) => resolveSkill(s)?.name).filter(Boolean);",
    "    const reqNames = req.map((s) => resolveSkill(s)?.name).filter(Boolean);",
    "    const desc = `We are looking for a talented ${template.title.toLowerCase()} to join our team. You will work on challenging problems with a collaborative group of engineers and product folks. ${allSkillNames.length ? `You will work with ${allSkillNames.slice(0, 6).join(\", \")}${allSkillNames.length > 6 ? \" and more\" : \"\"}. ` : \"\"}Requirements${reqNames.length ? `: strong experience with ${reqNames.join(\", \")}` : \"\"}, plus excellent problem-solving and communication skills. Responsibilities include designing, building, and shipping high-quality software, participating in code reviews, and mentoring teammates.`;",
    "    jobValues.push(`(${10000 + j}, ${companyId}, ${conn.escape(template.title + (template.sen === sen ? \"\" : ` (${sen})`))}, ${conn.escape(desc)}, ${conn.escape(sen)}, ${conn.escape(pick([",
    '    \"full-time\", \"full-time\", \"full-time\", \"part-time\", \"contract\"]))}, ${salaryMin}, ${salaryMax}, ${loc}, ${conn.escape(remote ? pick([\"remote\", \"hybrid\", \"flexible\"]) : pick([\"onsite\", \"hybrid\"]))}, ${published ? 1 : 0})`);',
]

lines[start:req_pref_idx + 1] = new_block
open(path, "w").write("\n".join(lines))
print("patched ok")
