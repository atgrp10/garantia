'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: number
  problem: string
  type: string
  priorité: string
  status: string
  date_incident: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])

  const fetchTickets = useCallback(async () => {
    const res = await fetch(`/api/ticket?user_id=${session?.user.id}`)
    const data = await res.json()
    setTickets(data)
  }, [session?.user.id])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      fetchTickets()
    }
  }, [session, status, fetchTickets, router])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      {/* En-tête avec message personnalisé */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenue {session?.user.name} ({session?.user.unite})
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Se déconnecter
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => router.push('/ticket')}
        >
          + Nouveau ticket
        </button>
        <button
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => router.push('/chalet')}
        >
          🏡 Réserver le chalet urbain
        </button>
        <button
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          onClick={() => router.push('/chalet/calendrier')}
        >
          📅 Voir le calendrier du chalet
        </button>
      </div>

      {tickets.length === 0 ? (
        <p>Aucun ticket trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="border p-4 rounded shadow">
              <p className="font-semibold">{ticket.problem}</p>
              <p>Type : {ticket.type}</p>
              <p>Priorité : {ticket.priorité}</p>
              <p>Statut : {ticket.status}</p>
              <p>Date : {new Date(ticket.date_incident).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
