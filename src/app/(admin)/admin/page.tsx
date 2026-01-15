import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminPageContent } from "./admin-content";

// Force dynamic rendering - admin pages need auth context
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
