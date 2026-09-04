import { useState } from 'react'
import { CheckCircle2, Loader2, UploadCloud, X, XCircle } from 'lucide-react'

import { useApp } from '../../lib/app-context'

export function UploadQueueWidget() {
  const { saveJobs, dismissSaveJob } = useApp()
  const [expanded, setExpanded] = useState(false)

  if (!saveJobs.length) return null

  const activeCount = saveJobs.filter((j) => j.status !== 'error').length

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
      {expanded && (
        <div className="w-72 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {saveJobs.map((job) => {
            const pct = job.total ? Math.round((job.completed / job.total) * 100) : 100
            return (
              <div key={job.id} className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 last:border-b-0">
                {job.status === 'error' ? (
                  <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                ) : job.status === 'saving' ? (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-500" />
                ) : (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-500" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-gray-800">{job.label || '商品'}</div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${job.status === 'error' ? 'bg-red-400' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400">
                    {job.status === 'error'
                      ? '保存失败'
                      : job.status === 'saving'
                        ? '正在写入商品...'
                        : `图片上传中 ${job.completed}/${job.total}`}
                  </div>
                </div>
                {job.status === 'error' && (
                  <button
                    onClick={() => dismissSaveJob(job.id)}
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl transition hover:bg-blue-800 active:scale-95"
      >
        {activeCount > 0 ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <CheckCircle2 className="h-6 w-6" />
        )}
        {!expanded && (
          <UploadCloud className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white p-0.5 text-blue-700 shadow" />
        )}
        <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-blue-700 shadow">
          {saveJobs.length}
        </span>
      </button>
    </div>
  )
}
