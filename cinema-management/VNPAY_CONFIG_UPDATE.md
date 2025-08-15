# VNPay Configuration Update
# Cập nhật cấu hình VNPay trong backend để redirect về frontend

VN_PAY_URL = http://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VN_PAY_RETURN_URL = http://localhost:5173/payment-result/VnPayReturn
VN_PAY_TMN_CODE = 487Z2MWR
VN_PAY_SECRET_KEY = 69PIXC6DVAJO02OGMU07SJ5RLWAI11GS
VN_PAY_VERSION = 2.1.0
VN_PAY_COMMAND = pay
VN_PAY_ORDER_TYPE = other

# Lưu ý:
# - Đã thay đổi VN_PAY_RETURN_URL từ http://localhost:8080/api/v1/bookings 
#   thành http://localhost:5173/payment-result/VnPayReturn
# - Frontend sẽ tự động gọi API backend để lấy thông tin booking
# - URL callback sẽ chứa tất cả thông tin VNPay cần thiết
# - Route /payment-result/VnPayReturn đã được thêm vào router
