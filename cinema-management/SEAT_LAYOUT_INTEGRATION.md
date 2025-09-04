# Tích hợp SeatLayoutDesigner với RoomModal

## Mô tả
Tài liệu này mô tả cách tích hợp `SeatLayoutDesigner` với `RoomModal` để có thể chỉnh sửa bố cục ghế từ dữ liệu API, bao gồm tính năng tạo lối đi (aisles) giữa các ghế.

## Workflow tạo đường trống giữa các ghế

### 1. Sử dụng công cụ "Khoảng trống"
- **Icon**: ⬜ (Square icon)
- **Tên**: "Khoảng trống" 
- **Màu sắc**: Nền trắng với viền nét đứt
- **Chức năng**: Tạo khoảng trống để làm lối đi giữa các ghế

### 2. Workflow thực tế:

#### Bước 1: Chọn công cụ "Khoảng trống"
```tsx
// Trong toolbar, chọn tool 'empty'
selectedTool = 'empty'
```

#### Bước 2: Vẽ lối đi
- Click hoặc kéo thả trên các ô cần tạo khoảng trống
- Thường tạo lối đi giữa (center aisle) và lối đi hai bên

#### Bước 3: Auto-layout thông minh
```tsx
const generateAutoLayout = () => {
  // Tự động tạo lối đi giữa 2 cột ở trung tâm
  const centerAisle = Math.floor(columns / 2);
  if (col === centerAisle || col === centerAisle - 1) {
    // Tạo empty space cho lối đi giữa
    type: 'empty'
  }
}
```

### 3. Các loại seat types đã được mở rộng:

```tsx
export type SeatType = 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' | 'empty';
```

| Type | Icon | Màu sắc | Mô tả |
|------|------|---------|-------|
| `regular` | 💺 | Xanh dương | Ghế thường |
| `vip` | 👑 | Vàng | Ghế VIP |
| `couple` | ❤️ | Hồng | Ghế đôi |
| `disabled` | ♿ | Xanh lá | Ghế khuyết tật |
| `empty` | ⬜ | Trắng (nét đứt) | **Khoảng trống/Lối đi** |
| `blocked` | ❌ | Xám | Chặn/Xóa |

## Các thay đổi đã thực hiện

### 1. Thêm type 'empty' cho khoảng trống
```tsx
// SeatLayoutDesigner.tsx
export type SeatType = 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' | 'empty';

// Thêm xử lý cho empty space
case 'empty': return 'bg-white hover:bg-gray-50 border-gray-300 border-dashed';
case 'empty': return '⬜';
case 'empty': return <Square className="w-4 h-4" />;
```

### 2. Cập nhật hàm thống kê
```tsx
const getSeatStats = () => {
  const stats = {
    regular: 0, vip: 0, couple: 0, disabled: 0, 
    empty: 0, // Thêm empty counter
    total: 0
  };
  
  seats.forEach(seat => {
    if (seat.type !== 'blocked' && seat.type !== 'empty') {
      // Chỉ đếm ghế thực, không đếm khoảng trống
      if (['regular', 'vip', 'couple', 'disabled'].includes(seat.type)) {
        stats[seat.type]++;
        stats.total++;
      }
    } else if (seat.type === 'empty') {
      stats.empty++; // Đếm riêng khoảng trống
    }
  });
};
```

### 3. Auto-layout với lối đi tự động
```tsx
const generateAutoLayout = () => {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      // Tạo lối đi giữa tự động
      const centerAisle = Math.floor(columns / 2);
      if (col === centerAisle || col === centerAisle - 1) {
        newSeats.push({
          type: 'empty', // Khoảng trống cho lối đi
          isAvailable: false
        });
        continue;
      }
      // ... logic tạo ghế bình thường
    }
  }
};
```

### 4. Xử lý conversion API ↔ Designer
```tsx
// RoomModal.tsx - Hỗ trợ empty type
let seatType: 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' | 'empty' = 'regular';
if (seat.type && ['regular', 'vip', 'couple', 'disabled', 'blocked', 'empty'].includes(seat.type)) {
  seatType = seat.type as SeatType;
}
```

### 5. Cập nhật tính toán ghế
```tsx
const handleSeatLayoutSave = (seats: Seat[]) => {
  // Loại bỏ empty spaces khỏi tính toán tổng ghế
  const actualSeats = seats.filter(s => s.type !== 'empty' && s.type !== 'blocked');
  const total = actualSeats.length; // Chỉ đếm ghế thực
};
```

## Cách sử dụng trong thực tế

### 1. **Tạo bố cục thủ công**:
```
1. Chọn công cụ "Ghế thường" → Vẽ khu vực ghế thường
2. Chọn công cụ "Khoảng trống" → Vẽ lối đi giữa
3. Chọn công cụ "Ghế VIP" → Vẽ khu vực VIP
4. Chọn công cụ "Ghế đôi" → Vẽ ghế đôi ở hai bên
```

### 2. **Sử dụng Auto-layout**:
```
- Click "Tạo bố cục tự động"
- Hệ thống tự động tạo:
  ✓ Lối đi giữa (2 cột ở trung tâm)
  ✓ Ghế VIP ở 2 hàng cuối
  ✓ Ghế đôi ở góc của hàng VIP
  ✓ Ghế thường ở phần còn lại
```

### 3. **Pattern layout phổ biến**:
```
💺💺💺⬜⬜💺💺💺  ← Hàng A
💺💺💺⬜⬜💺💺💺  ← Hàng B
💺💺💺⬜⬜💺💺💺  ← Hàng C
❤️👑👑⬜⬜👑👑❤️  ← Hàng VIP
❤️👑👑⬜⬜👑👑❤️  ← Hàng VIP
```

## Lưu ý quan trọng

1. **Khoảng trống vs Ghế thực**:
   - `empty` = Lối đi, không được tính vào tổng ghế
   - `blocked` = Vị trí bị chặn, không được tính vào tổng ghế
   - Chỉ các loại `regular`, `vip`, `couple`, `disabled` được tính vào tổng số ghế

2. **Hiển thị trong preview**:
   - Khoảng trống hiển thị với viền nét đứt
   - Không có icon bên trong
   - Được đếm riêng trong thống kê

3. **Workflow khuyến nghị**:
   - Sử dụng "Tạo bố cục tự động" làm base
   - Tinh chỉnh bằng tay với các công cụ
   - Sử dụng "Khoảng trống" để tạo lối đi theo ý muốn

## API Integration

Khi lưu về API, `empty` spaces sẽ được:
- Lưu trong database như một loại seat đặc biệt
- Không được tính vào capacity của phòng
- Hiển thị trong seat map như khoảng trống
