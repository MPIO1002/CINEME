import { Loader2 } from "lucide-react"

const Loading: React.FC = () => {
    return (
        <div className="animate-pulse">
            <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <div className="text-gray-500 text-lg font-medium">Đang tải dữ liệu...</div>
                <div className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</div>
            </div>
            </div>
        </div>
    )
}

export default Loading;