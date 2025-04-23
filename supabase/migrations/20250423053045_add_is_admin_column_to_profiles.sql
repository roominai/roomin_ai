-- Adicionar coluna is_admin à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Definir o usuário contato.roomin.ai@gmail.com como administrador
UPDATE profiles
SET is_admin = true
WHERE email = 'contato.roomin.ai@gmail.com';

-- Criar índice para melhorar a performance de consultas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Atualizar as políticas de segurança para permitir que apenas administradores possam acessar certas funcionalidades
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  ));
