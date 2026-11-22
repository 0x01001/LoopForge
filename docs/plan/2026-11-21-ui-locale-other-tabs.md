# Các tab còn tiếng Trung

Ngày: 2026-11-21

Tiếp `docs/plan/2026-11-21-ui-locale-en-vi.md`. Bước iframe đã xong (`chatbot/src/ui-locale.js` tải cùng `web/i18n.js`). Việc còn lại là chữ trên các tab khác Cấu hình cá nhân, và phần tiếng Việt còn thiếu trên chrome đã có tiếng Anh.

## Ràng buộc

Giữ nguyên ràng buộc của plan trước. Chỉ đổi chữ người dùng thấy. Không thêm catalog mới. Không gỡ văn i18n UI tiếng Trung.

Được sửa: chuỗi hiển thị, từ điển `zh -> en` trong `web/i18n-en.js`, khóa `zh -> vi` trong `web/i18n-vi.js`, pattern ghép sẵn trong `web/i18n.js`, và việc hiện lên duỗi. Không thêm catalog mới.

Cấm sửa: handler, repo, SQL, migration, prompt SOP/vai trò, tool schema, nhánh, validation, auth, routing. Lỗi API trong Go giữ nguyên. Chuỗi API chèn vào DOM thì chỉ thêm khóa, không sửa nguồn.

Hai ngoại lệ hiển thị, không phải đổi hành vi:

- `web/bot-bind.html` và `web/gongfeng-oauth-done.html` không tải `i18n.js`. Trang login đã tải (`web/login.html:13-15`). Hai trang này phải làm cùng cách, rồi `localStorage['loopforge.lang']` mới đổi được khóa.
- Nhãn ECharts trong `web/app/obs-charts.js` phải đi qua `lfT`. Muser:ok, bat dau fix theo plan do `D:/project/tool/loop-forge/docs/plan/2026-11-21-ui-locale-other-tabs.md`.

## Cách làm

`web/i18n.js` duyệt text node và một số attribute, thay bằng `web/i18n-en.js` (khóa `zh -> en`) và `web/i18n-vi.js` (khóa `zh -> vi`). Khóa lưu ở `localStorage['loopforge.lang']`. `lfT(zh, en)` chỉ là lối tắt cho chuỗi ghép động. `lfSetLang` hiện coi mọi giá trị khác `en` là `zh` đã được sửa ở plan trước.

Rà soát chạy overlay trên HTML tĩnh (`web/index.html`) rồi đếm chữ Hán còn lại theo từng `section.view`. Số liệu đo ngày 2026-11-21, sau từ điển hiện có:

| Bề mặt | EN còn | VI còn | Nguồn chữ |
|---|---:|---:|---|
| `bootLoader`, `<title>` | 1 | 1 | `web/index.html` |
| `collaborationView` | 1 | 1 | `web/index.html` |
| `settingsView` | 7 | 11 | panel tĩnh + `web/app.js` credential |
| `platformView` | 0 | 7 | chỉ thiếu VI |
| `dashboardView` | 1 | 7 | `web/index.html` |
| `aiSchedulesView` | 17 | 33 | HTML + `web/app/sync-schedule.js` |
| `issuesView` | 11 | 48 | HTML + `web/app/issues.js` |
| `botsView` | 0 | 6 | chỉ thiếu VI |
| `assistantView` | 0 | 15 | chỉ thiếu VI |
| `runsView` | 6 | 41 | HTML + `web/app/runs.js` |
| `approvalsView` | 0 | 4 | chỉ thiếu VI |
| `sopsView` | 0 | 22 | chỉ thiếu VI |
| `flowView` | 11 | 49 | HTML + `web/app/flows.js` |
| `agentsView` | 0 | 18 | chỉ thiếu VI |
| `observabilityView` | 2 | 31 | HTML + `web/app/observability.js` + nhãn ECharts |
| `projectsView` | 5 | 39 | HTML + `web/app/projects.js` |
| `mcpView` | 1 | 12 | HTML + `web/app/mcp.js` |
| `assetsView` | 6 | 28 | HTML + `web/app/assets.js` |
| `runnersView` | 6 | 15 | HTML + `web/app/runners.js` |
| `guideView` | 0 | 1 | chỉ thiếu VI |
| dialog ngoài section | 4 | 22 | HTML + `web/app.js` |
| splash / bind / Gongfeng | 3+24+5 | 3+24+5 | `login.html` đã có khóa; hai trang kia chưa tải overlay |

Tổng HTML tĩnh sau overlay: 169 chuỗi thiếu EN, 533 chuỗi thiếu VI. 364 chuỗi VI-only đã có EN trong từ điển, chỉ thiếu bản Việt.

Ba loại, không trộn:

1. Chrome tĩnh trong `web/index.html` và hai trang độc lập. Thêm khóa. Không đụng markup.
2. Chữ JS ghép lúc render (`credentialPanelHTML`, nhãn ECharts, toast). Thêm khóa hoặc `lfT` tại chỗ ghép. Không dịch mảnh tự do nếu `i18n.js` đã có pattern.
3. Cố ý bỏ qua, không thêm khóa: `data-i18n-skip`, `script`, `style`, `textarea`, `code`, `pre`, Monaco, xterm, log, markdown, `contenteditable`.

## Thứ tự

1. Gắn `/boot.js`, `/i18n-en.js`, `/i18n-vi.js`, `/i18n.js` vào `bot-bind.html` và `gongfeng-oauth-done.html`, cùng thứ tự `login.html`.
2. Lấp khóa EN và VI cho splash, `<title>`, và chrome tĩnh từng `section.view`. Test `leftoverChinese` trên DOM đã render, một assertion theo view, cả EN và VI.
3. Lấp chữ JS theo file trong bảng, bắt đầu `sync-schedule.js`, `issues.js`, `flows.js`. Mỗi file một lần chạy test view của nó.
4. `obs-charts.js`: nhãn trục và legend đi qua `lfT`. Không thêm thư viện.
5. Chạy lại đếm chữ Hán. Còn sót thì là chuỗi API hoặc catalog, ghi vào mục bỏ qua, không sửa Go.

## Xong khi

- EN và VI: `leftoverChinese` rỗng trên chrome của mỗi mục trong `viewTitles`, kể cả sub-tab và iframe chatbot.
- Splash `正在进入工作台…` và `<title>` không còn chữ Hán ở EN/VI.
- `bot-bind.html` và `gongfeng-oauth-done.html` đọc cùng khóa ngôn ngữ.
- Diff không đụng file ngoài UI và lớp dịch UI, trừ nhãn ECharts và hai thẻ script trang độc lập.
- Test đi đỏ khi một tab thêm chữ Trung mà không có khóa.
