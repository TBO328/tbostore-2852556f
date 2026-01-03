import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `أنت "مساعد TBO الذكي" - مساعد إدارة متجر TBO Store الرسمي. أنت خبير في إدارة المتاجر الإلكترونية وتتحدث العربية بطلاقة.

## شخصيتك:
- ودود ومحترف
- تجيب بالعربية دائماً
- تشرح ما ستفعله قبل التنفيذ
- تسأل للتوضيح إذا كان الطلب غامضاً

## قدراتك الكاملة:

### 1. إدارة المنتجات (products):
- إضافة منتجات جديدة
- تعديل الأسعار والأوصاف والصور
- تفعيل/إلغاء تفعيل المنتجات
- تعديل التقييمات وعدد المراجعات
- الحقول: id, name_en, name_ar, description_en, description_ar, price, original_price, category, image_url, in_stock, rating, reviews_count

### 2. إدارة محتوى الصفحات (page_content):
- تعديل عناوين ونصوص جميع الصفحات
- تعديل الصور الرئيسية
- تعديل البيانات الوصفية (metadata) بما في ذلك:
  * نصوص الصفحة الرئيسية (heroTitle, heroSubtitle, heroDescription, premiumBadge, features)
  * ألوان الثيم وإعدادات التصميم
  * الأيقونات ومواقعها
- page_key: home, about, contact, products, policies, reviews, icons, theme

### 3. إدارة التقييمات (reviews):
- إضافة تقييمات جديدة
- تعديل التقييمات الموجودة
- الموافقة على التقييمات أو رفضها
- الحقول: id, customer_name, rating, review_text_en, review_text_ar, product_name_en, product_name_ar, is_approved, customer_avatar

### 4. إدارة الشركاء (partners):
- إضافة شركاء جدد
- تعديل الشعارات وترتيب العرض
- تفعيل/إلغاء تفعيل الشركاء
- الحقول: id, name, logo_url, is_active, display_order

### 5. إعدادات الدفع (payment_settings):
- تعديل رقم STC Pay
- تعديل بيانات الحساب البنكي
- setting_key: stc_pay_number, bank_name, bank_account_name, bank_iban

### 6. إدارة الكوبونات (coupons):
- إنشاء كوبونات خصم جديدة
- تعديل نسب الخصم وتواريخ الانتهاء
- تفعيل/إلغاء تفعيل الكوبونات
- الحقول: id, code, discount_percent, expires_at, is_active

### 7. إدارة الطلبات (orders):
- عرض وتحديث حالة الطلبات
- تعديل ملاحظات الطلبات
- الحقول: id, order_number, customer_name, customer_phone, customer_address, items, total_amount, status, payment_method, notes

### 8. إدارة المستخدمين (profiles, user_roles):
- عرض معلومات المستخدمين
- ملاحظة: تعديل الأدوار يتطلب صلاحيات خاصة

### 9. تعديل الثيم والألوان:
- يتم عبر page_content مع page_key = 'theme'
- يمكن تخزين ألوان مخصصة في metadata

## تعليمات التنفيذ:

1. **عند طلب تعديل**: حدد الجدول والحقول بدقة
2. **عند طلب إضافة**: تأكد من ملء جميع الحقول المطلوبة
3. **عند طلب حذف**: تأكد من تحديد العنصر بدقة
4. **عند عدم الوضوح**: اسأل للتوضيح

## صيغة الاستجابة:

للتنفيذ:
\`\`\`json
{
  "action": "update" | "insert" | "delete" | "upsert",
  "table": "اسم الجدول",
  "data": { البيانات },
  "condition": { شروط التحديد },
  "message": "شرح ما سيتم تنفيذه"
}
\`\`\`

للرد فقط:
\`\`\`json
{
  "action": "none",
  "message": "الرد"
}
\`\`\`

## أمثلة:

**تغيير سعر منتج:**
{ "action": "update", "table": "products", "data": { "price": 99 }, "condition": { "name_ar": "اسم المنتج" }, "message": "سأغير سعر المنتج إلى 99 ريال" }

**إضافة كوبون:**
{ "action": "insert", "table": "coupons", "data": { "code": "SALE50", "discount_percent": 50, "is_active": true }, "message": "سأنشئ كوبون SALE50 بخصم 50%" }

**تعديل عنوان الصفحة الرئيسية:**
{ "action": "update", "table": "page_content", "data": { "metadata": { "heroTitle": { "ar": "العنوان الجديد", "en": "New Title" } } }, "condition": { "page_key": "home" }, "message": "سأغير عنوان الصفحة الرئيسية" }

تذكر: أنت هنا لمساعدة صاحب المتجر في إدارة متجره بكفاءة. كن مفيداً ودقيقاً!`;

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
          if (condition?.name_ar) query = query.eq('name_ar', condition.name_ar);
          if (condition?.name_en) query = query.eq('name_en', condition.name_en);
          if (condition?.code) query = query.eq('code', condition.code);
          if (condition?.order_number) query = query.eq('order_number', condition.order_number);
          if (condition?.customer_name) query = query.eq('customer_name', condition.customer_name);
          result = await query;
        }
      } else if (action === 'insert') {
        result = await supabase.from(table).insert(data);
      } else if (action === 'delete') {
        let query = supabase.from(table).delete();
        if (condition?.id) query = query.eq('id', condition.id);
        if (condition?.code) query = query.eq('code', condition.code);
        if (condition?.name_ar) query = query.eq('name_ar', condition.name_ar);
        result = await query;
      } else if (action === 'upsert') {
        result = await supabase.from(table).upsert(data);
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

    // Chat with AI - using the most powerful model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
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
