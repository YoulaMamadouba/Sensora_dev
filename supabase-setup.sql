-- Script de configuration Supabase pour Sensora
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 0. Ajouter la colonne user_role à la table users (si elle n'existe pas déjà)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_role text CHECK (user_role IN ('entendant', 'sourd')) DEFAULT 'entendant';

-- 1. Créer le bucket de stockage pour les fichiers audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true);

-- 2. Politique de sécurité pour permettre aux utilisateurs authentifiés d'uploader leurs propres fichiers
CREATE POLICY "Users can upload their own audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view their own audio files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Activer RLS (Row Level Security) sur les tables si ce n'est pas déjà fait
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;

-- 6. Politique pour la table users (les utilisateurs ne peuvent voir que leur propre profil)
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- 7. Politique pour la table audio_files (les utilisateurs ne peuvent voir que leurs propres fichiers)
CREATE POLICY "Users can view own audio files" ON public.audio_files
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio files" ON public.audio_files
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audio files" ON public.audio_files
FOR DELETE USING (auth.uid() = user_id);

-- 8. Fonction pour mettre à jour automatiquement le timestamp updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger pour mettre à jour automatiquement updated_at sur la table users
-- (Si le trigger n'existe pas déjà)
DROP TRIGGER IF EXISTS update_users_timestamp ON public.users;
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
