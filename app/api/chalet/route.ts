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

    // Vérifie les conflits de réservation
    const { data: conflits, error: conflitErreur } = await supabase
      .from('reservation')
      .select('*')
      .eq('date', date)
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`)

    if (conflitErreur) {
      console.error('Erreur de vérification:', conflitErreur)
      return NextResponse.json({ error: 'Erreur de vérification de disponibilité' }, { status: 500 })
    }

    if (conflits && conflits.length > 0) {
      return NextResponse.json({ error: 'Ce créneau est déjà réservé' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('reservation').insert([
      {
        user_id: session.user.id,
        date,
        start_time,
        end_time,
        règlement_accepté: true,
        status: 'en attente',
      },
    ])

    if (insertError) {
      console.error('Erreur insertion:', insertError)
      return NextResponse.json({ error: 'Erreur lors de la création de la réservation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Réservation soumise avec succès' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
