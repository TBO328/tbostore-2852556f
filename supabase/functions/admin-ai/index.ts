import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في إدارة متجر TBO Store. يمكنك تعديل محتوى الموقع، المنتجات، الأيقونات، والصفحات.

## قدراتك:
1. تعديل محتوى الصفحات (النصوص والصور)
2. إضافة/تعديل/حذف المنتجات
3. تعديل الأيقونات في الموقع
4. تعديل التقييمات
5. تعديل الشركاء
6. تعديل إعدادات الدفع

## هيكل قاعدة البيانات:

### جدول products:
- id, name_en, name_ar, description_en, description_ar, price, original_price, category, image_url, in_stock, rating, reviews_count

### جدول page_content:
- id, page_key, title_en, title_ar, content_en, content_ar, image_url, metadata (JSON)
- page_key يمكن أن يكون: home, about, contact, products, policies, reviews, icons

### جدول reviews:
- id, customer_name, rating, review_text_en, review_text_ar, product_name_en, product_name_ar, is_approved, customer_avatar

### جدول partners:
- id, name, logo_url, is_active, display_order

### جدول payment_settings:
- id, setting_key, setting_value
- setting_key: stc_pay_number, bank_name, bank_account_name, bank_iban

### جدول coupons:
- id, code, discount_percent, expires_at, is_active

## تعليمات مهمة:
- عند طلب تعديل، قم بتحليل الطلب وتحديد الجدول والحقول المطلوب تعديلها
- أعد الإجراء المطلوب بصيغة JSON محددة
- كن دقيقاً في الاستجابة واشرح ما ستفعله قبل التنفيذ
- إذا كان الطلب غير واضح، اطلب توضيحاً

## صيغة الاستجابة:
عندما تريد تنفيذ إجراء، أعد JSON بهذا الشكل:
{
  "action": "update" | "insert" | "delete",
  "table": "products" | "page_content" | "reviews" | "partners" | "payment_settings" | "coupons",
  "data": { ... البيانات ... },
  "condition": { ... شروط التحديث/الحذف ... },
  "message": "شرح ما تم تنفيذه"
}

إذا كنت تريد فقط الرد بدون إجراء:
{
  "action": "none",
  "message": "الرد النصي"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, executeAction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If executeAction is provided, execute the database action
    if (executeAction) {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase credentials not configured');
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { action, table, data, condition } = executeAction;

      let result;
      
      if (action === 'update') {
        if (table === 'page_content' && condition?.page_key) {
          // Special handling for page_content metadata updates
          const { data: existing } = await supabase
            .from('page_content')
            .select('*')
            .eq('page_key', condition.page_key)
            .single();

          if (existing) {
            const updatedMetadata = {
              ...(existing.metadata || {}),
              ...(data.metadata || {})
            };
            
            const updateData: any = { ...data };
            if (data.metadata) {
              updateData.metadata = updatedMetadata;
            }
            
            result = await supabase
              .from(table)
              .update(updateData)
              .eq('page_key', condition.page_key);
          } else {
            result = await supabase
              .from(table)
              .insert({ page_key: condition.page_key, ...data });
          }
        } else {
          let query = supabase.from(table).update(data);
          if (condition?.id) query = query.eq('id', condition.id);
          if (condition?.setting_key) query = query.eq('setting_key', condition.setting_key);
          result = await query;
        }
      } else if (action === 'insert') {
        result = await supabase.from(table).insert(data);
      } else if (action === 'delete') {
        let query = supabase.from(table).delete();
        if (condition?.id) query = query.eq('id', condition.id);
        result = await query;
      }

      if (result?.error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: result.error.message 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'تم تنفيذ الإجراء بنجاح'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Chat with AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'يرجى إضافة رصيد للمتابعة.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'خطأ في الاتصال بالذكاء الاصطناعي' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Admin AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
