# Design Document: @rune/content-mind (L4 Pack)

> **Version:** 1.1.0 | **Status:** Implemented (Gold Master)
> **Objective:** Xây dựng một AI Content Agent có bản thể (Sentience), trí tuệ Marketing chiến lược (CMO Mindset), bộ nhớ phân tầng và kỹ thuật chấp bút chuyên nghiệp bậc cao.

## 1. Trạng thái Triển khai (Implementation Status)
Toàn bộ hệ thống đã được triển khai vào cấu trúc cốt lõi của Rune:
- [x] **Core Skills:** 12 kỹ năng chuyên sâu đã được tạo tại `skills/`.
- [x] **Agent Identity:** Vai trò Agent chiến lược định nghĩa tại `agents/content-mind.md`.
- [x] **Slash Commands:** Hệ thống lệnh điều khiển tại `commands/content-mind.md`.
- [x] **The Forge Assets:** Hạ tầng và tài nguyên mẫu tại `extensions/content-mind/`.

## 2. Kiến trúc Phân tầng (Dual-Level Mesh)

Hệ thống bao gồm 12 skill chuyên biệt nằm trong thư mục `skills/`, được điều phối bởi Hệ điều hành Chiến lược.

### Tầng 0: Strategic Orchestrator (Điều phối & Quản trị)
1. **`marketing-orchestrator`**: CMO & Project Manager. Quản trị dự án Marketing theo mô hình `[YYYY-MM]-[slug]`.

### Tầng 1: The Forge (Phân xưởng Chế tác - Builder Level)
2. **`persona-forger`**: "Đúc" bản thể và hồ sơ tâm lý từ dữ liệu thực tế.
3. **`style-distiller`**: "Chưng cất" DNA phong cách từ mẫu nội dung.
4. **`mechanism-designer`**: Thiết kế khung xương logic bài viết.
5. **`content-scout`**: Săn tìm nguyên liệu thực tế từ Internet/Mã nguồn.

### Tầng 2: The Studio (Phòng thu thực thi - Executive Level)
6. **`persona-sentience`**: Kích hoạt Method Acting & Độc thoại nội tâm.
7. **`psych-linguistic-engine`**: Thấu cảm và điều chỉnh ngôn ngữ theo độc giả.
8. **`writing-architect`**: Tư vấn phối hợp Style + Mechanism tối ưu.
9. **`authentic-human-filter`**: Bộ lọc bản sắc thực, loại bỏ mùi AI.
10. **`master-writer`**: Chấp bút thực thi chuyên nghiệp (Pacing, Hooks, CTA).
11. **`the-skeptic-editor`**: Biên tập viên hoài nghi (Red Team).
12. **`proactive-ideator`**: Gợi ý chủ động chủ đề nội dung.

## 3. Quản trị Tài sản số & Trí nhớ (DAM & Memory)

### 3.1. Project-Based DAM
Mọi dự án được đóng gói trong thư mục: `marketing-hub/projects/[YYYY-MM]-[slug]/`
- `project-strategy.md`: Chiến lược mẫu (Mục tiêu, KPI, Guardrails).
- `project-roadmap.md`: Lộ trình bài viết và trạng thái tài sản.
- `/content/`: Lưu trữ Output theo kênh (Blog, Social, PR).
- `/assets/`: Ảnh, Banners, Prompt logs.
- `/personas-local/`: Snapshot bản thể riêng của dự án.

### 3.2. Tiered Memory Mesh
- **Short-term (`rune:session-bridge`)**: Nhớ trạng thái bản nháp và phản hồi trong phiên.
- **Long-term (`rune:neural-memory`)**: Nhớ Snapshot bản thể vĩnh viễn và tri thức tiến hóa.

## 4. Danh sách các file đã khởi tạo (File Registry)

### Skills Core (`skills/`)
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

### Identity & Commands
- `agents/content-mind.md`
- `commands/content-mind.md`

### Forge Resources (`extensions/content-mind/`)
- `personas/thanh-nguyen.json`
- `styles/the-stoic.json`
- `mechanisms/pas.json`

## 5. Nhật ký quyết định thiết kế (Design Decisions Log)

| Ngày | Quyết định | Lý do |
|---|---|---|
| 2026-03-13 | Hệ 12 Skill chuyên biệt tại `skills/` | Tối ưu hóa chiều sâu tư duy cho từng khâu sản xuất. |
| 2026-03-13 | Phân tách Persona & Writer | Để bài viết có "hồn" nhân vật và "kỹ thuật" chuyên gia. |
| 2026-03-13 | Tầng Strategic Orchestrator | Agent có tư duy CMO, biết phản biện thay vì chỉ nhận lệnh. |
| 2026-03-13 | Cấu trúc DAM [YYYY-MM]-[slug] | Đảm bảo tính ngăn nắp và quản trị tài nguyên chuyên nghiệp. |
