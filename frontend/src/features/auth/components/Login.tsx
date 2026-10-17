import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authApi'


export default function Login() {

  // inside the component:
const navigate = useNavigate()
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const form = new FormData(e.currentTarget)
  setLoading(true)
  setError('')
  try {
    const res = await loginUser({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    localStorage.setItem('accessToken', res.accessToken)
    navigate('/')
  } catch (err) {
    setError((err as Error).message)
  } finally {
    setLoading(false)
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-gray-500">
          Sign in to your BookMyEvent account.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-violet-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-violet-600"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/" className="font-semibold text-violet-600">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
