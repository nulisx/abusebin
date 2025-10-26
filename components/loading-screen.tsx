import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <Image src="/images/loading-logo.gif" alt="Loading" width={200} height={200} className="object-contain mb-4" />
      <div className="text-white text-xl">Loading....</div>
    </div>
  )
}
