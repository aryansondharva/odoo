import LeftNav from './LeftNav'
import Topbar from './Topbar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <LeftNav />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative" style={{ zIndex: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
