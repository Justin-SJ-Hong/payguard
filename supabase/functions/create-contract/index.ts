import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { proposal_id } = await req.json();
    const pdfmonkeyApiKey = Deno.env.get("PDFMONKEY_API_KEY");
    const pdfmonkeyTemplateId = Deno.env.get("PDFMONKEY_TEMPLATE_ID");
    const signwellApiKey = Deno.env.get("SIGNWELL_API_KEY");
    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";
    if (!pdfmonkeyApiKey || !pdfmonkeyTemplateId || !signwellApiKey) {
      throw new Error("Missing required API keys");
    }
    // 1. 제안서 및 관련 데이터 조회
    const { data: proposal, error: proposalError } = await supabase.from("proposals").select("*").eq("id", proposal_id).single();
    if (proposalError || !proposal) {
      return new Response(JSON.stringify({
        error: "Proposal not found"
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    const [midpays, platforms, tools, attachments] = await Promise.all([
      supabase.from("proposal_midpays").select("*").eq("proposal_id", proposal_id).order("pay_order"),
      supabase.from("proposal_platforms").select("platform").eq("proposal_id", proposal_id),
      supabase.from("proposal_tools").select("tool").eq("proposal_id", proposal_id),
      supabase.from("proposal_attachments").select("*").eq("proposal_id", proposal_id)
    ]);
    // 2. PDFMonkey 초안 PDF 생성
    const pdfPayload = {
      document: {
        template_id: pdfmonkeyTemplateId.trim(),
        status: "draft",
        payload: {
          ...proposal,
          prepay_amount: Math.floor(proposal.total_amount * (proposal.prepay_ratio || 0) / 100),
          postpay_amount: Math.floor(proposal.total_amount * (proposal.postpay_ratio || 0) / 100),
          midpayAmounts: midpays.data || [],
          platforms: platforms.data?.map((p)=>p.platform) || [],
          tools: tools.data?.map((t)=>t.tool) || [],
          attachments: attachments.data || []
        }
      }
    };
    const pdfRes = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${pdfmonkeyApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pdfPayload)
    });
    if (!pdfRes.ok) {
      throw new Error(`PDFMonkey API error: ${await pdfRes.text()}`);
    }
    const pdfData = await pdfRes.json();
    const tempPdfUrl = pdfData.data?.attributes?.download_url;
    if (!tempPdfUrl) throw new Error("PDF URL missing from PDFMonkey response");
    // 3. SignWell 문서 생성 (클라이언트→프리랜서 순서)
    const signwellPayload = {
      test_mode: true,
      title: proposal.title || "Freelance Contract",
      files: [
        {
          name: "Contract",
          file_url: tempPdfUrl
        }
      ],
      signers: [
        {
          name: proposal.client_name,
          email: proposal.email,
          role: "Client",
          order: 1
        },
        {
          name: proposal.sender_name,
          email: proposal.sender_email,
          role: "Freelancer",
          order: 2
        }
      ],
      redirect_url: `${appUrl}/contracts/${proposal_id}/completed`,
      redirect_decline_url: `${appUrl}/contracts/${proposal_id}/declined`
    };
    const signwellRes = await fetch("https://api.signwell.com/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${signwellApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(signwellPayload)
    });
    if (!signwellRes.ok) {
      throw new Error(`SignWell API error: ${await signwellRes.text()}`);
    }
    const signwellData = await signwellRes.json();
    // 4. contracts 테이블에 저장
    const { data: contract, error: contractError } = await supabase.from("contracts").insert([
      {
        proposal_id,
        status: "pending_signature",
        signwell_document_id: signwellData.id,
        temp_pdf_url: tempPdfUrl,
        client_name: proposal.client_name,
        client_email: proposal.email,
        freelancer_name: proposal.sender_name,
        freelancer_email: proposal.sender_email,
        title: proposal.title,
        total_amount: proposal.total_amount,
        currency: proposal.currency,
        start_date: proposal.start_date,
        end_date: proposal.end_date
      }
    ]).select().single();
    if (contractError) throw contractError;
    return new Response(JSON.stringify({
      success: true,
      contractUrl: signwellData.signing_url,
      contractId: contract.id
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("🔥 create-contract error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
