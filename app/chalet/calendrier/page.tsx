'use client'

import { useEffect, useState } from 'react'

type Reservation = {
  id: string
  date: string
  start_time: string
  end_time: string
  unite: string
  status: string
}

export default function CalendrierChalet() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/chalet')
        const data: Reservation[] = await res.json()
        const accepted = data.filter(r => r.status === 'acceptée')
        setReservations(accepted)
      } catch (err) {
        console.error('Erreur chargement calendrier:', err)
      }
    }

    fetchReservations()
  }, [])

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
    const yyyyMMdd = date.toISOString().split('T')[0]
    const dayReservations = reservations.filter(r => r.date === yyyyMMdd)
    return { date, dayReservations }
  })

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const dayOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ◀
        </button>
        <h1 className="text-xl font-bold capitalize">
          {currentDate.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })}
        </h1>
        <button
          onClick={handleNextMonth}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600 mb-2">
        {dayOfWeek.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[...Array(startOfMonth.getDay())].map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {daysInMonth.map(({ date, dayReservations }) => (
          <div
            key={date.toDateString()}
            className="border p-2 rounded min-h-[80px] text-sm flex flex-col bg-white shadow-sm"
          >
            <div className="font-bold text-gray-700">{date.getDate()}</div>
            {dayReservations.map((r) => (
              <div
                key={r.id}
                className="mt-1 p-1 rounded text-xs bg-blue-100 text-blue-800"
              >
                {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}<br />
                Est-{r.unite !== '—' ? r.unite : '000'}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-center text-gray-500">
        * Seules les réservations approuvées apparaissent ici
      </p>

      <p className="mt-6 text-center text-sm">
        <a
          href="/dashboard"
          className="text-gray-400 hover:text-blue-600 underline transition duration-150"
        >
          ← Retour au tableau de bord
        </a>
      </p>
    </div>
  )
}
