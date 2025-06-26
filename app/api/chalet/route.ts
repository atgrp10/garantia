import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { date, start_time, end_time, reglement } = await req.json()

    if (!date || !start_time || !end_time || !reglement) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Requête manuelle avec filtre complexe via RPC ou SQL
    const { data: existing, error } = await supabase
      .from('chalet')
      .select('*')
      .eq('date', date)
    
    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur de vérification de disponibilité' }, { status: 500 })
    }

    const overlap = existing.some((r) => {
      return (
        r.start_time < end_time &&
        r.end_time > start_time &&
        r.status !== 'refusée'
      )
    })

    if (overlap) {
      return NextResponse.json({ error: 'Le créneau horaire est déjà réservé' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('chalet').insert([{
      user_id: session.user.id,
      date,
      start_time,
      end_time,
      status: 'en attente',
      reglement: true,
    }])

    if (insertError) {
      console.error('Erreur insertion:', insertError)
      return NextResponse.json({ error: 'Erreur lors de l’enregistrement' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Réservation enregistrée avec succès' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
