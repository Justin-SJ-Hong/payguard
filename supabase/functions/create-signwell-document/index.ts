// index.ts (Supabase Edge Function editor에 그대로 붙여 넣으세요)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SIGNWELL_API_KEY = Deno.env.get("SIGNWELL_API_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "http://localhost:5173";
function ok(json, init = {}) {
  return new Response(JSON.stringify(json), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });
}
function err(status, message, detail) {
  return ok({
    error: message,
    detail
  }, {
    status
  });
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    // CORS preflight (functions.invoke로 호출 시 보통 필요 없음. 안전차원으로 둠)
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  }
  if (req.method !== "POST") {
    return err(405, "Method Not Allowed");
  }
  try {
    const body = await req.json();
    if (!body.template_id && !body.document_url) {
      return err(400, "template_id 또는 document_url 중 하나는 필요합니다.");
    }
    // 1) SignWell 문서 생성 페이로드
    const payload = {
      title: body.title,
      test_mode: body.test_mode ?? true,
      redirect_url: `${APP_URL}/signing/done?proposal_id=${encodeURIComponent(body.proposal_id)}`,
      redirect_decline_url: `${APP_URL}/signing/declined?proposal_id=${encodeURIComponent(body.proposal_id)}`,
      metadata: {
        proposal_id: body.proposal_id,
        ...body.metadata ?? {}
      },
      // ⚠️ 동시 서명 포인트: recipients에 'order'를 절대 넣지 않음
      recipients: body.recipients.map((r)=>({
          name: r.name,
          email: r.email,
          ...r.role ? {
            role: r.role
          } : {}
        }))
    };
    if (body.template_id) {
      payload.template_id = body.template_id;
    // TODO: 템플릿 필드 매핑 필요 시 merge_fields/custom_fields 등 추가
    } else {
      payload.document_url = body.document_url;
    }
    // 2) SignWell 문서 생성
    const createRes = await fetch("https://www.signwell.com/api/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Token token=${SIGNWELL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!createRes.ok) {
      const txt = await createRes.text();
      return err(createRes.status, "SignWell create failed", txt);
    }
    const created = await createRes.json();
    const documentId = created?.id;
    // 3) 임베디드 링크 수집 시도(플랜/설정에 따라 응답 구조가 다를 수 있어 'best-effort')
    // - 일부 계정/플랜: recipients 항목 안에 embedded_signing_url 같은 필드가 올 수 있음
    // - 오지 않으면 이메일 발송로만 진행
    let signerLinks;
    if (body.embedded) {
      const recs = Array.isArray(created?.recipients) ? created.recipients : [];
      for (const r of recs){
        const key = r?.role || r?.email;
        const url = r?.embedded_signing_url || r?.signing_url || r?.links?.embedded_signing || r?.links?.signing || null;
        if (key && url) {
          if (!signerLinks) signerLinks = {};
          signerLinks[key] = url;
        }
      }
    // 임베디드 링크가 응답에 없으면 signerLinks는 undefined로 둡니다(이메일 진행).
    }
    return ok({
      documentId,
      signerLinks
    });
  } catch (e) {
    return err(500, "Unexpected", String(e));
  }
});
