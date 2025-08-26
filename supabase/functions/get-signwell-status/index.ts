// index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SIGNWELL_API_KEY = Deno.env.get("SIGNWELL_API_KEY");
function ok(json, init = {}) {
  return new Response(JSON.stringify(json), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers ?? {}
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
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }
  if (req.method !== "GET") {
    return err(405, "Method Not Allowed");
  }
  const url = new URL(req.url);
  const documentId = url.searchParams.get("documentId");
  if (!documentId) {
    return err(400, "documentId required");
  }
  const res = await fetch(`https://www.signwell.com/api/v1/documents/${documentId}`, {
    headers: {
      "Authorization": `Token token=${SIGNWELL_API_KEY}`
    }
  });
  const text = await res.text();
  try {
    return ok(JSON.parse(text), {
      status: res.status
    });
  } catch  {
    return ok({
      raw: text
    }, {
      status: res.status
    });
  }
});
