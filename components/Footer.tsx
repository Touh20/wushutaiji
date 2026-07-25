export default function Footer() {
  return (
    <footer className="bg-[var(--ink-deep)] text-white/70 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-cjk font-bold">
                武
              </div>
              <span className="font-cjk text-white font-semibold">武术太极社</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              西安理工大学武术太极社<br />
              传承国术，以武会友
            </p>
          </div>

          <div>
            <h3 className="font-cjk text-white text-sm font-semibold mb-3">联系我们</h3>
            <p className="text-sm text-white/50">
              电话：13109570357
            </p>
          </div>

          <div>
            <h3 className="font-cjk text-white text-sm font-semibold mb-3">快速链接</h3>
            <div className="space-y-1.5">
              <a href="/forum" className="block text-sm text-white/50 hover:text-white/80 transition-colors">校园墙</a>
              <a href="/join" className="block text-sm text-white/50 hover:text-white/80 transition-colors">加入我们</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} 西安理工大学武术太极社. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
