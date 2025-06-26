'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function TicketPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [form, setForm] = useState({
    problem: '',
    type: '',
    priorité: '',
    date_incident: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!session?.user?.id) {
      setError('Utilisateur non connecté.')
      return
    }

    const res = await fetch('/api/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        user_id: session.user.id,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur inconnue')
    } else {
      setSuccess(true)
      setForm({
        problem: '',
        type: '',
        priorité: '',
        date_incident: '',
      })
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Créer un ticket</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Retour
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">Ticket créé avec succès !</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="problem"
          placeholder="Décrivez le problème"
          className="w-full border p-2 rounded"
          value={form.problem}
          onChange={handleChange}
          required
        />
        <select
          name="type"
          className="w-full border p-2 rounded"
          value={form.type}
          onChange={handleChange}
          required
        >
          <option value="">Type de problème</option>
          <option value="Plomberie">Plomberie</option>
          <option value="Électricité">Électricité</option>
          <option value="Ventilation">Ventilation</option>
          <option value="Finition">Finition</option>
        </select>
        <select
          name="priorité"
          className="w-full border p-2 rounded"
          value={form.priorité}
          onChange={handleChange}
          required
        >
          <option value="">Priorité</option>
          <option value="Urgent">Urgent</option>
          <option value="Moyen">Moyen</option>
          <option value="Faible">Faible</option>
        </select>
        <input
          type="date"
          name="date_incident"
          className="w-full border p-2 rounded"
          value={form.date_incident}
          onChange={handleChange}
          required
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">
          Soumettre le ticket
        </button>
      </form>
    </div>
  )
}
