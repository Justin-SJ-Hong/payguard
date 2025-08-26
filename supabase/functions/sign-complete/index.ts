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
    // SignWell Webhook에서 전송하는 데이터 구조
    const webhookData = await req.json();
    console.log("Webhook received:", webhookData);
    // Webhook 이벤트 타입 확인
    if (webhookData.event !== "document.completed") {
      return new Response(JSON.stringify({
        success: true,
        message: "Event ignored"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const documentId = webhookData.document_id;
    // 1. contracts 테이블에서 해당 document_id로 계약 찾기
    const { data: contract, error: contractError } = await supabase.from("contracts").select("*").eq("signwell_document_id", documentId).single();
    if (contractError || !contract) {
      console.error("Contract not found for document_id:", documentId);
      return new Response(JSON.stringify({
        error: "Contract not found"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 2. SignWell에서 서명 완료된 문서 정보 가져오기
    const signwellRes = await fetch(`https://api.signwell.com/v1/documents/${documentId}`, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SIGNWELL_API_KEY")}`
      }
    });
    const signwellData = await signwellRes.json();
    if (signwellData.status !== "completed") {
      return new Response(JSON.stringify({
        success: false,
        message: "Document not completed"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 3. 각 서명자별로 서명 이미지 다운로드 및 저장
    for (const signer of signwellData.signers){
      if (signer.signature_image_url) {
        const signatureRes = await fetch(signer.signature_image_url);
        const signatureBlob = await signatureRes.blob();
        // 서명 이미지 파일명 생성
        const signatureFileName = `signatures/${contract.id}/${signer.role}_${signer.name}_signature.png`;
        // Supabase Storage에 서명 이미지 저장
        const { data: signatureData, error: uploadError } = await supabase.storage.from("contract-signatures").upload(signatureFileName, signatureBlob);
        if (uploadError) {
          console.error("Signature upload failed:", uploadError);
          continue;
        }
        // 4. contracts 테이블 업데이트 (서명자별로 분리)
        if (signer.role === "Client") {
          await supabase.from("contracts").update({
            client_signature_url: signatureData.path,
            client_signature_name: signer.name,
            client_signature_date: signer.signed_at || new Date().toISOString()
          }).eq("id", contract.id);
        } else if (signer.role === "Freelancer") {
          await supabase.from("contracts").update({
            freelancer_signature_url: signatureData.path,
            freelancer_signature_name: signer.name,
            freelancer_signature_date: signer.signed_at || new Date().toISOString()
          }).eq("id", contract.id);
        }
      }
    }
    // 5. 최종 계약서 PDF 생성 (분리된 서명 정보 사용)
    const updatedContract = await supabase.from("contracts").select("*").eq("id", contract.id).single();
    const finalPdfRes = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("PDFMONKEY_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        document: {
          template_id: Deno.env.get("PDFMONKEY_FINAL_TEMPLATE_ID"),
          status: "draft",
          payload: {
            // 계약 데이터
            ...updatedContract.data,
            // 분리된 서명 정보
            client_signature_url: updatedContract.data.client_signature_url,
            client_signature_name: updatedContract.data.client_signature_name,
            client_signature_date: updatedContract.data.client_signature_date,
            freelancer_signature_url: updatedContract.data.freelancer_signature_url,
            freelancer_signature_name: updatedContract.data.freelancer_signature_name,
            freelancer_signature_date: updatedContract.data.freelancer_signature_date,
            contract_id: contract.id
          }
        }
      })
    });
    // 6. 최종 계약서 저장 및 상태 업데이트
    const finalPdfData = await finalPdfRes.json();
    const finalPdfUrl = finalPdfData.data?.attributes?.download_url;
    if (finalPdfUrl) {
      // 최종 계약서를 Supabase Storage에 저장
      const finalPdfRes2 = await fetch(finalPdfUrl);
      const finalPdfBlob = await finalPdfRes2.blob();
      const { data: finalPdfData2 } = await supabase.storage.from("contract-documents").upload(`contracts/${contract.id}/final_contract.pdf`, finalPdfBlob);
      // 7. 최종 상태 업데이트
      await supabase.from("contracts").update({
        status: "completed",
        final_pdf_url: finalPdfData2.path,
        completed_at: new Date().toISOString()
      }).eq("id", contract.id);
    }
    console.log("Contract completed successfully:", contract.id);
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error('서명 완료 처리 오류:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
