'use client'

import { useEffect, useState } from 'react'

type Reservation = {
  id: number
  date: string // YYYY-MM-DD
  heure_debut: string // HH:mm
  heure_fin: string // HH:mm
  unite: string
  status: string
}

export default function CalendrierChalet() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    const res = await fetch('/api/chalet')
    const data = await res.json()
    setReservations(data.filter((r: Reservation) => r.status === 'accepté'))
  }

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
    const yyyyMMdd = date.toISOString().split('T')[0]
    const dayReservations = reservations.filter(r => r.date === yyyyMMdd)
    return { date, dayReservations }
  })

  const handlePrevMonth = () => {
    const prev = new Date(currentDate)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentDate(prev)
  }

  const handleNextMonth = () => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
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
        <h1 className="text-xl font-bold">
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
        {/* padding days before the 1st */}
        {[...Array(startOfMonth.getDay())].map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {daysInMonth.map(({ date, dayReservations }) => (
          <div
            key={date.toISOString()}
            className="border p-2 rounded min-h-[80px] text-sm flex flex-col bg-white shadow-sm"
          >
            <div className="font-bold text-gray-700">{date.getDate()}</div>
            {dayReservations.map((r) => (
              <div
                key={r.id}
                className="mt-1 p-1 rounded text-xs bg-blue-100 text-blue-800"
              >
                {r.heure_debut} - {r.heure_fin} <br /> {r.unite}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-center text-gray-500">
        * Seules les réservations approuvées apparaissent ici
      </p>
    </div>
  )
}
