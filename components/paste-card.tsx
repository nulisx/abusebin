import type React from "react"
import Link from "next/link"
import type { Paste } from "@/types/paste" // Assuming Paste type is declared somewhere

interface PasteCardProps {
  paste: Paste
}

const PasteCard: React.FC<PasteCardProps> = ({ paste }) => {
  return (
    <div>
      <Link
        href={`/paste/${paste.id}`}
        className={`block p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors bg-gray-900/50`}
      >
        {/* Content of the paste card */}
        <h2 className="text-xl font-bold">{paste.title}</h2>
        <p className="text-gray-400">{paste.description}</p>
      </Link>
    </div>
  )
}

export default PasteCard
