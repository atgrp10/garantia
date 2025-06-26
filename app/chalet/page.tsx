'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<any[]>([])

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, router])

  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch('/api/reservation')
      const data = await res.json()
      setReservations(data)
    }
    fetchReservations()
  }, [router])

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/reservation/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin — Réservations</h1>
      <div className="space-y-4">
        {reservations.map((r) => (
          <div key={r.id} className="border p-4 rounded shadow">
            <p className="text-sm">Unité: {r.unite}</p>
            <p className="text-sm">
              📅 {r.date} — {r.start_time} à {r.end_time}
            </p>
            <p className="text-sm">Statut actuel : {r.status}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateStatus(r.id, 'approuvé')}
                className="px-3 py-1 text-white bg-green-600 rounded"
              >
                Approuver
              </button>
              <button
                onClick={() => updateStatus(r.id, 'refusé')}
                className="px-3 py-1 text-white bg-red-600 rounded"
              >
                Refuser
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
