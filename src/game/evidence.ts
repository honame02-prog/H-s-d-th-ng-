/**
 * Nội dung hồ sơ cho các vật chứng đã nối vào gameplay. Map có thêm clue `mirror`
 * nhưng lát cắt đầu chỉ bật một vật chứng; clue không có mục ở đây sẽ không tương tác được.
 */
export interface EvidenceEntry {
  clueId: string;
  title: string;
  photo: string; // đường dẫn trong public/di-thuong/
  location: string;
  notes: string[];
  /** Mở hồ sơ này có đánh thức thực thể không. */
  awakens?: 'ghost_elder';
}

export const EVIDENCE: Record<string, EvidenceEntry> = {
  footprints: {
    clueId: 'footprints',
    title: 'Dấu chân ướt trước cửa',
    photo: 'assets/evidence/door_footprints.png',
    location: 'Hành lang tầng 3, phía đông',
    notes: [
      'Vệt chân trần còn ướt dẫn từ cuối hành lang và dừng ngay trước một cánh cửa.',
      'Không có dấu quay lại. Sàn khô ở hai bên.',
      'Hàng xóm báo nghe tiếng gõ cửa lúc nửa đêm, nhưng không ai thấy người.',
    ],
    awakens: 'ghost_elder',
  },
};
