// app/api/signup/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { error } = await supabase.from('users').insert([
      {
        name,
        email,
        password: hashedPassword,
        role: 'user',
      },
    ])

    if (error) {
      console.error('Erreur insertion Supabase:', error)
      return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Compte créé avec succès' }, { status: 200 })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
