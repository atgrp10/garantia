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

    // Vérifie conflit avec d'autres réservations
    const { data: existing, error: checkError } = await supabase
      .from('chalet')
      .select('*')
      .eq('date', date)
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`)

    if (checkError) {
      console.error('Erreur vérification:', checkError)
      return NextResponse.json({ error: 'Erreur lors de la vérification de disponibilité' }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Le créneau horaire est déjà réservé' }, { status: 409 })
    }

    const { error } = await supabase.from('chalet').insert([{
      user_id: session.user.id,
      date,
      start_time,
      end_time,
      status: 'en attente',
      reglement: true,
    }])

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur lors de la création de la réservation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Réservation soumise avec succès' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
