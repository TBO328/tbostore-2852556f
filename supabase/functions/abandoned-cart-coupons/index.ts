import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TBO';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find all users with carts abandoned for 24+ hours that haven't received a coupon yet
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get distinct user_ids with abandoned carts
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('user_carts')
      .select('user_id, updated_at, abandoned_coupon_sent_at')
      .lt('updated_at', cutoff24h)
      .is('abandoned_coupon_sent_at', null);

    if (cartsError) {
      console.error('Error fetching abandoned carts:', cartsError);
      throw cartsError;
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      console.log('No abandoned carts found');
      return new Response(JSON.stringify({ message: 'No abandoned carts found', processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get unique user_ids with their oldest cart update time
    const userCartMap = new Map<string, string>();
    for (const cart of abandonedCarts) {
      const existing = userCartMap.get(cart.user_id);
      if (!existing || cart.updated_at < existing) {
        userCartMap.set(cart.user_id, cart.updated_at);
      }
    }
    console.log(`Found ${userCartMap.size} users with abandoned carts`);

    let processedCount = 0;

    for (const [userId, oldestUpdatedAt] of userCartMap.entries()) {
      try {
        // Get user email from auth
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !userData?.user?.email) {
          console.error(`Could not get email for user ${userId}:`, userError);
          continue;
        }

        const userEmail = userData.user.email;
        const userName = userData.user.user_metadata?.full_name || userEmail.split('@')[0];

        // Generate unique coupon code
        let couponCode = generateCouponCode();
        
        // Make sure coupon code is unique
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from('coupons')
            .select('id')
            .eq('code', couponCode)
            .single();
          
          if (!existing) break;
          couponCode = generateCouponCode();
          attempts++;
        }

        // Calculate how long the cart has been abandoned
        const abandonedHours = (Date.now() - new Date(oldestUpdatedAt).getTime()) / (1000 * 60 * 60);

        // Tiered discount: 48h+ → 5%, 24-48h → 3%
        const discountPercent = abandonedHours >= 48 ? 5 : 3;

        // Set expiry to 48 hours from now
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        // Create personal coupon with tiered discount
        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .insert({
            code: couponCode,
            discount_percent: discountPercent,
            user_id: userId,
            is_personal: true,
            is_active: true,
            expires_at: expiresAt,
          })
          .select()
          .single();

        if (couponError) {
          console.error(`Error creating coupon for user ${userId}:`, couponError);
          continue;
        }

        // Record in abandoned_cart_coupons table
        await supabase.from('abandoned_cart_coupons').insert({
          user_id: userId,
          coupon_id: coupon.id,
          coupon_code: couponCode,
        });

        // Mark all cart items for this user as notified
        await supabase
          .from('user_carts')
          .update({ abandoned_coupon_sent_at: new Date().toISOString() })
          .eq('user_id', userId);

        // Send email via Resend
        const emailHtml = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #d4af37, #f5e085); padding: 40px; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 28px;">TBO Store 🛍️</h1>
              <p style="color: #333; margin: 8px 0 0;">نسينا شيء مهم؟</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #d4af37; margin: 0 0 16px;">مرحباً ${userName}! 👋</h2>
              <p style="color: #ccc; line-height: 1.8; margin-bottom: 24px;">
                لاحظنا إنك تركت سلة التسوق محملة بمنتجات رائعة... 
                لا تفوت الفرصة! هدية منا لك كوبون خصم خاص لإتمام طلبك الآن.
              </p>
              
              <div style="background: #1a1a1a; border: 2px dashed #d4af37; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="color: #888; margin: 0 0 8px; font-size: 14px;">كود الخصم الخاص بك</p>
                <div style="background: #d4af37; color: #000; font-size: 28px; font-weight: bold; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px; display: inline-block;">
                  ${couponCode}
                </div>
                <p style="color: #d4af37; margin: 12px 0 0; font-size: 20px; font-weight: bold;">خصم ${discountPercent}% على طلبك! 🎉</p>
                <p style="color: #666; margin: 8px 0 0; font-size: 13px;">⏰ الكود صالح لـ 48 ساعة فقط</p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://tbostore.lovable.app/cart" 
                   style="background: linear-gradient(135deg, #d4af37, #f5e085); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
                  أكمل طلبك الآن →
                </a>
              </div>

              <p style="color: #555; font-size: 12px; text-align: center; margin-top: 32px;">
                هذا الكود شخصي لك ولا يمكن مشاركته.<br>
                TBO Store - نحن هنا لخدمتك 💫
              </p>
            </div>
          </div>
        `;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TBO Store <onboarding@resend.dev>',
            to: [userEmail],
            subject: `🛒 نسيت سلتك! هدية خصم ${discountPercent}% تنتظرك - TBO Store`,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const emailError = await emailResponse.text();
          console.error(`Failed to send email to ${userEmail}:`, emailError);
        } else {
          console.log(`Successfully sent abandoned cart coupon ${couponCode} to ${userEmail}`);
          processedCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Abandoned cart coupons processed', 
        processed: processedCount,
        total: uniqueUserIds.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in abandoned-cart-coupons function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
