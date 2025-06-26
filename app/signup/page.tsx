'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bloc: '',
    unite_num: '',
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

    if (!['Est', 'Ouest'].includes(form.bloc)) {
      setError('Veuillez sélectionner un bloc valide (Est ou Ouest).')
      return
    }

    if (!/^\d{3}$/.test(form.unite_num)) {
      setError('Le numéro d’unité doit contenir exactement 3 chiffres.')
      return
    }

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur inconnue')
    } else {
      setSuccess(true)
      setForm({
        name: '',
        email: '',
        password: '',
        bloc: '',
        unite_num: '',
      })
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Créer un compte</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">Compte créé avec succès !</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nom"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          name="bloc"
          className="w-full border p-2 rounded"
          value={form.bloc}
          onChange={handleChange}
          required
        >
          <option value="">-- Sélectionnez votre bloc --</option>
          <option value="Est">Est</option>
          <option value="Ouest">Ouest</option>
        </select>
        <input
          type="text"
          name="unite_num"
          placeholder="Numéro d’unité (ex : 304)"
          pattern="\d{3}"
          maxLength={3}
          className="w-full border p-2 rounded"
          value={form.unite_num}
          onChange={handleChange}
          required
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded">
          S’inscrire
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        Vous avez déjà un compte ?{' '}
        <a href="/login" className="text-blue-600 underline">
          Se connecter
        </a>
      </p>
    </div>
  )
}
