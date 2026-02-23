import { Link } from '@tanstack/react-router'

import HeaderNav from './HeaderNav'
import { showVacayAssistant } from './VacayAssistant'

import { allPosts } from 'content-collections'

export default function Header() {
  const categories = Array.from(
    new Set(allPosts.flatMap((post) => post.categories)),
  )

  const handleVacayClick = () => {
    showVacayAssistant.setState(() => true)
  }

  return (
    <>
      <HeaderNav />
      <header className="text-slate-700 font-serif font-extrabold fixed top-20 left-0 right-0 z-0 backdrop-blur-md bg-white/50 border-b border-slate-200/50 transition-all">
        <nav className="max-w-7xl mx-auto p-4 flex gap-2 justify-between">
          <div className="flex flex-row items-center space-x-6">
            <div className="text-xl tracking-wide">
              <Link to="/" className="hover:text-emerald-700 transition-colors">
                Hawaii Adventures
              </Link>
            </div>
            <div className="flex gap-6">
              {categories.map((category) => (
                <div key={category}>
                  <Link
                    to={`/category/${category}`}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    {category}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleVacayClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-amber-400/90 via-orange-500/90 to-rose-500/90 hover:from-amber-400 hover:via-orange-500 hover:to-rose-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]"
          >
            <span className="text-base">🌴</span>
            <span className="tracking-wide">Vacay Assistant</span>
          </button>
        </nav>
      </header>
    </>
  )
}
