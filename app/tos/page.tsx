import { NavBar } from "@/components/nav-bar" // Changed from Navigation to NavBar

export default function TOSPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-8 text-gray-300">
          <p>
            Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and
            be bound by the following terms and conditions of use, which together with our privacy policy govern
            abuse.bin's relationship with you in relation to this website.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Terms</h2>
            <p>
              By accessing this website, you are agreeing to be bound by these terms of service, all applicable laws and
              regulations, and agree that you are responsible for compliance with any applicable local laws. If you do
              not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on
              abuse.bin's website for personal, non-commercial transitory viewing only. This is the grant of a license,
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>modify or copy the materials;</li>
              <li>
                use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
              </li>
              <li>attempt to decompile or reverse engineer any software contained on abuse.bin's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p className="mt-4">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated
              by abuse.bin at any time. Upon terminating your viewing of these materials or upon the termination of this
              license, you must destroy any downloaded materials in your possession whether in electronic or printed
              format.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Disclaimer</h2>
            <p>
              The materials on abuse.bin's website are provided on an 'as is' basis. abuse.bin makes no warranties,
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Limitations</h2>
            <p>
              In no event shall abuse.bin or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability
              to use the materials on abuse.bin's website, even if abuse.bin or a abuse.bin authorized representative
              has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Accuracy of materials</h2>
            <p>
              The materials appearing on abuse.bin's website could include technical, typographical, or photographic
              errors. abuse.bin does not warrant that any of the materials on its website are accurate, complete or
              current. abuse.bin may make changes to the materials contained on its website at any time without notice.
              However abuse.bin does not make any commitment to update the materials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Links</h2>
            <p>
              abuse.bin has not reviewed all of the sites linked to its website and is not responsible for the contents
              of any such linked site. The inclusion of any link does not imply endorsement by abuse.bin of the site.
              Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Modifications</h2>
            <p>
              abuse.bin may revise these terms of service for its website at any time without notice. By using this
              website you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Paste guidelines</h2>
            <p>
              All pastes must comply with our terms of service. Any paste that violates these terms will be removed
              without notice. Repeated violations may result in account termination.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
