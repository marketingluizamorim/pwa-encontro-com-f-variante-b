import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID Keys should be set in Supabase Secrets
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_EMAIL = "mailto:suporte@encontrocomfe.com.br";

webpush.setVapidDetails(
    VAPID_EMAIL,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

interface PushNotificationRequest {
    userId: string;
    title: string;
    body: string;
    url?: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { userId, title, body, url } = await req.json() as PushNotificationRequest;

        // 1. Fetch subscriptions for the user
        const { data: subscriptions, error: subError } = await supabaseClient
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId);

        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
            console.log(`No push subscriptions found for user ${userId}`);
            return new Response(JSON.stringify({ success: true, sent: 0 }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Send notifications in parallel
        const payloads = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh,
                },
            };

            const payload = JSON.stringify({ title, body, url: url || "/" });

            try {
                await webpush.sendNotification(pushSubscription, payload);
                return { success: true, endpoint: sub.endpoint };
            } catch (err) {
                console.error(`Error sending push to ${sub.endpoint}:`, err);

                // If 410 (Gone) or 404 (Not Found), the subscription is expired/invalid
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabaseClient
                        .from("push_subscriptions")
                        .delete()
                        .eq("endpoint", sub.endpoint);
                }

                return { success: false, endpoint: sub.endpoint, error: err.message };
            }
        });

        const results = await Promise.all(payloads);
        const sentCount = results.filter(r => r.success).length;

        return new Response(JSON.stringify({ success: true, sent: sentCount }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Function error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
