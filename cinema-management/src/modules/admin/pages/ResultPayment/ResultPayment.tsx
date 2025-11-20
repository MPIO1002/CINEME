import jsPDF from 'jspdf';
import { CheckCircle, Clock, CreditCard, Info, Printer, Receipt, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PaymentParams {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: string;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: string;
  message: string;
  payType: string;
  responseTime: string;
  extraData: string;
  signature: string;
}

const ResultPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentParams, setPaymentParams] = useState<PaymentParams | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // Extract all parameters from URL
    const params: PaymentParams = {
      partnerCode: searchParams.get('partnerCode') || '',
      orderId: searchParams.get('orderId') || '',
      requestId: searchParams.get('requestId') || '',
      amount: searchParams.get('amount') || '0',
      orderInfo: searchParams.get('orderInfo') || '',
      orderType: searchParams.get('orderType') || '',
      transId: searchParams.get('transId') || '',
      resultCode: searchParams.get('resultCode') || '',
      message: searchParams.get('message') || '',
      payType: searchParams.get('payType') || '',
      responseTime: searchParams.get('responseTime') || '',
      extraData: searchParams.get('extraData') || '',
      signature: searchParams.get('signature') || '',
    };

    setPaymentParams(params);
    setIsSuccess(params.resultCode === '0');
  }, [searchParams]);

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(amount));
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return { date: '', time: '' };
    const date = new Date(parseInt(timestamp));
    return {
      date: date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const getPaymentMethodLabel = (payType: string) => {
    switch(payType) {
      case 'qr':
        return 'Quét mã QR';
      case 'web':
        return 'Cổng thanh toán web';
      case 'credit':
        return 'Thẻ tín dụng/Ghi nợ';
      default:
        return payType;
    }
  };

  const handlePrintPDF = async () => {
    if (!paymentParams) return;
    
    try {
      setIsPrinting(true);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Helper function to convert Vietnamese to ASCII-safe text
      const toAscii = (text: string): string => {
        // First normalize and remove diacritics
        let result = text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D');
        
        // Remove any remaining non-ASCII characters except basic punctuation and numbers
        result = result.replace(/[^\x20-\x7E]/g, '');
        
        return result;
      };

      // Helper function to add text
      const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        let xPos = margin;
        if (align === 'center') {
          xPos = pageWidth / 2;
        } else if (align === 'right') {
          xPos = pageWidth - margin;
        }
        
        pdf.text(toAscii(text), xPos, yPos, { align });
        yPos += fontSize * 0.5;
      };

      const addLine = () => {
        yPos += 3;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      };

      const addSpace = (space: number = 5) => {
        yPos += space;
      };

      // Header
      pdf.setFillColor(isSuccess ? 34 : 239, isSuccess ? 197 : 68, isSuccess ? 94 : 68);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      yPos = 15;
      addText('HOA DON THANH TOAN', 18, true, 'center');
      yPos += 2;
      addText(isSuccess ? 'THANH TOAN THANH CONG' : 'THANH TOAN THAT BAI', 14, false, 'center');
      
      // Reset color
      pdf.setTextColor(0, 0, 0);
      yPos = 50;

      // Amount section
      addSpace(5);
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
      yPos += 8;
      addText('SO TIEN THANH TOAN', 10, false, 'center');
      yPos += 2;
      addText(formatAmount(paymentParams.amount), 20, true, 'center');
      yPos += 8;

      addSpace(10);
      addLine();

      // Order info
      addText('THONG TIN DON HANG', 12, true);
      addSpace(5);
      
      const orderInfo = decodeURIComponent(paymentParams.orderInfo);
      addText(orderInfo, 10, false);
      addSpace(3);
      addText(`Trang thai: ${decodeURIComponent(paymentParams.message)}`, 10, false);
      
      addSpace(8);
      addLine();

      // Transaction details
      addText('CHI TIET GIAO DICH', 12, true);
      addSpace(5);

      const details = [
        ['Ma giao dich:', paymentParams.transId],
        ['Ma don hang:', paymentParams.orderId],
        ['Phuong thuc:', `${paymentParams.partnerCode} - ${getPaymentMethodLabel(paymentParams.payType)}`],
        ['Thoi gian:', `${dateTime.time} - ${dateTime.date}`],
        ['Ma ket qua:', `${paymentParams.resultCode} (${isSuccess ? 'Thanh cong' : 'That bai'})`]
      ];

      details.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(toAscii(label), margin, yPos);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(toAscii(value), contentWidth - 50);
        pdf.text(lines, margin + 50, yPos);
        yPos += 7 * lines.length;
      });

      addSpace(8);
      addLine();

      // Footer notes
      if (isSuccess) {
        addText('LUU Y', 12, true);
        addSpace(5);
        const notes = [
          'Giao dich da duoc xu ly thanh cong',
          'Vui long luu lai hoa don nay de tra cuu khi can',
          'In ve va dua cho khach hang',
          'Nhac khach hang xuat trinh ve khi vao phong chieu'
        ];
        notes.forEach(note => {
          addText(`- ${note}`, 9, false);
          addSpace(3);
        });
      } else {
        addText('XU LY GIAO DICH THAT BAI', 12, true);
        addSpace(5);
        const notes = [
          'Kiem tra lai ket noi mang va thu lai',
          'Neu van de van tiep dien, lien he bo phan IT',
          `Ma giao dich de tra cuu: ${paymentParams.transId}`,
          'Giao dich chua hoan tat, vui long thuc hien lai'
        ];
        notes.forEach(note => {
          addText(`- ${note}`, 9, false);
          addSpace(3);
        });
      }

      // Footer
      yPos = pageHeight - 25;
      addLine();
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(toAscii('CineMe Cinema - He thong rap chieu phim'), pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      pdf.text(toAscii(`In luc: ${new Date().toLocaleString('vi-VN')}`), pageWidth / 2, yPos, { align: 'center' });

      // Generate filename
      const timestamp = new Date().getTime();
      pdf.save(`Hoa-Don-${paymentParams?.orderId || timestamp}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Không thể tạo file PDF. Vui lòng thử lại!');
    } finally {
      setIsPrinting(false);
    }
  };

  if (!paymentParams) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  const dateTime = formatDateTime(paymentParams.responseTime);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Ticket Content - This will be captured for PDF */}
        <div ref={ticketRef} data-pdf-content>
        {/* Status Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden mb-8 ${
          isSuccess 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              {isSuccess ? (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-3">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </h1>
            
            <p className="text-xl text-white/90 mb-6">
              {decodeURIComponent(paymentParams.message)}
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
              <p className="text-white/80 text-sm mb-2">Số tiền thanh toán</p>
              <p className="text-5xl font-bold text-white">
                {formatAmount(paymentParams.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <div className="flex items-center gap-3">
              <Receipt className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Chi tiết giao dịch</h2>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Order Info */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Info className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Thông tin đơn hàng</p>
                <p className="text-lg font-semibold text-gray-800">
                  {decodeURIComponent(paymentParams.orderInfo)}
                </p>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Mã giao dịch</p>
                <p className="text-base font-mono font-semibold text-gray-800 break-all">
                  {paymentParams.transId}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Mã đơn hàng</p>
                <p className="text-base font-mono font-semibold text-gray-800 break-all">
                  {paymentParams.orderId}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="bg-blue-100 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
                <p className="text-lg font-semibold text-gray-800">
                  {paymentParams.partnerCode} - {getPaymentMethodLabel(paymentParams.payType)}
                </p>
              </div>
            </div>

            {/* Date Time */}
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Thời gian giao dịch</p>
                <p className="text-lg font-semibold text-gray-800">
                  {dateTime.time} - {dateTime.date}
                </p>
              </div>
            </div>

            {/* Result Code */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Mã kết quả</p>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  isSuccess 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {paymentParams.resultCode}
                </span>
                <span className="text-gray-600">
                  {isSuccess ? '(Thành công)' : '(Thất bại)'}
                </span>
              </div>
            </div>
          {/* </div> */}
        {/* )} */}
        </div>
        {/* End Ticket Content */}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSuccess && (
            <button
              onClick={handlePrintPDF}
              disabled={isPrinting}
              className={`flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ${
                isPrinting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Printer className="w-6 h-6" />
              {isPrinting ? 'Đang tạo PDF...' : 'In vé (PDF)'}
            </button>
          )}
          
          <button
            onClick={() => navigate('/admin/bookings')}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Receipt className="w-6 h-6" />
            Quay lại quản lý đặt vé
          </button>

          {!isSuccess && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Thử lại
            </button>
          )}
        </div>

        {/* Note */}
        {isSuccess && (
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-blue-900 font-semibold mb-2">Lưu ý</p>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Giao dịch đã được xử lý thành công</li>
                  <li>• Vui lòng lưu lại mã giao dịch để tra cứu khi cần</li>
                  <li>• In vé và đưa cho khách hàng</li>
                  <li>• Nhắc khách hàng xuất trình vé khi vào phòng chiếu</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!isSuccess && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-900 font-semibold mb-2">Xử lý giao dịch thất bại</p>
                <ul className="text-red-800 space-y-1 text-sm">
                  <li>• Kiểm tra lại kết nối mạng và thử lại</li>
                  <li>• Nếu vấn đề vẫn tiếp diễn, liên hệ bộ phận IT</li>
                  <li>• Mã giao dịch để tra cứu: <span className="font-mono font-bold">{paymentParams.transId}</span></li>
                  <li>• Giao dịch chưa hoàn tất, vui lòng thực hiện lại</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ResultPayment;
