import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-2xl text-fg">Meridian</p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Thư viện thuật toán giao dịch — xu hướng, đường cong, điểm đảo chiều.
            Nội dung mang tính giáo dục, không phải lời khuyên đầu tư.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link to="/algorithms" className="hover:text-fg">
            Thư viện
          </Link>
          <Link to="/strategies" className="hover:text-fg">
            Chiến thuật
          </Link>
          <Link to="/lab" className="hover:text-fg">
            Lab
          </Link>
        </div>
      </div>
    </footer>
  );
}
