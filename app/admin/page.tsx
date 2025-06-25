'use client'

import { useEffect, useState } from 'react'

type Ticket = {
  id: number
  problem: string
  type: string
  priorité: string
  status: string
  user_id: string
  created_at: string
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    const res = await fetch('/api/ticket')
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erreur de chargement')
    } else {
      setTickets(data)
    }
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch('/api/admin/update-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (res.ok) {
      fetchTickets() // recharge les tickets
    } else {
      const data = await res.json()
      alert(data.error || 'Erreur lors de la mise à jour')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des tickets</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Problème</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Priorité</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="p-2 border">{ticket.id}</td>
                <td className="p-2 border">{ticket.problem}</td>
                <td className="p-2 border">{ticket.type}</td>
                <td className="p-2 border">{ticket.priorité}</td>
                <td className="p-2 border">{ticket.status}</td>
                <td className="p-2 border">{ticket.user_id}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => updateStatus(ticket.id, 'en traitement')}
                    className="text-blue-600 underline"
                  >
                    En traitement
                  </button>
                  <button
                    onClick={() => updateStatus(ticket.id, 'résolu')}
                    className="text-green-600 underline"
                  >
                    Résolu
                  </button>
                  <button
                    onClick={() => updateStatus(ticket.id, 'ouvert')}
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
