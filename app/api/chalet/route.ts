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

    if (!date || !start_time || !end_time || reglement !== true) {
      return NextResponse.json({ error: 'Tous les champs sont requis et le règlement doit être accepté.' }, { status: 400 })
    }

    // Vérifier les conflits (start_time < fin existante && end_time > début existant)
    const { data: conflits, error: conflitError } = await supabase
      .from('chalet')
      .select('*')
      .eq('date', date)
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`)

    if (conflitError) {
      console.error('Erreur lors de la vérification de conflit:', conflitError)
      return NextResponse.json({ error: 'Erreur de vérification de disponibilité' }, { status: 500 })
    }

    if (conflits && conflits.length > 0) {
      return NextResponse.json({ error: 'Ce créneau horaire est déjà réservé' }, { status: 409 })
    }

    const { error: insertError } = await supabase.from('chalet').insert([
      {
        user_id: session.user.id,
        date,
        start_time,
        end_time,
        status: 'en attente',
        reglement: true,
      },
    ])

    if (insertError) {
      console.error('Erreur lors de l’insertion:', insertError)
      return NextResponse.json({ error: 'Erreur lors de la création de la réservation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Réservation soumise avec succès' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
