import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "../../supabaseClient";
import { debitCredits } from "../../utils/creditSystem";

// Create a new ratelimiter, that allows 5 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(5, "1440 m"),
      analytics: true,
    })
  : undefined;

export async function POST(request: Request) {
  // Rate Limiter Code
  if (ratelimit) {
    const headersList = headers();
    const ipIdentifier = headersList.get("x-real-ip");

    const result = await ratelimit.limit(ipIdentifier ?? "");

    if (!result.success) {
      return new Response(
        "Too many uploads in 1 day. Please try again in a 24 hours.",
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit,
            "X-RateLimit-Remaining": result.remaining,
          } as any,
        }
      );
    }
  }

  const { imageUrl, theme, room, userId } = await request.json();
  
  // Verificar se o usuário tem créditos suficientes
  let userCredits = 0;
  if (userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Erro ao verificar créditos do usuário:", error);
      return new Response("Erro ao verificar créditos do usuário", { status: 500 });
    }
    
    if (!data || data.credits <= 0) {
      return new Response("Você não tem créditos suficientes para gerar uma imagem", { status: 402 });
    }
    
    userCredits = data.credits;
    
    // Debitar crédito antes de iniciar a geração da imagem
    const success = await debitCredits(userId, 1);
    if (!success) {
      console.error("Erro ao debitar créditos do usuário");
      return new Response("Erro ao debitar créditos. Por favor, tente novamente.", { status: 500 });
    }
    
    console.log(`Crédito debitado com sucesso para o usuário ${userId}. Créditos restantes: ${userCredits - 1}`);
  }

  // POST request to Replicate to start the image restoration generation process
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
      input: {
        image: imageUrl,
        prompt:
          room === "Gaming Room"
            ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
            : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
        a_prompt:
          "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
        n_prompt:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();

  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image restoration process & return the result when it's ready
  let restoredImage: string | null = null;
  while (!restoredImage) {
    // Loop in 1s intervals until the alt text is ready
    console.log("polling for result...");
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });
    let jsonFinalResponse = await finalResponse.json();

    if (jsonFinalResponse.status === "succeeded") {
      restoredImage = jsonFinalResponse.output;
      
      // Decrementar créditos do usuário após geração bem-sucedida
      // Não precisamos debitar créditos novamente aqui, pois já foram debitados antes de iniciar a geração
      // Apenas registramos o sucesso da operação
      if (userId) {
        console.log(`Imagem gerada com sucesso para o usuário ${userId}`);
      }
    } else if (jsonFinalResponse.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return NextResponse.json(
    restoredImage ? restoredImage : "Failed to restore image"
  );
}
