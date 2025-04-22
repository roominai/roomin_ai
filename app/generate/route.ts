import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

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

  const { imageUrl, theme, room } = await request.json();

  // Usando a API Replicate para processamento de imagem
  try {
    // Verificar se a chave da API Replicate está configurada
    if (!process.env.REPLICATE_API_KEY) {
      return NextResponse.json(
        { error: "Chave da API Replicate não configurada" },
        { status: 500 }
      );
    }

    // Preparar o prompt baseado no tipo de quarto e tema
    const prompt = room === "Gaming Room"
      ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
      : `a ${theme.toLowerCase()} ${room.toLowerCase()}`;

    // Parâmetros para o modelo ControlNet
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
        input: {
          image: imageUrl,
          prompt: `${prompt}, best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning`,
          a_prompt: "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
          n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
        },
      }),
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      return NextResponse.json(
        { error: prediction.detail },
        { status: 500 }
      );
    }

    // Aguardar a conclusão do processamento
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await fetch(
        "https://api.replicate.com/v1/predictions/" + prediction.id,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      prediction = await response.json();
      if (response.status !== 200) {
        return NextResponse.json(
          { error: prediction.detail },
          { status: 500 }
        );
      }
    }

    // Retornar a URL da imagem processada
    return NextResponse.json(["success", prediction.output[0]]);
    
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    return NextResponse.json({ error: "Falha ao processar a imagem" }, { status: 500 });
  }
}
