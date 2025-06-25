import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">Bienvenue sur Garantia</h1>
      <p className="text-lg text-center mb-6 max-w-xl">
        Garantia est votre plateforme pour signaler et suivre les problèmes dans votre unité de condo. Simple, rapide, et efficace.
      </p>

      {!session ? (
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Se connecter
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="bg-white text-black border border-black px-6 py-2 rounded hover:bg-gray-100 transition"
          >
            S’inscrire
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Bonjour, {session.user.name} !</p>
          <button
            onClick={() => router.push('/ticket')}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Accéder à mes tickets
          </button>
        </div>
      )}

      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} Garantia – Une solution Apex Terra Group
      </footer>
    </div>
  )
}
