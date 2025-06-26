'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ChaletPage() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!form.reglement) {
      setError("Vous devez accepter les règlements pour réserver.")
      return
    }

    // Vérification de la durée maximale (4h)
    const start = new Date(`1970-01-01T${form.start_time}:00`)
    const end = new Date(`1970-01-01T${form.end_time}:00`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    if (diff <= 0) {
      setError("L'heure de fin doit être après l'heure de début.")
      return
    }

    if (diff > 4) {
      setError("La réservation ne peut pas dépasser 4 heures.")
      return
    }

    const res = await fetch('/api/chalet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session?.user?.id,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        reglement: true,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Erreur lors de la réservation.')
    } else {
      setSuccess(true)
      setForm({ date: '', start_time: '', end_time: '', reglement: false })
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Réserver le chalet urbain</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">Réservation envoyée avec succès !</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">Heure de début (7h00 à 22h00)</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              min="07:00"
              max="22:00"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Heure de fin</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              min="07:00"
              max="22:00"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="reglement"
            checked={form.reglement}
            onChange={handleChange}
            className="h-4 w-4"
            required
          />
          <label htmlFor="reglement" className="text-sm">
            J’ai lu et j’accepte les règlements du chalet urbain.
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Soumettre la réservation
        </button>
      </form>
    </div>
  )
}
