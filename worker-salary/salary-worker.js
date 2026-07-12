/**
 * 대기업 평균연봉 수집 Worker (Cloudflare)
 * - 주 1회 Cron으로 OpenDART(금융감독원 전자공시) 직원현황 API를 호출해
 *   기업별 1인평균급여액을 만들고 GitHub의 data/salary-compare.json 에 커밋한다
 *   → Cloudflare Pages 자동 재배포.
 * - 데이터 출처: 각 기업 사업보고서 "직원 현황" (법정 공시자료). 성별·사업부문별로
 *   나뉘어 오는 경우 인원수 가중평균으로 회사 전체 1인평균급여를 계산한다.
 *
 * 필요한 환경변수(Cloudflare 대시보드 Settings > Variables):
 *   DART_API_KEY   : Open DART 오픈API 인증키 (opendart.fss.or.kr)
 *   GH_TOKEN       : GitHub Personal Access Token (repo 권한) — rate-worker와 동일 토큰 재사용 가능
 *   GH_REPO        : "parkdane/pay-calc"
 *   GH_PATH        : "data/salary-compare.json"
 *   CF_DEPLOY_HOOK : Cloudflare Pages Deploy Hook URL — rate-worker와 동일 값 재사용 가능
 *
 * Cron 설정(wrangler.toml): 매주 월요일 새벽 6시 KST (=전날 21시 UTC 일요일)
 */

// 비교 대상 기업 (회사명 → OpenDART 고유번호 8자리)
// 기업 추가/삭제는 이 목록만 수정하면 됨
const COMPANIES = {
  "삼성전자": "00126380",
  "SK하이닉스": "00164779",
  "현대자동차": "00164742",
  "기아": "00106641",
  "현대모비스": "00164788",
  "HD현대중공업": "01390344",
  "NAVER": "00266961",
  "카카오": "00258801",
  "엔씨소프트": "00261443",
  "KT": "00190321",
  "LG화학": "00356361",
  "S-Oil": "00138279",
  "GS": "00500254",
  "POSCO홀딩스": "00155319",
  "KB금융": "00688996",
  "신한지주": "00382199",
  "CJ제일제당": "00635134",
  "삼성에스디에스": "00126186",
  "LG전자": "00401731",
  "LG이노텍": "00105961",
  "SK텔레콤": "00159023",
  "현대글로비스": "00360595",
  "현대건설": "00164478",
  "삼성물산": "00149655",
  "삼성바이오로직스": "00877059"
};

const num = (s) => Number(String(s ?? "").replace(/,/g, "")) || 0;

// 사업보고서 직원현황 응답 → 회사 전체 1인평균급여(가중평균)
// - "성별합계" 등 합계 성격의 사업부문 행이 있으면 그것만 사용 (중복 합산 방지)
// - 없으면 반환된 행 전체를 그대로 사용 (사업부문 구분이 없는 회사)
function computeWeightedAvg(rows) {
  const totalRows = rows.filter(
    (r) => (r.fo_bbm || "").includes("합계") || (r.fo_bbm || "").includes("전체")
  );
  const selected = totalRows.length > 0 ? totalRows : rows;

  let weightedSum = 0;
  let totalCount = 0;
  let tenureSum = 0;
  let tenureCount = 0;
  for (const r of selected) {
    const salary = num(r.jan_salary_am);
    const count = num(r.sm);
    if (salary > 0 && count > 0) {
      weightedSum += salary * count;
      totalCount += count;
    }
    const tenure = num(r.avrg_cnwk_sdytrn);
    if (tenure > 0 && count > 0) {
      tenureSum += tenure * count;
      tenureCount += count;
    }
  }
  if (totalCount === 0) return null;
  return {
    avgSalary: Math.round(weightedSum / totalCount),
    employeeCount: totalCount,
    avgTenure: tenureCount > 0 ? Math.round((tenureSum / tenureCount) * 10) / 10 : null,
  };
}

async function fetchOne(name, corpCode, apiKey, year) {
  const url = `https://opendart.fss.or.kr/api/empSttus.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
    });
    console.log(
      `  -> ${name} http status=${res.status} type=${res.type} content-type=${res.headers.get("content-type")} location=${res.headers.get("location")}`
    );
    if (res.status >= 300 && res.status < 400) {
      return { name, corpCode, ok: false, year, reason: `redirect_${res.status}_to_${res.headers.get("location")}` };
    }
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log(`  -> ${name} non-JSON response (first 200 chars): ${text.slice(0, 200)}`);
      return { name, corpCode, ok: false, year, reason: "non_json_response" };
    }
    if (data.status !== "000" || !Array.isArray(data.list) || data.list.length === 0) {
      return { name, corpCode, ok: false, year, reason: data.status };
    }
    const agg = computeWeightedAvg(data.list);
    if (!agg) return { name, corpCode, ok: false, year, reason: "no_salary_field" };
    return { name, corpCode, ok: true, year, ...agg };
  } catch (e) {
    console.log(`  -> ${name} fetch threw: ${String(e)} (name=${e && e.name})`);
    return { name, corpCode, ok: false, year, reason: e && e.name === "AbortError" ? "timeout_8s" : "fetch_error" };
  } finally {
    clearTimeout(timeout);
  }
}

// (재시도 로직 제거: Cloudflare 무료 플랜 요청 50개 한도를 절대 넘지 않도록
//  회사당 1회만 요청한다. 그 해 데이터가 없으면 failed 목록에 사유와 함께 표시된다.)

async function commitToGithub(env, content) {
  const { GH_TOKEN, GH_REPO, GH_PATH } = env;
  console.log("commitToGithub: GH_REPO=", GH_REPO, "GH_PATH=", GH_PATH, "GH_TOKEN set?", !!GH_TOKEN);
  const api = `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`;
  const headers = {
    Authorization: `Bearer ${GH_TOKEN}`,
    "User-Agent": "moneywatch-salary-worker",
    Accept: "application/vnd.github+json",
  };
  let sha;
  try {
    console.log("commitToGithub: checking existing sha...");
    const cur = await fetch(api, { headers });
    console.log("commitToGithub: sha check status", cur.status);
    if (cur.ok) sha = (await cur.json()).sha;
  } catch (e) {
    console.log("commitToGithub: sha check error", String(e));
  }

  const body = {
    message: `chore: update salary-compare data ${new Date().toISOString().slice(0, 10)}`,
    content: btoa(unescape(encodeURIComponent(content))),
    sha,
  };
  console.log("commitToGithub: PUT-ing file...");
  const res = await fetch(api, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  console.log("commitToGithub: PUT status", res.status);
  return res.ok;
}

async function run(env) {
  const now = new Date();
  console.log("DART_API_KEY set?", !!env.DART_API_KEY, "length:", (env.DART_API_KEY || "").length);
  // 사업보고서는 통상 3월 말까지 제출됨. 그 전이면 재작년치가 최신일 수 있어 -1년부터 시도.
  const primaryYear = now.getUTCMonth() + 1 <= 3 ? now.getUTCFullYear() - 2 : now.getUTCFullYear() - 1;

  const entries = Object.entries(COMPANIES);
  const results = [];
  // OpenDART 요청 과다 방지를 위해 순차 호출 (회사당 요청 1회 고정)
  let idx = 0;
  for (const [name, corpCode] of entries) {
    idx++;
    console.log(`[${idx}/${entries.length}] fetching ${name} (${corpCode}), year=${primaryYear}`);
    const r = await fetchOne(name, corpCode, env.DART_API_KEY, primaryYear);
    console.log(`[${idx}/${entries.length}] result:`, JSON.stringify(r));
    results.push(r);
  }
  console.log("all company fetches done, committing to GitHub...");

  const companies = results
    .filter((r) => r.ok)
    .map((r) => ({
      name: r.name,
      corpCode: r.corpCode,
      avgSalary: r.avgSalary,
      employeeCount: r.employeeCount,
      avgTenure: r.avgTenure,
      year: r.year,
    }))
    .sort((a, b) => b.avgSalary - a.avgSalary);

  const failed = results.filter((r) => !r.ok).map((r) => ({ name: r.name, reason: r.reason }));

  const payload = {
    updatedAt: new Date().toISOString(),
    source: "OpenDART(금융감독원 전자공시) 사업보고서 직원현황, 1인평균급여액 기준",
    note: "회사 전체 임직원(신입~임원) 평균이며 특정 연차·직급 기준이 아닙니다. 사업부문·성별별 인원수 가중평균으로 계산했습니다.",
    companies,
    failed,
  };

  const committed = await commitToGithub(env, JSON.stringify(payload, null, 2));

  let deployTriggered = false;
  if (committed && env.CF_DEPLOY_HOOK) {
    try {
      const hook = await fetch(env.CF_DEPLOY_HOOK, { method: "POST" });
      deployTriggered = hook.ok;
    } catch (e) {
      deployTriggered = false;
    }
  }

  return {
    ok: committed,
    companies: companies.length,
    failed: failed.length,
    failedList: failed,
    deployTriggered,
  };
}

export default {
  // 수동 트리거(테스트용): 브라우저로 Worker URL 열면 실행
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    // 브라우저가 자동으로 요청하는 favicon 등은 무시 (전체 로직 중복 실행 방지)
    if (pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }
    const result = await run(env);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "content-type": "application/json" },
    });
  },
  // 자동 트리거: Cron
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
};
