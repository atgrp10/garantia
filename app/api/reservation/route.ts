import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) {
    return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('reservation')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Erreur de lecture' }, { status: 500 })
  }

  return NextResponse.json(data)
}
