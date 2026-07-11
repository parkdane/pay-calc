/**
 * 금리 수집 Worker (Cloudflare)
 * - 매일 Cron으로 금감원 오픈API를 호출해 정기예금·적금 최고금리 데이터를 만들고
 *   GitHub의 data/rates.json 에 커밋한다 → Cloudflare Pages 자동 재배포.
 *
 * 필요한 환경변수(Cloudflare 대시보드 Settings > Variables):
 *   FSS_AUTH_KEY   : 금융감독원 오픈API 인증키
 *   GH_TOKEN       : GitHub Personal Access Token (repo 권한)
 *   GH_REPO        : "parkdane/pay-calc"
 *   GH_PATH        : "data/rates.json"
 *
 * Cron 설정(wrangler.toml): 매일 새벽 6시 KST(=21시 UTC 전날)
 */

const FIN_GROUPS = ["020000", "030300", "030200"]; // 은행, 저축은행, (인터넷은행은 은행에 포함)

async function fetchProducts(kind, authKey) {
  // kind: 'deposit'(정기예금) | 'saving'(적금)
  const endpoint =
    kind === "deposit" ? "depositProductsSearch" : "savingProductsSearch";
  const all = [];
  for (const grp of FIN_GROUPS) {
    const url = `http://finlife.fss.or.kr/finlifeapi/${endpoint}.json?auth=${authKey}&topFinGrpNo=${grp}&pageNo=1`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const base = data?.result?.baseList ?? [];
      const opt = data?.result?.optionList ?? [];
      // 상품별 최고 저축금리(우대 포함) 매칭
      for (const b of base) {
        const opts = opt.filter((o) => o.fin_prdt_cd === b.fin_prdt_cd);
        // 12개월 기준 우선, 없으면 최댓값
        const o12 = opts.find((o) => String(o.save_trm) === "12") ?? opts[0];
        if (!o12) continue;
        all.push({
          bank: b.kor_co_nm,
          product: b.fin_prdt_nm,
          baseRate: Number(o12.intr_rate) || 0,
          maxRate: Number(o12.intr_rate2) || Number(o12.intr_rate) || 0,
          term: Number(o12.save_trm) || 12,
          group:
            grp === "020000" ? "은행" : grp === "030300" ? "저축은행" : "기타",
          joinWay: b.join_way || "",
          note: b.spcl_cnd ? b.spcl_cnd.slice(0, 120) : "",
        });
      }
    } catch (e) {
      // 개별 그룹 실패는 무시하고 계속
    }
  }
  // 최고금리 내림차순, 상위 20개
  return all
    .filter((x) => x.maxRate > 0)
    .sort((a, b) => b.maxRate - a.maxRate)
    .slice(0, 20);
}

async function commitToGithub(env, content) {
  const { GH_TOKEN, GH_REPO, GH_PATH } = env;
  const api = `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`;
  const headers = {
    Authorization: `Bearer ${GH_TOKEN}`,
    "User-Agent": "moneywatch-rate-worker",
    Accept: "application/vnd.github+json",
  };
  // 기존 파일 sha 조회 (있으면 업데이트)
  let sha;
  try {
    const cur = await fetch(api, { headers });
    if (cur.ok) sha = (await cur.json()).sha;
  } catch (e) {}

  const body = {
    message: `chore: update deposit/saving rates ${new Date().toISOString().slice(0, 10)}`,
    content: btoa(unescape(encodeURIComponent(content))),
    sha,
  };
  const res = await fetch(api, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  return res.ok;
}

async function run(env) {
  const [deposits, savings] = await Promise.all([
    fetchProducts("deposit", env.FSS_AUTH_KEY),
    fetchProducts("saving", env.FSS_AUTH_KEY),
  ]);
  const payload = {
    updatedAt: new Date().toISOString(),
    source: "금융감독원 금융상품통합비교공시 오픈API",
    deposits,
    savings,
  };
  const committed = await commitToGithub(env, JSON.stringify(payload, null, 2));

  // 커밋 성공 시 Cloudflare Pages Deploy Hook 호출 → 수동 재배포 트리거
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
    deposits: deposits.length,
    savings: savings.length,
    deployTriggered,
  };
}

export default {
  // 수동 트리거(테스트용): 브라우저로 Worker URL 열면 실행
  async fetch(request, env) {
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
