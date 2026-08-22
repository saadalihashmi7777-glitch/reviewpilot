import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { review, tone, customerName, rating } =
      await request.json();

    if (!review?.trim()) {
      return NextResponse.json(
        { error: "Customer review is required." },
        { status: 400 }
      );
    }

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

    // Get user's current plan
    const { data: planData, error: planError } =
      await supabase
        .from("user_plans")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

    if (planError) {
      console.error("Plan lookup error:", planError);

      return NextResponse.json(
        {
          error:
            "Could not check your plan. Please try again.",
        },
        { status: 500 }
      );
    }

    const currentPlan = planData?.plan || "free";

    // Check current usage
    const { count, error: countError } =
      await supabase
        .from("review_replies")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

    if (countError) {
      console.error("Usage check error:", countError);

      return NextResponse.json(
        {
          error:
            "Could not check your usage. Please try again.",
        },
        { status: 500 }
      );
    }

    const repliesGenerated = count ?? 0;

    // Free plan has 10 replies.
    // Pro and Business are unlimited.
    if (
      currentPlan === "free" &&
      repliesGenerated >= 10
    ) {
      return NextResponse.json(
        {
          error:
            "You've used all 10 free replies. Upgrade your plan to generate more.",
        },
        { status: 403 }
      );
    }

    // Get the user's business profile so the reply sounds like
    // it was written by their specific business.
    // A missing profile is NOT an error: generation still works,
    // it just falls back to a generic reply.
    const { data: profile, error: profileError } =
      await supabase
        .from("business_profiles")
        .select(
          "business_name, business_type, location, brand_voice, special_instructions, website"
        )
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Business profile lookup error:",
        profileError
      );
    }

    const businessContext = profile
      ? `You are the owner of the business described below. Write in that business's voice.

Business name: ${profile.business_name}
Business type: ${profile.business_type}
Location: ${profile.location}
Brand voice: ${profile.brand_voice}${
          profile.website
            ? `\nWebsite: ${profile.website}`
            : ""
        }${
          profile.special_instructions
            ? `\n\nSpecial instructions from the business owner. These override every other style rule below:\n${profile.special_instructions}`
            : ""
        }

The reply must read as if this specific business wrote it, not as generic
customer service text. Refer to the business naturally where it fits.`
      : `You are writing on behalf of a local business. No business details
were provided, so keep the reply generic and do not invent a business
name, location, or any specific detail about the business.`;

    // Generate AI reply
    const response =
      await openai.responses.create({
        model: "gpt-5-mini",
        input: `${businessContext}

Write a response to this customer review.

Customer name: ${customerName || "Customer"}
Rating: ${rating || "5"} stars
Tone for this specific reply: ${tone || "Professional"}

Customer review:
${review}

Write only the response.
Do not add quotation marks.
Do not invent facts, offers, or details that were not provided.
Keep it natural, polite, and concise.`,
      });

    const reply =
      response.output_text?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          error:
            "OpenAI returned an empty response.",
        },
        { status: 500 }
      );
    }

    // Save reply
    const { error: saveError } =
      await supabase
        .from("review_replies")
        .insert({
          user_id: user.id,
          customer_name:
            customerName || null,
          rating: Number(rating) || 5,
          tone: tone || "Professional",
          review,
          reply,
        });

    if (saveError) {
      console.error(
        "Supabase save error:",
        saveError
      );

      return NextResponse.json(
        {
          error: `Reply generated, but could not be saved: ${saveError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply,
      repliesGenerated:
        repliesGenerated + 1,
      repliesRemaining:
        currentPlan === "free"
          ? Math.max(
              10 - (repliesGenerated + 1),
              0
            )
          : null,
      plan: currentPlan,
      hasBusinessProfile: Boolean(profile),
    });
  } catch (error: any) {
    console.error(
      "GENERATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong while generating the reply.",
      },
      { status: 500 }
    );
  }
}