const fs = require("fs");
const path = require("path");

// app 폴더 전체를 재귀 탐색하며 page.tsx 파일 찾기
function findPageFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPageFiles(full, results);
    } else if (entry.name === "page.tsx") {
      results.push(full);
    }
  }
  return results;
}

// "export const metadata" 또는 "generateMetadata" 지점부터
// 중괄호 짝이 맞는 지점까지 정확히 추출 (문자열/템플릿 내부 중괄호는 무시)
function extractMetadataBlock(content) {
  const constMatch = content.search(/export const metadata/);
  const funcMatch = content.search(/export async function generateMetadata/);

  let startIdx, i;
  if (constMatch !== -1) {
    startIdx = constMatch;
    i = content.indexOf("{", content.indexOf("=", startIdx));
  } else if (funcMatch !== -1) {
    startIdx = funcMatch;
    // 함수 파라미터의 중괄호({ params })와 혼동되지 않도록 return 문의 중괄호부터 시작
    const returnIdx = content.indexOf("return", startIdx);
    if (returnIdx === -1) return null;
    i = content.indexOf("{", returnIdx);
  } else {
    return null;
  }
  if (i === -1) return null;
  let depth = 0;
  let inString = null; // '"' | "'" | "`" | null
  let end = -1;

  for (let j = i; j < content.length; j++) {
    const ch = content[j];
    const prev = content[j - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = j;
        break;
      }
    }
  }

  if (end === -1) return null;
  return content.slice(startIdx, end + 1);
}

const appDir = path.join(process.cwd(), "app");
const pageFiles = findPageFiles(appDir);

const out = [];
for (const file of pageFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const block = extractMetadataBlock(content);
  const relPath = path.relative(process.cwd(), file);
  out.push(`\n===== ${relPath} =====`);
  if (block) {
    const hasOG = block.includes("openGraph");
    out.push(`[openGraph 이미 있음: ${hasOG ? "YES" : "NO"}]`);
    out.push(block);
  } else {
    out.push("[metadata 없음]");
  }
}

const result = out.join("\n");
fs.writeFileSync("metadata-dump.txt", result, "utf-8");
console.log(`총 ${pageFiles.length}개 page.tsx 발견`);
console.log("metadata-dump.txt 파일로 저장 완료");
