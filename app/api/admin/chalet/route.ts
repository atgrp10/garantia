import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabaseClient'

type ChaletReservation = {
  id: number
  date: string
  start_time: string
  end_time: string
  status: string
  user: {
    name?: string
    unite?: string
  } | null
}

// 🔍 GET: liste des réservations
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('chalet_reservation')
    .select('id, date, start_time, end_time, status, user:user_id(name, unite)')
    .order('date', { ascending: true })

  if (error || !data) {
    console.error('Erreur Supabase:', error)
    return NextResponse.json({ error: 'Erreur chargement des réservations' }, { status: 500 })
  }

  const formatted = data.map((r: any) => {
    const reservation = r as ChaletReservation
    return {
      id: reservation.id,
      date: reservation.date,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      status: reservation.status,
      user_name: reservation.user?.name || 'Inconnu',
      unite: reservation.user?.unite || '—',
    }
  })

  return NextResponse.json(formatted)
}

// 📝 POST: mise à jour du statut
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  try {
    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { error } = await supabase
      .from('chalet_reservation')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Statut mis à jour' }, { status: 200 })
  } catch (err) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
