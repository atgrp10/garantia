'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/chalet')
        const data = await res.json()
        const approuved = data.filter((r: Reservation) => r.status === 'acceptée')
        approuved.sort(
          (a: Reservation, b: Reservation) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        setReservations(approuved)
      } catch (err) {
        console.error('Erreur chargement:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Calendrier du chalet urbain</h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : reservations.length === 0 ? (
        <p className="text-center text-gray-500">Aucune réservation approuvée pour l’instant.</p>
      ) : (
        <ul className="space-y-4">
          {reservations.map((res) => (
            <li
              key={res.id}
              className="border rounded-lg p-4 shadow-sm bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center hover:shadow-md transition"
            >
              <div className="flex-1">
                <p className="font-semibold text-lg text-gray-800">{res.date}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded mt-1">
                  {res.start_time} - {res.end_time}
                </span>
              </div>

              <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                <span className="text-sm text-gray-700 font-medium">{res.user_name}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded mt-1">
                  Unité {res.unite}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
