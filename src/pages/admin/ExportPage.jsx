import { useState } from 'react'
import { Download, FileText } from 'lucide-react'

import { useApp } from '../../lib/app-context'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

const OPTIONS = [
  { label: '订单数据', value: 'orders' },
  { label: '客户数据', value: 'customers' },
  { label: '账号数据', value: 'users' },
]

export default function ExportPage() {
  const { api, pushToast } = useApp()
  const [resource, setResource] = useState('orders')
  const [downloading, setDownloading] = useState(false)

  const handleExport = async () => {
    setDownloading(true)
    try {
      const response = await api.get('/admin/export', {
        params: { resource },
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resource}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      pushToast('success', '导出完成')
    } catch {
      pushToast('error', '导出失败')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900">
      <CardHeader className="flex flex-col gap-2 px-4 py-4 sm:px-5">
        <CardTitle className="text-2xl font-semibold text-gray-900 md:text-[28px]">数据导出</CardTitle>
        <p className="text-sm text-gray-500">支持导出订单、客户和账号数据为 CSV。</p>
      </CardHeader>
      <CardContent className="space-y-5 px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        <div className="grid gap-3 sm:grid-cols-3">
          {OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setResource(item.value)}
              className={[
                'rounded-xl border px-4 py-4 text-left transition shadow-xs',
                resource === item.value
                  ? 'bg-blue-50 border-blue-700 text-blue-900 font-semibold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleExport} disabled={downloading}>
            <Download className="h-4 w-4" />
            {downloading ? '导出中...' : '下载 CSV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
