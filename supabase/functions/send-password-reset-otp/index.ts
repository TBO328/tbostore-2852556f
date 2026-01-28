import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate branded email HTML
function getEmailHTML(otp: string, language: string = 'ar'): string {
  const isArabic = language === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';
  
  return `
    <!DOCTYPE html>
    <html dir="${direction}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); padding: 40px 20px; text-align: center;">
        <div style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 15px; border: 1px solid rgba(0, 212, 255, 0.3);">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #00d4ff;">
            TBO Store
          </h1>
        </div>
      </div>
      
      <!-- Content -->
      <div style="background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%); padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; text-align: center;">
          <div style="width: 80px; height: 80px; margin: 0 auto 25px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(0, 212, 255, 0.4);">
            <span style="font-size: 40px;">🔐</span>
          </div>
          
          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 15px 0; font-weight: 700;">
            ${isArabic ? 'إعادة تعيين كلمة المرور' : 'Password Reset'}
          </h2>
          
          <p style="color: #aaa; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
            ${isArabic ? 'استخدم الكود التالي لإعادة تعيين كلمة المرور الخاصة بك:' : 'Use the following code to reset your password:'}
          </p>
          
          <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 92, 246, 0.1)); padding: 25px; border-radius: 15px; border: 2px solid rgba(0, 212, 255, 0.3); margin-bottom: 30px;">
            <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #00d4ff;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #f87171; font-size: 14px; margin: 0; padding: 15px; background: rgba(248, 113, 113, 0.1); border-radius: 10px; border: 1px solid rgba(248, 113, 113, 0.3);">
            ⏰ ${isArabic ? 'هذا الكود صالح لمدة 10 دقائق فقط' : 'This code is valid for 10 minutes only'}
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #0f0f23; padding: 30px 20px; text-align: center; border-top: 1px solid rgba(0, 212, 255, 0.2);">
        <p style="color: #888; font-size: 14px; margin: 0 0 10px 0;">
          ${isArabic ? '© 2024 TBO Store. جميع الحقوق محفوظة' : '© 2024 TBO Store. All rights reserved'}
        </p>
        <p style="color: #666; font-size: 12px; margin: 0;">
          ${isArabic ? 'هذا البريد الإلكتروني تم إرساله تلقائياً' : 'This email was sent automatically'}
        </p>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, language = 'ar' } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error checking user:', userError);
      throw new Error('Failed to verify email');
    }

    const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'If this email exists, a code will be sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email
    await supabase
      .from('password_reset_otps')
      .delete()
      .eq('user_email', email.toLowerCase());

    // Insert new OTP
    const { error: insertError } = await supabase
      .from('password_reset_otps')
      .insert({
        user_id: user.id,
        user_email: email.toLowerCase(),
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      throw new Error('Failed to generate reset code');
    }

    // Try to send email via Resend if API key is available
    let emailSent = false;
    if (resendApiKey) {
      try {
        const emailHTML = getEmailHTML(otp, language);
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TBO Store <onboarding@resend.dev>',
            to: [email],
            subject: language === 'ar' ? 'إعادة تعيين كلمة المرور - TBO Store' : 'Password Reset - TBO Store',
            html: emailHTML,
          }),
        });
        
        if (emailResponse.ok) {
          emailSent = true;
          console.log(`Password reset email sent to ${email}`);
        } else {
          const errorData = await emailResponse.json();
          console.error('Resend API error:', errorData);
        }
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
      }
    }

    // Log OTP for development/debugging
    console.log(`Password reset OTP for ${email}: ${otp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent ? 'Reset code sent to your email' : 'Reset code generated',
        emailSent,
        // Include OTP in response for development/testing if email wasn't sent
        ...(emailSent ? {} : { dev_otp: otp })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-password-reset-otp:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
