import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/mc/admin/AdminGuard";
import { AdminTable } from "@/components/mc/admin/AdminTable";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AREAS } from "@/lib/mc/areas";
import {
  fetchAllRecommendationsAdmin,
  setRecommendationActive,
  upsertRecommendation,
  type RecommendationInput,
  type RecommendationRow,
} from "@/lib/data/recommendations";

export const Route = createFileRoute("/admin/recomendaciones")({
  head: () => ({
    meta: [{ title: "Recomendaciones — Panel" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminRecomendacionesPage,
});

const TRIAGE_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const EMPTY: RecommendationInput = {
  area: AREAS[0]!.id,
  triage: null,
  text: "",
  is_active: true,
};

function AdminRecomendacionesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Panel"
          title="Recomendaciones"
          description="Textos que acompañan los resultados del cuestionario."
        />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <AdminGuard>
          <AdminRecomendacionesManager />
        </AdminGuard>
      </div>
    </PageShell>
  );
}

function AdminRecomendacionesManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RecommendationRow | null | "new">(null);
  const [form, setForm] = useState<RecommendationInput>(EMPTY);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-recommendations"],
    queryFn: fetchAllRecommendationsAdmin,
  });

  const openCreate = () => {
    setForm(EMPTY);
    setEditing("new");
  };

  const openEdit = (item: RecommendationRow) => {
    setForm({ area: item.area, triage: item.triage, text: item.text, is_active: item.is_active });
    setEditing(item);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertRecommendation(form, editing !== "new" && editing ? editing.id : undefined),
    onSuccess: () => {
      toast.success("Recomendación guardada");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-recommendations"] });
    },
    onError: () => toast.error("No se ha podido guardar."),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: RecommendationRow) => setRecommendationActive(item.id, !item.is_active),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-recommendations"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Crear recomendación</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <AdminTable
          items={items}
          isActive={(i) => i.is_active}
          onToggleActive={(i) => toggleMutation.mutate(i)}
          onEdit={(i) => openEdit(i)}
          columns={[
            { header: "Área", cell: (i) => AREAS.find((a) => a.id === i.area)?.name ?? i.area },
            { header: "Nivel", cell: (i) => i.triage ?? "—" },
            {
              header: "Texto",
              cell: (i) => <span className="line-clamp-1 max-w-xs">{i.text}</span>,
            },
            { header: "Estado", cell: (i) => (i.is_active ? "Activo" : "Inactivo") },
          ]}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing === "new" ? "Nueva recomendación" : "Editar recomendación"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Área</Label>
                <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nivel (opcional)</Label>
                <Select
                  value={form.triage ?? "none"}
                  onValueChange={(v) => setForm({ ...form, triage: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Cualquiera</SelectItem>
                    {TRIAGE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Texto</Label>
              <Textarea
                rows={4}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label>Activo</Label>
            </div>
            <Button
              className="w-full"
              disabled={!form.text || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
