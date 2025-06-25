// app/api/login/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Vérifier si l'utilisateur existe
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 })
    }

    // Comparer les mots de passe
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    // Succès : tu pourrais aussi créer un JWT ou une session ici
    return NextResponse.json({ message: 'Connexion réussie', user: { id: user.id, name: user.name, role: user.role } })
  } catch (err) {
    console.error('Erreur login :', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
