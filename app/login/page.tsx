'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    })

    if (res?.error) {
      setError('Identifiants invalides')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/ticket')
      }
    }
  }, [status, session, router])

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Connexion</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading && <p className="text-blue-600 mb-2">Connexion en cours...</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
          disabled={loading}
        >
          Se connecter
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Pas de compte?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          S’inscrire ici
        </a>
      </p>
    </div>
  )
}
