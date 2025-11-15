import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
