'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Reservation = {
  id: number
  date: string
  start_time: string
  end_time: string
  status: string
}

export default function ChaletReservationPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reglement: false,
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateHeures = () => {
    const [startHour, startMin] = form.start_time.split(':').map(Number)
    const [endHour, endMin] = form.end_time.split(':').map(Number)
    const start = new Date(0, 0, 0, startHour, startMin)
    const end = new Date(0, 0, 0, endHour, endMin)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return diff > 0 && diff <= 4
  }

  const formatLocalDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const tzOffset = date.getTimezoneOffset() * 60000
    const localDate = new Date(date.getTime() - tzOffset)
    return localDate.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!session?.user?.id) {
      setError('Vous devez être connecté pour réserver.')
      return
    }

    if (!form.date || !form.start_time || !form.end_time || !form.reglement) {
      setError('Veuillez remplir tous les champs et accepter les règlements.')
      return
    }

    if (!validateHeures()) {
      setError('La réservation doit durer entre 1 et 4 heures.')
      return
    }

    try {
      const res = await fetch('/api/chalet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: formatLocalDate(form.date),
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur')
      setSuccess(true)
      setForm({ date: '', start_time: '', end_time: '', reglement: false })
      fetchUserReservations()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur serveur inconnue')
      }
    }
  }

  const fetchUserReservations = async () => {
    if (!session?.user?.id) return
    const res = await fetch(`/api/reservation?user_id=${session.user.id}`)
    const data = await res.json()
    setReservations(data)
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserReservations()
    }
  }, [session?.user?.id])

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="text-right mb-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Retour au tableau de bord
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        Réservation du chalet urbain
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Heure de début</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Heure de fin</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="reglement"
            id="reglement"
            checked={form.reglement}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="reglement" className="text-sm">
            J’accepte les règlements et conditions d’utilisation du chalet urbain
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Réservation envoyée avec succès!</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Réserver
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Mes réservations</h2>
        {reservations.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune réservation pour le moment.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {reservations.map((r) => {
              const statusLabel = r.status.toLowerCase()
              const statusColor =
                statusLabel === 'approuvé'
                  ? 'bg-green-100 text-green-800'
                  : statusLabel === 'refusé'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'

              const statusIcon =
                statusLabel === 'approuvé'
                  ? '✅'
                  : statusLabel === 'refusé'
                  ? '❌'
                  : '⏳'

              return (
                <li key={r.id} className="border p-2 rounded flex justify-between items-center">
                  <span>
                    📅 {new Date(r.date).toLocaleDateString()} — {r.start_time} à {r.end_time}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}
                  >
                    {statusIcon} {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
