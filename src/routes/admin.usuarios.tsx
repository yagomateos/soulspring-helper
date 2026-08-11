import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminGuard } from "@/components/mc/admin/AdminGuard";
import { AdminTable } from "@/components/mc/admin/AdminTable";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAllProfilesAdmin, type ProfileRow } from "@/lib/data/profile";
import { setPremiumStatus } from "@/routes/-admin.usuarios.functions";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios — Panel" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsuariosPage,
});

function AdminUsuariosPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Panel"
          title="Usuarios"
          description="Consulta las cuentas y su estado de suscripción. El cambio a Premium es manual mientras no haya pagos reales conectados — llegará vía Stripe más adelante."
        />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <AdminGuard>
          <AdminUsuariosManager />
        </AdminGuard>
      </div>
    </PageShell>
  );
}

function AdminUsuariosManager() {
  const queryClient = useQueryClient();
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: fetchAllProfilesAdmin,
  });

  const mutation = useMutation({
    mutationFn: (input: { userId: string; premium: boolean }) => setPremiumStatus({ data: input }),
    onSuccess: () => {
      toast.success("Estado actualizado");
      void queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    },
    onError: () =>
      toast.error("No se ha podido actualizar. ¿Está configurada SUPABASE_SERVICE_ROLE_KEY?"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <AdminTable
      items={profiles}
      columns={[
        { header: "Nombre", cell: (p: ProfileRow) => p.full_name ?? "—" },
        { header: "Email", cell: (p: ProfileRow) => p.email ?? "—" },
        {
          header: "Estado",
          cell: (p: ProfileRow) => (
            <Badge variant={p.subscription_status === "PREMIUM" ? "default" : "secondary"}>
              {p.subscription_status}
            </Badge>
          ),
        },
        {
          header: "Acción",
          cell: (p: ProfileRow) => (
            <Button
              size="sm"
              variant="soft"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ userId: p.id, premium: p.subscription_status !== "PREMIUM" })
              }
            >
              {p.subscription_status === "PREMIUM" ? "Quitar Premium" : "Marcar como Premium"}
            </Button>
          ),
        },
      ]}
    />
  );
}
