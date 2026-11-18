import { NavLink, Outlet } from "react-router-dom";
import { Home, Settings2, Info, Moon, Sun } from "lucide-react";
import StarMark from "../StarMark";
import { useTheme } from "../ThemeProvider";
import { APP_NAME } from "../../lib/app";

const items = [
  { title: "Hôm nay", url: "/", icon: Home },
  { title: "Cài đặt", url: "/cai-dat", icon: Settings2 },
  { title: "Giới thiệu", url: "/gioi-thieu", icon: Info },
];

/**
 * The shell: a quiet rail on the left, the page on the right.
 *
 * Nothing in the rail carries colour. The product's one rich moment lives on the screen
 * the user opens, not in the navigation that surrounds it.
 */
export default function Layout() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="flex h-full w-full bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-border px-3 py-5">
        <div>
          <div className="mb-7 flex items-center gap-2.5 px-2">
            <StarMark size={20} className="text-moment" />
            <span className="text-[13px] font-medium leading-tight text-foreground">
              {APP_NAME}
            </span>
          </div>

          <nav className="flex flex-col gap-0.5">
            {items.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === "/"}
                className={({ isActive }) =>
                  [
                    "flex h-9 items-center gap-2.5 rounded-lg px-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  ].join(" ")
                }
              >
                <item.icon size={16} strokeWidth={1.5} className="shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex h-9 items-center gap-2.5 rounded-lg px-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          {isDark ? (
            <Sun size={16} strokeWidth={1.5} />
          ) : (
            <Moon size={16} strokeWidth={1.5} />
          )}
          <span>{isDark ? "Nền sáng" : "Nền tối"}</span>
        </button>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-7">
        <Outlet />
      </main>
    </div>
  );
}
