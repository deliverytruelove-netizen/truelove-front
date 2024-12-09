
import Link from 'next/link'

export default function Title() {
  return (
    <Link href="/" className="inline-block">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-[#ff0066]">PedidosYa</span>
      </div>
    </Link>
  )
}

