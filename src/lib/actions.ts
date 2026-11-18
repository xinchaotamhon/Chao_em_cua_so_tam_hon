/**
 * What the break screen asks the person to do.
 *
 * Written here rather than imported: the 20-20-20 rule is the one part with evidence behind it,
 * and a list we own can be corrected in one file when that changes. Each entry says what to do
 * and nothing about what it will do to your eyesight - none of these is a treatment, and an app
 * that claimed otherwise would be lying to the person it serves.
 */
export interface BreakAction {
  id: string;
  /** Two or three words, shown small above the instruction. */
  title: string;
  /** One sentence, shown large. */
  line: string;
}

export const BREAK_ACTIONS: BreakAction[] = [
  {
    id: "nhin-xa",
    title: "Nhìn ra xa",
    line: "Tìm một vật cách xa ít nhất 6 mét và nhìn vào nó cho tới khi hết giờ.",
  },
  {
    id: "chop-mat",
    title: "Chớp mắt chậm",
    line: "Nhắm mắt lại, chớp chậm mười lần. Nhìn màn hình, ta chớp mắt ít đi khoảng một nửa.",
  },
  {
    id: "gan-xa",
    title: "Nhìn gần, rồi nhìn xa",
    line: "Đưa một ngón tay cách mắt khoảng một gang, nhìn nó, rồi nhìn ra xa. Đổi qua lại năm lần.",
  },
  {
    id: "thu-gian",
    title: "Thả lỏng vai và cổ",
    line: "Ngồi thẳng lưng, thả hai vai xuống, xoay tròn chậm năm lần về phía sau.",
  },
  {
    id: "dung-day",
    title: "Đứng lên",
    line: "Đứng dậy và bước vài bước. Ngồi liền một chỗ lâu làm cứng lưng và cổ.",
  },
];

/** Which action belongs to the n-th break of the day, counting from 1. */
export function actionForBreak(n: number): BreakAction {
  const index = (Math.max(1, Math.trunc(n)) - 1) % BREAK_ACTIONS.length;
  return BREAK_ACTIONS[index];
}
