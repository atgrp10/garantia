'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      fetchTickets()
    }
  }, [session, status])

  const fetchTickets = async () => {
    const res = await fetch(`/api/ticket?user_id=${session?.user.id}`)
    const data = await res.json()
    setTickets(data)
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Mes tickets</h1>

      <button
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => router.push('/ticket')}
      >
        + Nouveau ticket
      </button>

      {tickets.length === 0 ? (
        <p>Aucun ticket trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((ticket: any) => (
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
