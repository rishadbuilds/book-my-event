import { Link } from 'react-router-dom'
import { btn } from '../../components/ui/buttonStyles'

export default function NotFoundPage() {
  return (
    <section className="px-[6vw] py-24 text-center">
      <h2 className="mb-6 text-3xl font-bold">404, page not found</h2>
      <Link to="/" className={btn}>Go home</Link>
    </section>
  )
}