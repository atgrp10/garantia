'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

type Reservation = {
  id: number
  date: string
  start_time: string
  end_time: string
  status: string
  user?: {
    name: string
    unite: string
  }
}

export default function AdminChaletPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    setLoading(true)
    const res = await fetch('/api/chalet')
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur de chargement')
    } else {
      setReservations(data)
    }
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch('/api/admin/chalet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (res.ok) {
      fetchReservations()
    } else {
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const filteredReservations = reservations.filter(res =>
    filterStatus ? res.status === filterStatus : true
  )

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Réservations du chalet urbain</h1>
        <button
          onClick={async () => {
            await signOut({ redirect: false })
            router.push('/login')
          }}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Se déconnecter
        </button>
      </div>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="mb-4 border px-3 py-2 rounded"
      >
        <option value="">-- Filtrer par statut --</option>
        <option value="en_attente">En attente</option>
        <option value="accepté">Accepté</option>
        <option value="refusé">Refusé</option>
      </select>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Heure</th>
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Unité</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => (
              <tr key={res.id}>
                <td className="p-2 border">{res.date}</td>
                <td className="p-2 border">{res.start_time} - {res.end_time}</td>
                <td className="p-2 border">{res.user?.name || 'Inconnu'}</td>
                <td className="p-2 border">{res.user?.unite || 'N/A'}</td>
                <td className="p-2 border">{res.status}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => updateStatus(res.id, 'accepté')}
                    className="text-green-600 underline"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => updateStatus(res.id, 'refusé')}
                    className="text-red-600 underline"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => updateStatus(res.id, 'en_attente')}
                    className="text-gray-600 underline"
                  >
                    Réinitialiser
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
