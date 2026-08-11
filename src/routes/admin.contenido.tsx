import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/mc/admin/AdminGuard";
import { AdminTable } from "@/components/mc/admin/AdminTable";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import {
  fetchAllContentAdmin,
  fetchContentBody,
  fetchContentCategories,
  setContentActive,
  upsertContent,
  type ContentInput,
  type ContentItem,
} from "@/lib/data/content";

export const Route = createFileRoute("/admin/contenido")({
  head: () => ({ meta: [{ title: "Contenidos — Panel" }, { name: "robots", content: "noindex" }] }),
  component: AdminContenidoPage,
});

const EMPTY: ContentInput = {
  slug: "",
  title: "",
  description: "",
  category_id: null,
  duration_minutes: null,
  access_level: "FREE",
  is_active: true,
  body: "",
};

function AdminContenidoPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Panel"
          title="Contenidos"
          description="Biblioteca gratuita y Premium."
        />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <AdminGuard>
          <AdminContenidoManager />
        </AdminGuard>
      </div>
    </PageShell>
  );
}

function AdminContenidoManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ContentItem | null | "new">(null);
  const [form, setForm] = useState<ContentInput>(EMPTY);

  const { data: categories = [] } = useQuery({
    queryKey: ["content-categories"],
    queryFn: fetchContentCategories,
  });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: fetchAllContentAdmin,
  });

  const openCreate = () => {
    setForm(EMPTY);
    setEditing("new");
  };

  const openEdit = async (item: ContentItem) => {
    const body = (await fetchContentBody(item.id)) ?? "";
    setForm({
      slug: item.slug,
      title: item.title,
      description: item.description,
      category_id: item.category_id,
      duration_minutes: item.duration_minutes,
      access_level: item.access_level as "FREE" | "PREMIUM",
      is_active: item.is_active,
      body,
    });
    setEditing(item);
  };

  const saveMutation = useMutation({
    mutationFn: () => upsertContent(form, editing !== "new" && editing ? editing.id : undefined),
    onSuccess: () => {
      toast.success("Contenido guardado");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      void queryClient.invalidateQueries({ queryKey: ["content-list"] });
    },
    onError: () => toast.error("No se ha podido guardar."),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: ContentItem) => setContentActive(item.id, !item.is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      void queryClient.invalidateQueries({ queryKey: ["content-list"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Crear contenido</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <AdminTable
          items={items}
          isActive={(i) => i.is_active}
          onToggleActive={(i) => toggleMutation.mutate(i)}
          onEdit={(i) => void openEdit(i)}
          columns={[
            { header: "Título", cell: (i) => i.title },
            {
              header: "Nivel",
              cell: (i) => (
                <Badge variant={i.access_level === "PREMIUM" ? "default" : "secondary"}>
                  {i.access_level}
                </Badge>
              ),
            },
            { header: "Estado", cell: (i) => (i.is_active ? "Activo" : "Inactivo") },
          ]}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing === "new" ? "Nuevo contenido" : "Editar contenido"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="mi-contenido"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.category_id ?? "none"}
                onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration_minutes: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nivel de acceso</Label>
                <Select
                  value={form.access_level}
                  onValueChange={(v) => setForm({ ...form, access_level: v as "FREE" | "PREMIUM" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contenido</Label>
              <Textarea
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
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
              disabled={!form.title || !form.slug || saveMutation.isPending}
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
