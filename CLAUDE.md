# Wallet Dashboard — Project rules

Kế thừa preference chung ở `~/.claude/CLAUDE.md` (100% JavaScript, code rõ ràng/hàm đơn giản). File này là chi tiết riêng cho project này.

## Mục tiêu
Web dashboard hiển thị dữ liệu giao dịch ví on-chain (ETH) gần-realtime: bảng dữ liệu + biểu đồ khối lượng giao dịch.

## Dữ liệu nguồn (backend/data/wallet_transactions.xlsx)
- Ví: `0x0d9e...d4ad` (địa chỉ đầy đủ nằm trong `backend/.env`, không commit lên git; đổi biến `WALLET_ADDRESS` ở đó nếu đổi ví)
- 100 dòng giao dịch, ~1 năm dữ liệu (2025-07-29 → 2026-07-02)
- Cột: Hash, Block, Time, From, To, ETH, GasUsed, GasPrice, Status
- 82 Gửi / 14 Nhận / 4 Nội bộ, 33 địa chỉ đối tác khác nhau
- Dữ liệu sales cũ (`Product-Sales-Region.xlsx`) vẫn còn trong `backend/data/` nhưng không còn dùng — có thể xóa nếu không cần nữa.

## MVP scope (đã chốt)
1. Line chart: khối lượng ETH theo tháng
2. Bar chart: top 5 địa chỉ giao dịch nhiều nhất (theo khối lượng ETH)
3. Bảng: giao dịch gần đây (phân trang, sort theo thời gian giảm dần, có cột "chiều": Gửi/Nhận/Nội bộ)
4. 3 stat card: tổng khối lượng ETH / tổng số giao dịch / tỷ lệ giao dịch thành công
- Chart dùng data đã aggregate ở backend (theo tháng/địa chỉ), không đẩy raw giao dịch ra frontend cho chart.

## Tech stack (đã chốt)
- Backend: Node.js + Express
- Đọc Excel: `xlsx` (SheetJS)
- Frontend: React + Vite + Recharts (chọn vì phổ biến, dễ tìm tài liệu, phù hợp người mới học frontend)
- Cập nhật dữ liệu: polling (fetch lại mỗi vài giây) — **giai đoạn 1**
- Google Sheets: `googleapis` — **giai đoạn 3** (thay Excel)
- WebSocket (`socket.io` hoặc `ws`): **giai đoạn 4** (thay polling)

## Nguyên tắc kiến trúc
- **Tổ chức code phân hóa theo chức năng** (feature-based), không gom chung một cục. Mỗi tính năng (data source, aggregation, table, chart, realtime transport...) nằm trong module/folder riêng, ranh giới rõ ràng qua interface/hàm export — mục tiêu là sau này đổi công nghệ (Excel→Sheets, polling→WebSocket, Recharts→lib khác, hoặc đổi domain dữ liệu như lần này) chỉ sửa đúng 1 module, không lan sang chỗ khác.
- Toàn bộ logic đọc dữ liệu nguồn phải nằm trong 1 module duy nhất: `backend/src/dataSource.js`, expose 1 hàm `getWalletTransactions()`.
  - Giai đoạn 1: đọc từ file Excel.
  - Giai đoạn 3: đổi bên trong hàm này sang gọi Google Sheets API — route/API/frontend không đổi.
- Logic tính toán/aggregate (theo tháng, theo địa chỉ, stat card) tách riêng trong `backend/src/aggregate.js`, không nhét vào route handler hay vào `dataSource.js`.
- Route API (`/api/wallet/*`) và frontend chỉ biết gọi các hàm của `dataSource.js` + `aggregate.js`, không quan tâm nguồn dữ liệu là gì.
- Frontend: mỗi chart/table/stat-card là 1 component riêng (`StatCards`, `VolumeLineChart`, `CounterpartyBarChart`, `TransactionsTable`), tự nhận data qua props — gọi API tách riêng ở `frontend/src/api/walletApi.js` + hook dùng chung `usePolling.js`.
- Khi chuyển sang WebSocket: giữ nguyên `dataSource.js` và `aggregate.js`, chỉ thêm cơ chế đẩy data qua socket thay vì response HTTP.
- Khi đổi domain dữ liệu (như từ sales → wallet): giữ nguyên toàn bộ layer/pattern, chỉ đổi tên hàm/route/component cho khớp domain mới (không giữ tên cũ gây hiểu nhầm).

## Chế độ học (khi mình muốn tự tay code)
- Khi mình nói kiểu "chỉ đưa code", "tao tự sửa", "dạy tao" — KHÔNG tự động Edit/Write vào file.
- Thay vào đó: đưa đoạn code cần thêm/sửa, nói rõ **file nào, đặt ở đâu trong file đó** (trước/sau dòng nào, trong hàm nào), và nếu có file liên quan khác cần đụng tới thì liệt kê rõ luôn.
- Đây là để tự gõ tay học logic, không phải vì code sai — nên giải thích ngắn gọn "vì sao" đoạn code đó hoạt động, không chỉ đưa code suông.
- Chế độ này không áp dụng cho việc sửa file rule/config (CLAUDE.md, .gitignore, package.json khi cài lib...) — những cái đó vẫn tự làm bình thường như trước.

## Roadmap
1. Excel + REST API + polling (đang làm)
2. Hoàn thiện UI: bảng + biểu đồ
3. Đổi Excel → Google Sheets (chỉ sửa `dataSource.js`)
4. Đổi polling → WebSocket
