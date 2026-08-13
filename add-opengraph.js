const fs = require("fs");
const path = require("path");

// 대상 파일 24개 (app/page.tsx는 metadata 자체가 없어서 제외 - 루트 레이아웃 OG를 그대로 씀, 정상)
const TARGET_FILES = [
  "app/about/page.tsx",
  "app/calc/business-breakeven/page.tsx",
  "app/calc/civil-net/page.tsx",
  "app/calc/deposit/page.tsx",
  "app/calc/fire/page.tsx",
  "app/calc/household-income/page.tsx",
  "app/calc/income-rank/page.tsx",
  "app/calc/leap-save/page.tsx",
  "app/calc/military-net/page.tsx",
  "app/calc/naeil-save/page.tsx",
  "app/calc/page.tsx",
  "app/calc/pension-net/page.tsx",
  "app/calc/salary-compare/page.tsx",
  "app/calc/savings-goal/page.tsx",
  "app/calc/soldier-save/page.tsx",
  "app/calc/teacher-net/page.tsx",
  "app/calc/worker-net/page.tsx",
  "app/calc/youth-compare/page.tsx",
  "app/calc/youth-save/page.tsx",
  "app/contact/page.tsx",
  "app/guide/page.tsx",
  "app/guide/[slug]/page.tsx",
  "app/privacy/page.tsx",
  "app/rates/page.tsx",
  "app/salary/page.tsx",
  "app/salary/[slug]/page.tsx",
];

// 객체 속성 값의 경계를 정확히 찾기 (문자열/템플릿/괄호 깊이 추적)
// "제목 문자열" / `템플릿 ${expr}` / g.title 같은 변수참조 전부 지원
function extractPropertyValue(content, startAfterColon) {
  let i = startAfterColon;
  while (/\s/.test(content[i])) i++;
  let depth = 0;
  let inString = null;
  const start = i;
  while (i < content.length) {
    const ch = content[i];
    if (inString) {
      if (ch === "\\") { i += 2; continue; }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; i++; continue; }
    if (ch === "(" || ch === "[" || ch === "{") { depth++; i++; continue; }
    if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0) break;
      depth--; i++; continue;
    }
    if (ch === "," && depth === 0) break;
    i++;
  }
  return { text: content.slice(start, i).trim(), end: i };
}

// metadata 객체(또는 generateMetadata의 return 객체)의 시작 '{' 와 끝 '}' 위치 찾기
function findMetadataBlock(content) {
  const constMatch = content.search(/export const metadata/);
  const funcMatch = content.search(/export async function generateMetadata/);

  let start;
  if (constMatch !== -1) {
    start = content.indexOf("{", content.indexOf("=", constMatch));
  } else if (funcMatch !== -1) {
    const returnIdx = content.indexOf("return", funcMatch);
    if (returnIdx === -1) return null;
    start = content.indexOf("{", returnIdx);
  } else {
    return null;
  }
  if (start === -1) return null;

  let depth = 0;
  let inString = null;
  let end = -1;
  for (let j = start; j < content.length; j++) {
    const ch = content[j];
    const prev = content[j - 1];
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) { end = j; break; }
    }
  }
  if (end === -1) return null;
  return { start, end };
}

function processFile(relPath) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[스킵] 파일 없음: ${relPath}`);
    return;
  }
  const content = fs.readFileSync(fullPath, "utf-8");

  const block = findMetadataBlock(content);
  if (!block) {
    console.log(`[스킵] metadata 블록 못찾음: ${relPath}`);
    return;
  }
  const blockText = content.slice(block.start, block.end + 1);
  if (blockText.includes("openGraph")) {
    console.log(`[스킵] 이미 openGraph 있음: ${relPath}`);
    return;
  }

  const titleKeyIdx = blockText.search(/\btitle\s*:/);
  const descKeyIdx = blockText.search(/\bdescription\s*:/);
  if (titleKeyIdx === -1 || descKeyIdx === -1) {
    console.log(`[스킵] title/description 못찾음: ${relPath}`);
    return;
  }

  const titleColonEnd = blockText.indexOf(":", titleKeyIdx) + 1;
  const descColonEnd = blockText.indexOf(":", descKeyIdx) + 1;
  const titleVal = extractPropertyValue(blockText, titleColonEnd);
  const descVal = extractPropertyValue(blockText, descColonEnd);

  if (!titleVal.text || !descVal.text) {
    console.log(`[스킵] 값 추출 실패: ${relPath}`);
    return;
  }

  const ogBlock =
    `\n  openGraph: {\n    title: ${titleVal.text},\n    description: ${descVal.text},\n  },`;

  // 블록의 마지막 '}' 바로 앞에 삽입. 그 직전에 쉼표가 없으면(한 줄짜리 객체 등) 쉼표 보충
  const insertPos = block.end;
  const before = content.slice(0, insertPos);
  const trimmedBefore = before.replace(/\s+$/, "");
  const needsComma = trimmedBefore.length > 0 && trimmedBefore[trimmedBefore.length - 1] !== ",";
  const prefix = needsComma ? trimmedBefore + "," : trimmedBefore + (before.endsWith(",") ? "," : "");

  const newContent = prefix + ogBlock + "\n" + content.slice(insertPos);

  fs.writeFileSync(fullPath, newContent, "utf-8");
  console.log(`[완료] ${relPath}`);
}

console.log(`=== ${TARGET_FILES.length}개 파일 처리 시작 ===\n`);
for (const f of TARGET_FILES) {
  processFile(f);
}
console.log("\n=== 전체 완료 ===");
