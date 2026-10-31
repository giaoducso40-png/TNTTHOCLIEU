# Học liệu số “Con người và Sức khỏe”

Website tĩnh dùng cho môn Khoa học lớp 4, gồm 5 video tình huống và quy trình 4 bước nhằm phát triển năng lực vận dụng kiến thức, kĩ năng đã học. Sản phẩm dùng HTML, CSS và JavaScript thuần; không cần cài đặt framework hay máy chủ.

**Học viên thực hiện: Cô Trần Nguyễn Thạch Truyền.**

## 1. Cấu trúc thư mục

```text
LV03-HocLieu/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── images/
│   ├── hero-banner.webp
│   ├── mascot-default.webp
│   ├── mascot-thinking.webp
│   ├── mascot-excited.webp
│   ├── mascot-warning.webp
│   ├── mascot-celebrate.webp
│   ├── scene-kb1-lunch.webp
│   ├── scene-kb2-milk.webp
│   ├── scene-kb3-vegetables.webp
│   ├── scene-kb4-pond.webp
│   ├── scene-kb5-water.webp
│   ├── bg-clouds.png
│   ├── bg-pattern.png
│   ├── icon-nutrition.png
│   ├── icon-safety.png
│   ├── icon-water.png
│   ├── icon-star.png
│   ├── icon-pause.png
│   ├── icon-play.png
│   ├── icon-worksheet.png
│   ├── icon-rubric.png
│   ├── badge-nd.png
│   ├── badge-hd.png
│   ├── badge-dx.png
│   ├── badge-gt.png
│   └── footer-decoration.png
└── README.md
```

Hero, năm cảnh tình huống và năm trạng thái Sói Thông Thái là ảnh minh họa chính thức đã được tối ưu cho web. Các tệp icon/badge cũ được giữ để thuận tiện thay thế về sau nhưng giao diện hiện tại ưu tiên minh họa cảnh và biểu tượng CSS nhẹ hơn.

## 2. Mở và sử dụng ngoại tuyến

Có thể nhấp đúp `index.html` để mở trực tiếp. Để kiểm tra đầy đủ như khi triển khai, nên chạy một máy chủ tĩnh tại thư mục dự án:

```bash
python3 -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

Trang không tải phông hoặc thư viện từ mạng; toàn bộ nội dung và tương tác hoạt động ngoại tuyến.

## 3. Thay ảnh minh họa

1. Tạo ảnh theo prompt đã xác định trong yêu cầu thiết kế.
2. Xuất đúng tên tệp; dùng WebP cho hero/cảnh và PNG trong suốt cho mascot.
3. Ghi đè ảnh tương ứng trong `images/`.
4. Giữ tỉ lệ 16:9 cho năm ảnh `scene-kb*.webp`; dùng nền trong suốt cho mascot.
5. Nén ảnh trước khi đưa lên web. Kích thước khuyến nghị:
   - Cảnh video: 1280 × 720 px.
   - Mascot: tối đa khoảng 760 × 760 px, nền trong suốt.
   - Hero: 1920 × 820 px.

Mỗi vị trí ảnh quan trọng trong `index.html` có comment dạng `<!-- IMAGE: images/ten-anh.webp — mô tả -->` và thuộc tính `alt` tiếng Việt.

## 4. Cập nhật video

Mở `js/app.js`, tìm khối `VIDEO_CONFIG` ở đầu tệp rồi điền URL embed cho từng kịch bản:

```javascript
const VIDEO_CONFIG = {
  KB1: {
    src: "https://www.youtube-nocookie.com/embed/MA_VIDEO_1?enablejsapi=1",
    stopTime: 16,
    continueTime: 22
  },
  KB2: {
    src: "https://www.youtube-nocookie.com/embed/MA_VIDEO_2?enablejsapi=1",
    stopTime: 16,
    continueTime: 22
  },
  KB3: {
    src: "https://www.youtube-nocookie.com/embed/MA_VIDEO_3?enablejsapi=1",
    stopTime: 16,
    continueTime: 22
  },
  KB4: {
    src: "https://www.youtube-nocookie.com/embed/MA_VIDEO_4?enablejsapi=1",
    stopTime: 16,
    continueTime: 22
  },
  KB5: {
    src: "https://www.youtube-nocookie.com/embed/MA_VIDEO_5?enablejsapi=1",
    stopTime: 16,
    continueTime: 22
  }
};
```

Quy ước:

- `src`: đường dẫn embed của video.
- `stopTime`: thời điểm dừng phần quan sát, mặc định 16 giây.
- `continueTime`: thời điểm phát phần dữ kiện bổ sung, mặc định 22 giây.
- Khi `src` là chuỗi rỗng, trang tự hiển thị thumbnail và dòng “Video sẽ được cập nhật tại đây”.
- Mỗi vị trí video trong `index.html` có comment `VIDEO_KB1` đến `VIDEO_KB5`, thuộc tính `data-video-id` và `data-segment` để tra cứu nhanh.

Nếu dùng tệp video MP4 cục bộ thay vì YouTube, cần thay phần tạo `iframe` trong hàm `mountConfiguredVideos()` bằng thẻ `<video controls>` và giữ nguyên các mốc `stopTime`, `continueTime`.

## 5. Triển khai GitHub Pages

### Cách 1 — Tạo kho mã mới

1. Đăng nhập GitHub và tạo repository mới, ví dụ `LV03-HocLieu`.
2. Đưa toàn bộ nội dung thư mục dự án lên nhánh `main`; bảo đảm `index.html` nằm ở thư mục gốc repository.
3. Mở **Settings → Pages**.
4. Tại **Build and deployment**, chọn **Deploy from a branch**.
5. Chọn nhánh `main`, thư mục `/ (root)`, sau đó nhấn **Save**.
6. Chờ GitHub Pages công bố địa chỉ dạng `https://ten-tai-khoan.github.io/LV03-HocLieu/`.

### Cách 2 — Dùng Git từ máy tính

```bash
git init
git add .
git commit -m "Hoàn thiện học liệu số LV03"
git branch -M main
git remote add origin https://github.com/TEN_TAI_KHOAN/LV03-HocLieu.git
git push -u origin main
```

Sau khi đẩy mã, bật GitHub Pages như hướng dẫn ở Cách 1.

## 6. Tính năng đã tích hợp

- Bản đồ 5 trạm học tập và trạng thái đã hoàn thành.
- Quy trình 4 bước, khóa bắt buộc tại điểm dừng cá nhân.
- Lưu tiến trình, chế độ sáng/tối, cỡ chữ và trạng thái âm thanh bằng `localStorage`.
- Phiếu học tập có chế độ in riêng.
- Bốn thẻ rubric lật 3D.
- Confetti và huy hiệu khi hoàn thành đủ 5 bài.
- Điều hướng bàn phím, focus ring, alt tiếng Việt và hỗ trợ `prefers-reduced-motion`.
- Responsive cho điện thoại, máy tính bảng và máy tính để bàn.
- Không lưu họ tên, lớp hoặc nội dung phiếu học tập vào `localStorage`.

## 7. Kiểm tra trước khi công bố

1. Mở DevTools và kiểm tra lần lượt 375 px, 768 px và 1440 px.
2. Thử toàn bộ quy trình của ít nhất một bài: xem phần đầu → điểm dừng → dữ kiện mới → giữ/sửa → hoàn thành.
3. Tải lại trang để xác nhận tiến trình được khôi phục.
4. Bật chế độ tối và tăng/giảm cỡ chữ.
5. Mở hộp thoại in tại Phiếu học tập và kiểm tra chỉ phiếu được in.
6. Thử điều hướng bằng phím Tab, Enter, Space và Escape.
7. Kiểm tra Console không có lỗi và tab Network không có tệp ảnh bị thiếu.
8. Thử tắt mạng để xác nhận toàn bộ trang vẫn hoạt động ngoại tuyến.

## 8. Đặt lại dữ liệu trên máy học sinh

Mở **Hướng dẫn cho Giáo viên** ở cuối trang và chọn **Đặt lại toàn bộ tiến trình**. Thao tác này xóa trạng thái hoàn thành 5 bài nhưng giữ chế độ màu, cỡ chữ và lựa chọn âm thanh.
