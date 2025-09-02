# Fix: Reset Seat Data When Adding New Room

## Vấn đề
Khi bấm "Thêm phòng chiếu mới", dữ liệu ghế từ phòng cũ vẫn còn lưu trong state, gây ra việc SeatLayoutDesigner hiển thị ghế cũ thay vì bắt đầu với bố cục trống.

## Nguyên nhân
1. **State initialization issue**: `useState(room || defaultRoom)` chỉ set một lần khi component mount, không update khi `room` prop thay đổi
2. **Incomplete state reset**: Khi chuyển sang mode "add", không tất cả states liên quan được reset
3. **SeatLayoutDesigner inheritance**: Designer nhận `initialSeats` từ form state cũ

## Giải pháp đã áp dụng

### 1. Cải thiện State Initialization
```tsx
// Trước
const [form, setForm] = useState<Room>(room || defaultRoom);

// Sau  
const getDefaultForm = (): Room => ({
  name: "",
  type: "2D",
  // ... other default values
  seatLayout: [], // Đảm bảo seat layout luôn empty
});

const [form, setForm] = useState<Room>(getDefaultForm());
```

### 2. Reset Complete States trong useEffect
```tsx
} else if (mode === "add") {
  // Reset ALL states for new room
  setForm(getDefaultForm()); // Sử dụng hàm để đảm bảo consistent
  
  // Reset all related states
  setShowSeatDesigner(false);
  setLoadingSeatData(false);
  setLoading(false);
}
```

### 3. Conditional initialSeats cho SeatLayoutDesigner
```tsx
<SeatLayoutDesigner
  open={showSeatDesigner}
  roomName={form.name || "Phòng chiếu"}
  initialSeats={
    loadingSeatData 
      ? [] 
      : mode === "add" 
      ? [] // Always start with empty layout for new rooms
      : convertAPISeatsToDesignerFormat(form.seatLayout || [])
  }
  onSave={handleSeatLayoutSave}
  onClose={() => setShowSeatDesigner(false)}
/>
```

## Luồng hoạt động mới

### Khi mở modal Add Room:
1. `mode = "add"` và `room = undefined`
2. `useEffect` được trigger với dependency `[room, mode, open]`
3. Condition `mode === "add"` được thực thi:
   - `setForm(getDefaultForm())` → Reset form về trạng thái mặc định
   - `setShowSeatDesigner(false)` → Đảm bảo designer đóng
   - Reset các loading states
4. Khi mở SeatLayoutDesigner:
   - `mode === "add"` → `initialSeats = []`
   - Designer bắt đầu với grid trống hoàn toàn

### Khi mở modal Edit/View Room:
1. `mode = "edit"/"view"` và `room = roomData`
2. `useEffect` load dữ liệu room và seats từ API
3. Map data và update form state
4. Khi mở SeatLayoutDesigner:
   - `convertAPISeatsToDesignerFormat(form.seatLayout)` 
   - Designer hiển thị layout hiện tại

## Kết quả
- ✅ Mode "add": SeatLayoutDesigner luôn bắt đầu với grid trống
- ✅ Mode "edit": SeatLayoutDesigner hiển thị đúng layout hiện tại  
- ✅ Mode "view": Hiển thị layout read-only
- ✅ Không có "memory leak" của dữ liệu cũ giữa các lần mở modal

## Test Cases
1. **Add → Add**: Mở add, đóng, mở add lại → Phải trống
2. **Edit → Add**: Mở edit (có seats), đóng, mở add → Phải trống  
3. **Add → Edit**: Mở add, đóng, mở edit → Phải hiển thị đúng seats
4. **Designer Reset**: Trong add mode, mở designer → Phải là grid trống
