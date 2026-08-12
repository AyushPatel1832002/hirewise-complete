import re

path = "scripts/seed.mjs"
lines = open(path).read().split("\n")

# Find profileValues.push line (around 407) and the candidate skill picking before it
for i, l in enumerate(lines):
    if "Passionate ${title.toLowerCase()} with" in l:
        idx = i
        break

# Look backwards for where the candidate's picked skills are computed (candidateSkillValues build)
context = "\n".join(lines[idx - 40 : idx + 1])
m = re.search(r"(const skills = pickSkills\((?s:.*?)\);|const pickedSkills = pickSkills\((?s:.*?)\);)", context)
print("skill-var context:")
print(context[-600:])
