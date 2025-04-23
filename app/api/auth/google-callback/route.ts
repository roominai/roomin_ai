import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "Código de autorização não fornecido" },
        { status: 400 }
      );
    }

    // Configurações do OAuth
    const clientId = "406745229864-83461986tukmlnis28bl9j6fh5irjp6n.apps.googleusercontent.com";
    const clientSecret = "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";
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://roominai.vercel.app"}/auth/callback`;

    // Trocar o código por tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Erro na resposta do token:", errorData);
      return NextResponse.json(
        { message: "Falha ao obter token de acesso" },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token } = tokenData;

    // Obter informações do usuário
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { message: "Falha ao obter informações do usuário" },
        { status: 400 }
      );
    }

    const userData = await userInfoResponse.json();

    // Verificar se o usuário já existe no Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", userData.email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Erro ao verificar usuário existente:", fetchError);
    }

    // Se o usuário não existir, criar um novo usuário no Supabase
    if (!existingUser) {
      // Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.sub, // Usando o ID único do Google como senha
        options: {
          data: {
            name: userData.name,
            avatar_url: userData.picture,
          },
        },
      });

      if (authError) {
        console.error("Erro ao criar usuário no Supabase Auth:", authError);
        return NextResponse.json(
          { message: "Falha ao criar usuário" },
          { status: 500 }
        );
      }

      // Criar perfil na tabela profiles
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user?.id,
          email: userData.email,
          avatar_url: userData.picture,
          updated_at: new Date().toISOString(),
          credits: 1, // Créditos iniciais
        },
      ]);

      if (profileError) {
        console.error("Erro ao criar perfil do usuário:", profileError);
      }
    }

    // Fazer login com o usuário no Supabase
    const { data: signInData, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_token,
          id_token,
        },
      },
    });

    if (signInError) {
      console.error("Erro ao fazer login no Supabase:", signInError);
      return NextResponse.json(
        { message: "Falha ao autenticar usuário" },
        { status: 500 }
      );
    }

    // Retornar dados do usuário
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Erro no processamento do callback:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
