import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabaseClient'

// ✅ GET → utilisé pour /dashboard (user) ou /admin (tous)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    let query = supabase.from('ticket').select('*').order('created_at', { ascending: false })

    // Si user_id est présent dans l’URL, on filtre
    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur lors de la récupération des tickets' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ✅ POST → création d’un ticket avec user_id tiré de la session
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const {
      problem,
      type,
      priorité,
      date_incident,
    } = await req.json()

    if (!problem || !type || !priorité || !date_incident) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { error } = await supabase.from('ticket').insert([
      {
        user_id: session.user.id, // ✅ automatiquement récupéré
        problem,
        type,
        priorité,
        date_incident,
        status: 'ouvert',
      },
    ])

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur lors de la création du ticket' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Ticket créé avec succès' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
