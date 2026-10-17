import { useNavigate } from 'react-router-dom'
import { btn, btnOutline } from '../../components/ui/buttonStyles'
import { useAuth, type Role } from '../../features/auth/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const go = (role: Role) => {
    login(role)
    navigate(role === 'admin' ? '/admin' : '/app')
  }

  return (
    <section className="px-[6vw] py-20 text-center">
      <h2 className="text-3xl font-bold">Sign in (demo)</h2>
      <p className="mt-2 text-zinc-500">Replace this with your real auth form.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button className={btn} onClick={() => go('user')}>Continue as user</button>
        <button className={btnOutline} onClick={() => go('admin')}>Continue as admin</button>
      </div>
    </section>
  )
}