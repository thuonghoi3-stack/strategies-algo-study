import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl text-fg">Không tìm thấy</h1>
      <p className="mt-3 text-sm text-muted">
        Mục này không có trong thư viện. Quay lại danh sách thuật toán.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Về trang chủ</Link>
      </Button>
    </main>
  );
}
