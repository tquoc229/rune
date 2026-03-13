# Design Document: @rune/content-mind (L4 Pack)

> **Version:** 1.2.0 (Ultimate Strategic Masterplan) | **Status:** Implemented & Verified
> **Objective:** Xây dựng một AI Content Agent có bản thể (Sentience), trí tuệ Marketing chiến lược (CMO Mindset), quản trị dự án chuyên nghiệp (Project Management) và kỹ thuật chấp bút bậc thầy (Master Writing).

## 1. Tầm nhìn & Triết lý (The Vision)
Hệ thống không chỉ là công cụ viết hộ, mà là một **Strategic Content Partner** thực thụ:
- **Thinking before Writing:** Cưỡng bức tư duy chiến lược trước khi đặt bút.
- **Ontological Sentience:** Agent không "nhập vai" hời hợt, nó "sống" bằng niềm tin, trải nghiệm và định kiến của nhân vật (Method Acting).
- **Entropy Ngôn ngữ:** Phá vỡ các quy luật xác suất của AI để tạo ra văn phong tự nhiên như người thật qua các kỹ thuật Pacing, Burstiness và Sensory Anchoring.

## 2. Kiến trúc Hệ thống Phân tầng (Tri-Level Mesh)

Hệ thống được cấu trúc thành 3 tầng năng lực điều phối bởi 12 kỹ năng chuyên biệt.

### Tầng 0: Strategic Orchestrator (Bộ não CMO & PM)
- **Skill chính:** `marketing-orchestrator`.
- **Vai trò:** Giám đốc Marketing & Quản trị dự án.
- **Nhiệm vụ:** Hội chẩn chiến lược, phản biện mục tiêu, quản trị không gian làm việc (Workspace) và lộ trình nội dung (Roadmap).

### Tầng 1: The Forge (Phân xưởng Chế tác Bản thể & Phong cách)
Hạ tầng tạo ra "nguyên liệu" và "linh hồn".
- **`persona-forger`**: "Đúc" bản thể từ dữ liệu thực tế (bài báo, LinkedIn, phỏng vấn).
- **`style-distiller`**: "Chưng cất" DNA phong cách (nhịp điệu, từ vựng) từ các bài viết mẫu.
- **`mechanism-designer`**: Thiết kế khung xương logic (PAS, Storytelling Circle, Contrast...).
- **`content-scout`**: Săn tìm insight từ Internet, mã nguồn dự án và xu hướng thị trường.

### Tầng 2: The Studio (Phòng thu Thực thi & Chế tác)
Nơi "linh hồn" gặp gỡ "kỹ thuật" để tạo ra sản phẩm.
- **`persona-sentience`**: Method Acting. Kích hoạt độc thoại nội tâm và quan điểm cá nhân thô.
- **`psych-linguistic-engine`**: Thấu cảm độc giả (NLP), điều chỉnh "tần số" ngôn ngữ.
- **`writing-architect`**: Tư vấn phối hợp Style + Mechanism tối ưu nhất cho từng bối cảnh.
- **`authentic-human-filter`**: Bộ lọc bản sắc thực. Nạp tính nhân bản, sự "yếu thế" và cụ thể hóa hình ảnh.
- **`master-writer`**: Chấp bút chuyên nghiệp. Điều phối Pacing (nhịp điệu dồn dập/chiêm nghiệm) và CTA.
- **`the-skeptic-editor`**: Biên tập viên hoài nghi (Red Team). Kiểm định giá trị thực, chống sáo rỗng.
- **`proactive-ideator`**: Trợ lý gợi ý chủ động dựa trên Roadmap và xu hướng.

## 3. Quản trị Tài sản & Trí nhớ (DAM & Memory)

### 3.1. Project-Based Workspaces
Mọi dự án là một Folder độc lập, bảo mật và ngăn nắp tại: `marketing-hub/projects/[YYYY-MM]-[slug]/`
- **`project-strategy.md`**: Template chứa Business Goal, Target Segment, USP, Tone Guardrails.
- **`project-roadmap.md`**: Bảng theo dõi Topic, Channel, Status, Persona assigned.
- **`/content/`**: Lưu trữ bài viết phân loại theo Blog, Social, PR.
- **`/assets/`**: Hình ảnh, Banners và nhật ký prompt sinh ảnh.
- **`/personas-local/`**: Các bản chụp (Snapshot) linh hồn riêng cho từng dự án.

### 3.2. Hệ thống Trí nhớ phân tầng (Tiered Memory)
- **Short-term (`rune:session-bridge`)**: Nhớ các bản nháp đang viết dở và phản hồi tức thì trong phiên làm việc.
- **Long-term (`rune:neural-memory`)**: Lưu trữ Snapshot Persona vĩnh viễn và "Hồ sơ tiến hóa" (Agent tự học từ feedback của người dùng qua thời gian).

## 4. Quy trình vận hành chuẩn (Operational Workflow)

1.  **Intake & Scaffold:** Người dùng gọi `/rune content <topic>`. `marketing-orchestrator` khởi tạo folder dự án theo quy tắc đặt tên nếu chưa có.
2.  **Strategic Challenge:** Agent không viết ngay, nó đặt câu hỏi phản biện về mục tiêu và KPI của chủ đề đối với chiến dịch.
3.  **Hydrate & Forge:** Nạp Snapshot Persona từ Neural Memory. Nếu Persona mới, kích hoạt `persona-forger` để nghiên cứu dữ liệu thực tế.
4.  **The Think Phase:** Agent thực hiện Độc thoại nội tâm (Internal Monologue). `writing-architect` tư vấn chọn Style và Mechanism.
5.  **Master Execution:** `master-writer` thực hiện viết thô, sau đó `authentic-human-filter` thực hiện "khử mùi AI" và nạp nhịp điệu Pacing.
6.  **Red Team Review:** `the-skeptic-editor` phê bình độc lập, bắt lỗi logic và sự sáo rỗng. Agent tự sửa lỗi.
7.  **Closure:** Lưu sản phẩm vào DAM, cập nhật Roadmap và lưu bài học kinh nghiệm vào Trí nhớ dài hạn.

## 5. Danh sách Kỹ năng Triển khai (Skill Registry)

Toàn bộ 12 kỹ năng đã được tạo tại thư mục `skills/` với độ sâu Depth 5:
- `skills/marketing-orchestrator/SKILL.md`
- `skills/persona-forger/SKILL.md`
- `skills/style-distiller/SKILL.md`
- `skills/mechanism-designer/SKILL.md`
- `skills/content-scout/SKILL.md`
- `skills/persona-sentience/SKILL.md`
- `skills/psych-linguistic-engine/SKILL.md`
- `skills/writing-architect/SKILL.md`
- `skills/authentic-human-filter/SKILL.md`
- `skills/master-writer/SKILL.md`
- `skills/the-skeptic-editor/SKILL.md`
- `skills/proactive-ideator/SKILL.md`

## 6. Lệnh thực thi (Slash Commands)
- `/rune content <topic>`: Khởi động quy trình hội chẩn và sản xuất.
- `/rune workspace <name>`: Khởi tạo/Chuyển đổi không gian làm việc.
- `/rune content-forge persona <name>`: Đúc bản thể nhân vật mới.
- `/rune content-forge style <name>`: Chưng cất phong cách từ bài mẫu.
- `/rune project-status`: Xem báo cáo Roadmap và DAM.

## 7. Tính minh bạch & Khả năng quan sát (Observability)

Để người dùng không cảm thấy "mất kiểm soát" khi Agent vận hành 12 kỹ năng, hệ thống tuân thủ các quy tắc minh bạch sau:

### 7.1. Skill Announcement (Thông báo kỹ năng)
Mọi lệnh chuyển đổi kỹ năng đều phải được log công khai theo định dạng:
`[Routing] -> [Skill Name]: [Purpose]`

### 7.2. Mandatory Approval Gates (Các điểm dừng phê duyệt)
Agent KHÔNG ĐƯỢC tự ý thực hiện các bước sau mà không có sự xác nhận của người dùng:
1. **Strategic Lock:** Sau khi hội chẩn chiến lược (Tầng 0).
2. **Creative Blueprint:** Sau khi chọn Persona, Style và Mechanism (Tầng 1 & 2).
3. **Red Team Verdict:** Sau khi biên tập viên hoài nghi đưa ra đánh giá chất lượng.

### 7.3. Visual Progress (Theo dõi tiến độ)
Sử dụng công cụ `TodoWrite` để hiển thị lộ trình 8 bước của quy trình vận hành chuẩn (Operational Workflow) theo thời gian thực.

## 8. Nhật ký quyết định (Design Decisions Log)
- **2026-03-13:** Phân tách Persona & Writer để đạt đẳng cấp viết chuyên nghiệp.
- **2026-03-13:** Tích hợp Method Acting & Psychology để AI thoát khỏi cảm giác máy móc.
- **2026-03-13:** Thiết lập Project-Based DAM để quản trị tài sản Marketing bền vững.
- **2026-03-13:** Phân rã 12 Skill Core tại thư mục `skills/` để tối ưu "Thinking Budget".
