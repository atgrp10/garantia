'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

type Reservation = {
  id: number
  user_name: string
  unite: string
  date: string
  start_time: string
  end_time: string
  status: string
}

export default function AdminChaletPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/chalet')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setReservations(data)
      } else {
        console.error('Réponse inattendue:', data)
        setReservations([]) // évite le crash .map
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/chalet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) fetchReservations()
    } catch (err) {
      console.error('Erreur mise à jour:', err)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Réservations du chalet urbain</h1>
        <button
          onClick={async () => {
            await signOut({ redirect: false })
            router.push('/login')
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : reservations.length === 0 ? (
        <p>Aucune réservation trouvée.</p>
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
            {reservations.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">{r.date}</td>
                <td className="p-2 border">
                  {r.start_time} - {r.end_time}
                </td>
                <td className="p-2 border">{r.user_name}</td>
                <td className="p-2 border">{r.unite}</td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => updateStatus(r.id, 'acceptée')}
                    className="text-green-600 underline"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'refusée')}
                    className="text-red-600 underline"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'en attente')}
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
