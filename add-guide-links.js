const fs = require("fs");
const path = require("path");

const TARGETS = [
  { file: "app/calc/teacher-net/page.tsx", guideSlug: "teacher-net-guide", label: "교직수당·담임수당까지 반영한 계산법 자세히 보기" },
  { file: "app/calc/pension-net/page.tsx", guideSlug: "pension-net-guide", label: "구법·과도기·소득재분배 3단계 산식 자세히 보기" },
  { file: "app/calc/household-income/page.tsx", guideSlug: "household-income-guide", label: "가구소득과 개인 연봉이 다른 이유 알아보기" },
  { file: "app/calc/income-rank/page.tsx", guideSlug: "income-rank-guide", label: "평균 연봉과 중위 연봉이 다른 이유 알아보기" },
  { file: "app/calc/salary-compare/page.tsx", guideSlug: "salary-compare-guide", label: "DART 공시 1인평균급여액 제대로 읽는 법" },
  { file: "app/calc/deposit/page.tsx", guideSlug: "deposit-savings-guide", label: "이자소득세 15.4%는 왜 붙는지 알아보기" },
  { file: "app/calc/savings-goal/page.tsx", guideSlug: "savings-goal-guide", label: "1억 모으기, 현실적인 기간 계산법 알아보기" },
  { file: "app/calc/naeil-save/page.tsx", guideSlug: "naeil-save-guide", label: "정부지원 30만 원 받는 조건 자세히 보기" },
  { file: "app/calc/leap-save/page.tsx", guideSlug: "leap-save-guide", label: "2025년 기여금 확대, 뭐가 달라졌는지 보기" },
];

// Faq -> FaqJsonLd 순서로 등장하는 공통 지점을 찾음 (들여쓰기/줄바꿈 차이는 허용)
const ANCHOR_RE = /(<Faq\s+items=\{FAQ\}\s*\/>\s*<FaqJsonLd\s+items=\{FAQ\}\s*\/>)/;

function ensureLinkImport(content) {
  if (/from ["']next\/link["']/.test(content)) return content;
  // 마지막 import 문 뒤에 추가
  const importRe = /^import .+;\n/gm;
  let lastImportEnd = 0;
  let m;
  while ((m = importRe.exec(content)) !== null) {
    lastImportEnd = m.index + m[0].length;
  }
  if (lastImportEnd === 0) return content;
  return (
    content.slice(0, lastImportEnd) +
    'import Link from "next/link";\n' +
    content.slice(lastImportEnd)
  );
}

let successCount = 0;
for (const t of TARGETS) {
  const fullPath = path.join(process.cwd(), t.file);
  if (!fs.existsSync(fullPath)) {
    console.log(`[스킵] 파일 없음: ${t.file}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, "utf-8");

  if (content.includes(`/guide/${t.guideSlug}`)) {
    console.log(`[스킵] 이미 가이드 링크 있음: ${t.file}`);
    continue;
  }

  if (!ANCHOR_RE.test(content)) {
    console.log(`[스킵] 삽입 지점(Faq+FaqJsonLd) 못찾음: ${t.file}`);
    continue;
  }

  const guideBlock =
    `\n\n      <div className="rounded-xl border border-[rgba(46,68,148,0.14)] bg-[rgba(46,68,148,0.03)] p-4 text-sm">\n` +
    `        <Link href="/guide/${t.guideSlug}" className="font-medium text-[#2E4494] underline">\n` +
    `          ${t.label} →\n` +
    `        </Link>\n` +
    `      </div>`;

  content = content.replace(ANCHOR_RE, `$1${guideBlock}`);
  content = ensureLinkImport(content);

  fs.writeFileSync(fullPath, content, "utf-8");
  console.log(`[완료] ${t.file}`);
  successCount++;
}

console.log(`\n=== ${successCount}/${TARGETS.length}개 파일 처리 완료 ===`);
