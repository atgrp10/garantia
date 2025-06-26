'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

type Ticket = {
  id: number
  problem: string
  type: string
  priorité: string
  status: string
  user_id: string
  created_at: string
  user?: {
    name: string
    unite: string
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterUnite, setFilterUnite] = useState('')

  // Redirection si non-admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard') // ou une page 403 si tu préfères
    } else {
      fetchTickets()
    }
  }, [session, status])

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
      fetchTickets()
    } else {
      const data = await res.json()
      alert(data.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchName = ticket.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? ticket.status === filterStatus : true
    const matchUnite = filterUnite ? ticket.user?.unite === filterUnite : true
    return matchName && matchStatus && matchUnite
  })

  const allUnites = Array.from(new Set(tickets.map(ticket => ticket.user?.unite).filter(Boolean)))

  if (!session || session.user.role !== 'admin') {
    return <p className="text-center mt-10 text-red-500">Accès refusé.</p>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des tickets</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Se déconnecter
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        >
          <option value="">-- Filtrer par statut --</option>
          <option value="ouvert">Ouvert</option>
          <option value="en traitement">En traitement</option>
          <option value="résolu">Résolu</option>
        </select>
        <select
          value={filterUnite}
          onChange={(e) => setFilterUnite(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        >
          <option value="">-- Filtrer par unité --</option>
          {allUnites.map(unite => (
            <option key={unite} value={unite}>{unite}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}
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
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Unité</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="p-2 border">{ticket.id}</td>
                <td className="p-2 border">{ticket.problem}</td>
                <td className="p-2 border">{ticket.type}</td>
                <td className="p-2 border">{ticket.priorité}</td>
                <td className="p-2 border">{ticket.status}</td>
                <td className="p-2 border">{ticket.user?.name || 'Inconnu'}</td>
                <td className="p-2 border">{ticket.user?.unite || 'N/A'}</td>
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
