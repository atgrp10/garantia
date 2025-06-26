import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabaseClient'

// GET : accessible à tous pour afficher les réservations dans le calendrier
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reservation')
      .select('id, date, start_time, end_time, status, user_id (unite)')
      .order('date', { ascending: true })

    if (error) {
      console.error('Erreur chargement calendrier:', error)
      return NextResponse.json({ error: 'Erreur chargement calendrier' }, { status: 500 })
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      date: r.date,
      start_time: r.start_time,
      end_time: r.end_time,
      status: r.status,
      unite: r.user_id?.unite || '—',
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error('Erreur serveur calendrier:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST : création de réservation, requiert authentification
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

    // Vérifie les conflits
    const { data: conflits, error: conflitErreur } = await supabase
      .from('reservation')
      .select('*')
      .eq('date', date)
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`)

    if (conflitErreur) {
      console.error('Erreur vérif conflit:', conflitErreur)
      return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
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
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Réservation soumise avec succès' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur POST:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
