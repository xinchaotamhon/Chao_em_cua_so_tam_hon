import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
import { ExternalLink } from "lucide-react";
import StarMark from "../StarMark";
import { APP_NAME, RELEASES_URL, REPO_URL, UPSTREAM_URL } from "../../lib/app";

const credits = [
  {
    what: "blink-eye",
    by: "nomandhoni-cs",
    licence: "MIT",
    why: "Bản gốc mà app này fork ra.",
    url: UPSTREAM_URL,
  },
  {
    what: "unslop",
    by: "Damir Sokolovsky",
    licence: "CC BY 4.0",
    why: "Phương pháp rà giao diện mà bản này làm theo.",
    url: "https://heydamir.design/unslop",
  },
  {
    what: "Be Vietnam Pro",
    by: "Nguyễn Thị Bảo Trân",
    licence: "OFL 1.1",
    why: "Bộ chữ vẽ riêng cho tiếng Việt.",
    url: "https://github.com/bettergui/BeVietnamPro",
  },
];

export default function About() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    void getVersion().then(setVersion);
  }, []);

  return (
    <div className="mx-auto max-w-[620px] pb-10">
      <div className="flex items-center gap-3">
        <StarMark size={28} className="text-moment" />
        <div>
          <h1 className="text-[15px] font-medium text-foreground">{APP_NAME}</h1>
          <p className="text-[12px] text-muted-foreground">
            {version ? `Phiên bản ${version}` : "Đang đọc phiên bản…"}
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-[52ch] text-[13px] leading-relaxed text-muted-foreground">
        Nhắc bạn rời mắt khỏi màn hình theo quy tắc 20-20-20: cứ 20 phút, nhìn ra xa 6 mét
        trong 20 giây. Chạy dưới khay hệ thống, phủ kín màn hình khi tới giờ nghỉ, và không
        gửi gì ra ngoài máy bạn.
      </p>

      <section className="mt-7 border-t border-border pt-5">
        <h2 className="text-[13px] font-medium text-foreground">Cập nhật</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Bản mới được đăng ở trang tải. Nút này chỉ mở trang đó trong trình duyệt — app
          không tự tải và không tự chạy gì.
        </p>
        <button
          type="button"
          onClick={() => void open(RELEASES_URL)}
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink size={15} strokeWidth={1.5} />
          Kiểm tra bản mới
        </button>
      </section>

      <section className="mt-7 border-t border-border pt-5">
        <h2 className="text-[13px] font-medium text-foreground">Mã nguồn</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Giấy phép MIT, nên mã nguồn mở và ai cũng đọc được.
        </p>
        <button
          type="button"
          onClick={() => void open(REPO_URL)}
          className="mt-2 text-[12px] text-primary transition-colors hover:underline"
        >
          {REPO_URL.replace("https://", "")}
        </button>
      </section>

      <section className="mt-7 border-t border-border pt-5">
        <h2 className="text-[13px] font-medium text-foreground">Ghi công</h2>
        <dl className="mt-3 space-y-3">
          {credits.map((c) => (
            <div key={c.what}>
              <dt className="text-[12px] font-medium text-foreground">
                {c.what}{" "}
                <span className="font-normal text-muted-foreground">
                  · {c.by} · {c.licence}
                </span>
              </dt>
              <dd className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                {c.why}{" "}
                <button
                  type="button"
                  onClick={() => void open(c.url)}
                  className="text-primary transition-colors hover:underline"
                >
                  nguồn
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
