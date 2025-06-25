// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
