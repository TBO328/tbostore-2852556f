import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, fullName } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('otp_code', otp)
      .eq('used', false)
      .single();

    if (otpError || !otpData) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP is expired
    if (new Date(otpData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'OTP has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as used
    await supabase
      .from('phone_otps')
      .update({ used: true })
      .eq('id', otpData.id);

    // Check if user exists with this phone
    const phoneEmail = `${cleanPhone.replace('+', '')}@phone.tbostore.local`;
    
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userWithPhone = existingUser?.users?.find(
      (u) => u.email === phoneEmail || u.phone === cleanPhone
    );

    if (userWithPhone) {
      // User exists, sign them in
      // Generate a custom token or use signInWithPassword
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: phoneEmail,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error('Failed to sign in');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isNewUser: false,
          magicLink: signInData?.properties?.action_link,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // New user, create account
      const tempPassword = crypto.randomUUID();
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: phoneEmail,
        password: tempPassword,
        phone: cleanPhone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: fullName || '',
          phone: cleanPhone,
        },
      });

      if (createError) {
        console.error('Create user error:', createError);
        throw new Error('Failed to create user');
      }

      // Create profile
      if (newUser?.user) {
        await supabase.from('profiles').insert({
          user_id: newUser.user.id,
          full_name: fullName || '',
        });

        // Initialize loyalty points
        await supabase.from('loyalty_points').insert({
          user_id: newUser.user.id,
          points: 0,
          total_earned: 0,
          total_redeemed: 0,
        });
      }

      // Generate magic link for the new user
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: phoneEmail,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error('Failed to sign in');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isNewUser: true,
          magicLink: signInData?.properties?.action_link,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in verify-sms-otp:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
