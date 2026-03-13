---
description: "Hệ thống Content Agent chiến lược. Sử dụng /rune content để bắt đầu."
disable-model-invocation: true
---

# Commands: @rune/content-mind

Sử dụng các lệnh sau để điều phối Content Agent:

## Sản xuất nội dung
- `/rune content <topic> --as <persona>`: Khởi động quy trình hội chẩn chiến lược và sản xuất bài viết.
- `/rune content-chat`: Thảo luận riêng với Persona đang nhập vai để lấy ý kiến tư vấn.

## Quản trị Dự án (Workspace)
- `/rune workspace <name>`: Chuyển đổi hoặc khởi tạo dự án mới theo định dạng `[YYYY-MM]-[slug]`.
- `/rune project-status`: Xem Roadmap và trạng thái các bài viết trong dự án hiện tại.

## Hạ tầng (The Forge)
- `/rune content-forge persona <name>`: Tạo Snapshot bản thể cho nhân vật mới (gọi research + mimicker).
- `/rune content-forge style <name>`: Chưng cất phong cách viết từ bài mẫu.

## Trí nhớ
- `/rune content-mind sync`: Đồng bộ hóa trí nhớ phiên (`session-bridge`) vào trí nhớ vĩnh viễn (`neural-memory`).

---
**Ghi chú:** Mọi tài sản tạo ra sẽ được lưu vào thư mục `marketing-hub/projects/` tương ứng với workspace đang chọn.
