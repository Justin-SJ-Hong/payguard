import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
serve(async (req)=>{
  try {
    const payload = await req.json();
    console.log("📩 Webhook payload:", payload);
    if (payload.event !== "document.completed") {
      return new Response("Ignored", {
        status: 200
      });
    }
    const docId = payload.data.id;
    // 계약 찾기
    const { data: contract } = await supabase.from("contracts").select("*").eq("signwell_document_id", docId).single();
    if (!contract) {
      return new Response("Contract not found", {
        status: 404
      });
    }
    const signers = payload.data.signers || [];
    const allSigned = signers.every((s)=>s.status === "signed");
    // 서명자 정보 업데이트
    for (const signer of signers){
      if (signer.role === "Client") {
        await supabase.from("contracts").update({
          client_signature_url: signer.signature_image_url,
          client_signature_name: signer.name,
          client_signature_date: signer.signed_at
        }).eq("id", contract.id);
      }
      if (signer.role === "Freelancer") {
        await supabase.from("contracts").update({
          freelancer_signature_url: signer.signature_image_url,
          freelancer_signature_name: signer.name,
          freelancer_signature_date: signer.signed_at
        }).eq("id", contract.id);
      }
    }
    // 모든 서명 완료 시
    if (allSigned && contract.status !== "completed") {
      const finalPdfUrl = payload.data.final_pdf_url;
      await supabase.from("contracts").update({
        status: "completed",
        final_pdf_url: finalPdfUrl,
        completed_at: new Date().toISOString()
      }).eq("id", contract.id);
      await supabase.from("proposals").update({
        status: "accepted"
      }).eq("id", contract.proposal_id);
      return new Response("Contract completed", {
        status: 200
      });
    }
    return new Response("Signer updated", {
      status: 200
    });
  } catch (err) {
    console.error("🔥 webhook error:", err);
    return new Response("Error", {
      status: 500
    });
  }
});
