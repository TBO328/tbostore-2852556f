import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORE_CONTEXT = `
أنت مساعد دعم فني ذكي لمتجر TBO Store. تتحدث بالعربية والإنجليزية.

معلومات المتجر:
- اسم المتجر: TBO Store
- نوع المتجر: متجر رقمي متخصص في بيع الاشتراكات والخدمات الرقمية
- التواصل: البريد الإلكتروني والواتساب

المنتجات المتوفرة:
1. الاشتراكات:
   - اشتراك نتفلكس بريميوم سنة: 299 ريال (السعر الأصلي 399)
   - اشتراك سبوتيفاي 6 أشهر: 99 ريال
   - اشتراك يوتيوب بريميوم سنة: 149 ريال (السعر الأصلي 199)

2. التصاميم:
   - تصميم لوجو احترافي: 199 ريال (السعر الأصلي 299)
   - باقة تصاميم سوشيال ميديا: 149 ريال
   - باقة صور مصغرة يوتيوب: 79 ريال (السعر الأصلي 99)

3. التفاعل:
   - 1000 متابع انستغرام: 49 ريال
   - 5000 لايك تيك توك: 39 ريال (السعر الأصلي 59)
   - 10000 مشاهدة يوتيوب: 89 ريال

4. ديسكورد:
   - ديسكورد نيترو سنة: 199 ريال (السعر الأصلي 249)
   - إعداد سيرفر ديسكورد: 149 ريال
   - بوت ديسكورد مميز: 99 ريال (السعر الأصلي 129)

طرق الدفع:
- STC Pay
- تحويل بنكي

سياسات المتجر:
- ضمان استرداد المال خلال 7 أيام
- دعم فني متاح 24/7
- توصيل فوري للمنتجات الرقمية

قواعد مهمة:
1. أجب فقط عن أسئلة متعلقة بالمتجر ومنتجاته وخدماته
2. إذا سأل المستخدم عن أي موضوع غير متعلق بالمتجر، اعتذر بلطف وأخبره أنك متخصص فقط في دعم متجر TBO Store
3. كن ودوداً ومختصراً في ردودك
4. استخدم الإيموجي باعتدال لجعل المحادثة ودية
5. إذا لم تعرف إجابة سؤال متعلق بالمتجر، اقترح التواصل مع الدعم الفني عبر صفحة التواصل
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: STORE_CONTEXT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "عذراً، الخدمة مشغولة حالياً. حاول مرة أخرى بعد قليل." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "خطأ في الخدمة. يرجى المحاولة لاحقاً." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "حدث خطأ. حاول مرة أخرى." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Support error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
