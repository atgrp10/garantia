import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('chalet_reservation')
    .select('id, date, start_time, end_time, status, user:user_id(name, unite)')
    .order('date', { ascending: true })

  if (error) {
    console.error('Erreur Supabase:', error)
    return NextResponse.json({ error: 'Erreur chargement des réservations' }, { status: 500 })
  }

  const formatted = data.map((r: any) => ({
    id: r.id,
    date: r.date,
    start_time: r.start_time,
    end_time: r.end_time,
    status: r.status,
    user_name: r.user?.name || 'Inconnu',
    unite: r.user?.unite || '—',
  }))

  return NextResponse.json(formatted)
}

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
      .from('chalet_reservation') // ✅ bien aligné avec ton schema
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
