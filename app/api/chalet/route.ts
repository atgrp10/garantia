import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { date, start_time, end_time, reglement } = await req.json()

    if (!date || !start_time || !end_time || !reglement) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Vérifie s'il y a un conflit avec une réservation existante (même date, chevauchement des heures)
    const { data: existing, error: conflictError } = await supabase
      .from('reservation')
      .select('*')
      .eq('date', date)
      .lt('start_time', end_time)
      .gt('end_time', start_time)

    if (conflictError) {
      console.error('Erreur de vérification:', conflictError)
      return NextResponse.json({ error: 'Erreur de vérification de disponibilité' }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Le créneau horaire est déjà réservé' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('reservation').insert([
      {
        user_id: session.user.id,
        date,
        start_time,
        end_time,
        status: 'en attente',
        règlement_accepté: true,
      },
    ])

    if (insertError) {
      console.error('Erreur insertion Supabase:', insertError)
      return NextResponse.json({ error: 'Erreur lors de la réservation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Réservation soumise avec succès' }, { status: 200 })
  } catch (err: any) {
    console.error('Erreur serveur:', JSON.stringify(err, null, 2))
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
