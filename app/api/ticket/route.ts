// app/api/ticket/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// ✅ GET → utilisé dans /admin pour récupérer la liste des tickets
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ticket')
      .select('*')
      .order('created_at', { ascending: false })

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

// ✅ POST → déjà présent, tu le gardes tel quel
export async function POST(req: Request) {
  try {
    const {
      problem,
      type,
      priorité,
      date_incident,
      user_id,
    } = await req.json()

    if (!user_id || !problem || !type || !priorité || !date_incident) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { error } = await supabase.from('ticket').insert([
      {
        problem,
        type,
        priorité,
        date_incident,
        user_id,
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
