const fs = require("fs");
const path = require("path");

// 가이드 없는 9개 계산기
const TARGET_FILES = [
  "app/calc/teacher-net/page.tsx",
  "app/calc/pension-net/page.tsx",
  "app/calc/household-income/page.tsx",
  "app/calc/income-rank/page.tsx",
  "app/calc/salary-compare/page.tsx",
  "app/calc/deposit/page.tsx",
  "app/calc/savings-goal/page.tsx",
  "app/calc/naeil-save/page.tsx",
  "app/calc/leap-save/page.tsx",
];

const out = [];
for (const relPath of TARGET_FILES) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    out.push(`\n===== ${relPath} =====\n[파일 없음]`);
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");
  const tail = lines.slice(-25).join("\n"); // 마지막 25줄
  out.push(`\n===== ${relPath} =====\n${tail}`);
}

fs.writeFileSync("calc-tail-dump.txt", out.join("\n"), "utf-8");
console.log(`${TARGET_FILES.length}개 파일 처리 완료 -> calc-tail-dump.txt 저장`);
