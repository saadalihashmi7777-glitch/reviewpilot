import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Your login session is invalid. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const plan = body.plan;

    let priceId: string | undefined;

    if (plan === "pro") {
      priceId = process.env.STRIPE_PRO_PRICE_ID;
    } else if (plan === "business") {
      priceId = process.env.STRIPE_BUSINESS_PRICE_ID;
    } else {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID is not configured." },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        customer_email:
          user.email || undefined,
metadata: {
  user_id: user.id,
  plan: plan,
},

subscription_data: {
  metadata: {
    user_id: user.id,
    plan: plan,
  },
},
        success_url:
          `${siteUrl}/dashboard?payment=success`,

        cancel_url:
          `${siteUrl}/pricing?payment=cancelled`,
      });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: unknown) {
    console.error(
      "STRIPE CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Stripe checkout session.",
      },
      { status: 500 }
    );
  }
}