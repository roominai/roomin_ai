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
    // Não debitamos o crédito aqui - apenas verificamos se o usuário tem crédito suficiente
    // O débito será feito apenas após a geração bem-sucedida da imagem
    
    console.log(`Usuário ${userId} tem ${userCredits} créditos disponíveis. Iniciando geração de imagem...`);
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
            : theme === "Modern"
              ? `a modern style ${room.toLowerCase()} with contemporary furniture and clean lines`
              : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
        a_prompt:
          "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
        n_prompt:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();

  // Verificar se a resposta do Replicate contém os dados esperados
  if (!jsonStartResponse || !jsonStartResponse.urls || !jsonStartResponse.urls.get) {
    console.error("Erro na resposta da API Replicate:", jsonStartResponse);
    
    // Se houve erro na chamada da API, devolver os créditos ao usuário
    if (userId) {
      try {
        // Usar a função do creditSystem para adicionar o crédito de volta
        const { data, error } = await supabase
          .from('profiles')
          .update({ credits: userCredits })
          .eq('id', userId);
          
        if (error) {
          console.error("Erro ao devolver crédito:", error);
        } else {
          console.log(`Crédito devolvido para o usuário ${userId} devido a falha na API.`);
        }
      } catch (error) {
        console.error("Erro ao devolver crédito:", error);
      }
    }
    
    return NextResponse.json({ error: "Erro ao processar a imagem. Por favor, tente novamente." }, { status: 500 });
  }

  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image restoration process & return the result when it's ready
  let restoredImage: string | null = null;
  let maxRetries = 30; // Limitar o número de tentativas para evitar loops infinitos
  let retryCount = 0;
  
  try {
    while (!restoredImage && retryCount < maxRetries) {
      // Loop in 1s intervals until the alt text is ready
      console.log("polling for result...", retryCount + 1);
      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
      });
      
      if (!finalResponse.ok) {
        throw new Error(`Erro na requisição: ${finalResponse.status}`);
      }
      
      let jsonFinalResponse = await finalResponse.json();

      if (jsonFinalResponse.status === "succeeded") {
        restoredImage = jsonFinalResponse.output;
        
        // Debitar crédito imediatamente após confirmar o sucesso da operação
        if (userId) {
          console.log(`Imagem gerada com sucesso para o usuário ${userId}. Debitando crédito...`);
          
          try {
            // Usar a função importada debitCredits do creditSystem
            const success = await debitCredits(userId, 1);
            
            if (!success) {
              console.error("Falha ao debitar créditos do usuário");
              // Tentar debitar diretamente via supabase como fallback
              try {
                const { data, error } = await supabase
                  .from('profiles')
                  .update({ credits: userCredits - 1 })
                  .eq('id', userId);
                  
                if (error) {
                  // Tentar usar a função RPC como último recurso
                  const { data: rpcData, error: rpcError } = await supabase.rpc('decrement_credits', {
                    user_id: userId,
                    amount: 1
                  });
                  
                  if (rpcError) {
                    console.error("Erro ao debitar crédito via RPC:", rpcError);
                  } else {
                    console.log(`Crédito debitado via RPC para o usuário ${userId}`);
                  }
                } else {
                  console.log(`Crédito debitado via fallback para o usuário ${userId}`);
                }
              } catch (fallbackError) {
                console.error("Erro no método fallback de débito:", fallbackError);
              }
            } else {
              console.log(`Crédito debitado com sucesso para o usuário ${userId}. Créditos restantes: ${userCredits - 1}`);
            }
          } catch (debitError) {
            console.error("Erro ao debitar créditos do usuário:", debitError);
            // Tentar debitar diretamente via supabase como fallback
            try {
              const { data, error } = await supabase
                .from('profiles')
                .update({ credits: userCredits - 1 })
                .eq('id', userId);
                
              if (error) {
                // Tentar usar a função RPC como último recurso
                const { data: rpcData, error: rpcError } = await supabase.rpc('decrement_credits', {
                  user_id: userId,
                  amount: 1
                });
                
                if (rpcError) {
                  console.error("Erro ao debitar crédito via RPC:", rpcError);
                } else {
                  console.log(`Crédito debitado via RPC para o usuário ${userId}`);
                }
              } else {
                console.log(`Crédito debitado via fallback para o usuário ${userId}`);
              }
            } catch (fallbackError) {
              console.error("Erro no método fallback de débito:", fallbackError);
            }
          }
        }
      } else if (jsonFinalResponse.status === "failed") {
        throw new Error("Falha na geração da imagem: " + (jsonFinalResponse.error || "Erro desconhecido"));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retryCount++;
      }
    }
    
    if (!restoredImage) {
      throw new Error("Tempo limite excedido para geração da imagem");
    }

    // Os créditos já foram debitados quando a imagem foi gerada com sucesso

    return NextResponse.json(restoredImage);
    
  } catch (error) {
    console.error("Erro durante a geração da imagem:", error);
    
    // Se houve erro durante o processamento, devolver os créditos ao usuário
    if (userId) {
      try {
        // Restaurar o crédito original
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ credits: userCredits })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Erro ao devolver crédito:", updateError);
          // Tentar novamente com a função RPC do banco de dados
          const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_credits', {
            user_id: userId,
            new_credits: userCredits
          });
          
          if (rpcError) {
            console.error("Erro ao devolver crédito via RPC:", rpcError);
          } else {
            console.log(`Crédito devolvido via RPC para o usuário ${userId} devido a falha na geração.`);
          }
        } else {
          console.log(`Crédito devolvido para o usuário ${userId} devido a falha na geração.`);
        }
      } catch (updateError) {
        console.error("Erro ao devolver crédito:", updateError);
      }
    }
    
    return NextResponse.json(
      { error: "Erro ao gerar a imagem. Por favor, tente novamente." }, 
      { status: 500 }
    );
  }
}
