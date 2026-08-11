import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
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
import { fetchAllContentAdmin, fetchContentCategories } from "@/lib/data/content";
import { fetchAllExercisesAdmin } from "@/lib/data/exercises";
import {
  createSession,
  deleteSession,
  fetchAllProgramSessionsAdmin,
  fetchAllProgramsAdmin,
  setProgramActive,
  upsertProgram,
  type Program,
  type ProgramInput,
} from "@/lib/data/programs";

export const Route = createFileRoute("/admin/programas")({
  head: () => ({ meta: [{ title: "Programas — Panel" }, { name: "robots", content: "noindex" }] }),
  component: AdminProgramasPage,
});

const EMPTY: ProgramInput = {
  slug: "",
  title: "",
  description: "",
  category_id: null,
  duration_label: "",
  access_level: "PREMIUM",
  is_active: true,
};

function AdminProgramasPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Panel"
          title="Programas"
          description="Recorridos guiados con sesiones ordenadas."
        />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <AdminGuard>
          <AdminProgramasManager />
        </AdminGuard>
      </div>
    </PageShell>
  );
}

function AdminProgramasManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Program | null | "new">(null);
  const [form, setForm] = useState<ProgramInput>(EMPTY);
  const [sessionsFor, setSessionsFor] = useState<Program | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["content-categories"],
    queryFn: fetchContentCategories,
  });
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: fetchAllProgramsAdmin,
  });

  const openCreate = () => {
    setForm(EMPTY);
    setEditing("new");
  };

  const openEdit = (item: Program) => {
    setForm({
      slug: item.slug,
      title: item.title,
      description: item.description,
      category_id: item.category_id,
      duration_label: item.duration_label,
      access_level: item.access_level as "FREE" | "PREMIUM",
      is_active: item.is_active,
    });
    setEditing(item);
  };

  const saveMutation = useMutation({
    mutationFn: () => upsertProgram(form, editing !== "new" && editing ? editing.id : undefined),
    onSuccess: () => {
      toast.success("Programa guardado");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      void queryClient.invalidateQueries({ queryKey: ["programs-list"] });
    },
    onError: () => toast.error("No se ha podido guardar."),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: Program) => setProgramActive(item.id, !item.is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      void queryClient.invalidateQueries({ queryKey: ["programs-list"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Crear programa</Button>
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
            {
              header: "Sesiones",
              cell: (i) => (
                <Button size="sm" variant="ghost" onClick={() => setSessionsFor(i)}>
                  Gestionar
                </Button>
              ),
            },
          ]}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing === "new" ? "Nuevo programa" : "Editar programa"}
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
                placeholder="mi-programa"
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
                <Label>Duración (texto libre)</Label>
                <Input
                  value={form.duration_label ?? ""}
                  onChange={(e) => setForm({ ...form, duration_label: e.target.value })}
                  placeholder="3 sesiones"
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

      {sessionsFor ? (
        <SessionsDialog program={sessionsFor} onClose={() => setSessionsFor(null)} />
      ) : null}
    </div>
  );
}

function SessionsDialog({ program, onClose }: { program: Program; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [contentId, setContentId] = useState<string>("none");
  const [exerciseId, setExerciseId] = useState<string>("none");

  const { data: sessions = [] } = useQuery({
    queryKey: ["admin-program-sessions", program.id],
    queryFn: () => fetchAllProgramSessionsAdmin(program.id),
  });
  const { data: contentOptions = [] } = useQuery({
    queryKey: ["admin-content"],
    queryFn: fetchAllContentAdmin,
  });
  const { data: exerciseOptions = [] } = useQuery({
    queryKey: ["admin-exercises"],
    queryFn: fetchAllExercisesAdmin,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-program-sessions", program.id] });
    void queryClient.invalidateQueries({ queryKey: ["program-sessions", program.id] });
  };

  const addMutation = useMutation({
    mutationFn: () =>
      createSession({
        program_id: program.id,
        sort_order: sessions.length + 1,
        title,
        content_id: contentId === "none" ? null : contentId,
        exercise_id: exerciseId === "none" ? null : exerciseId,
      }),
    onSuccess: () => {
      setTitle("");
      setContentId("none");
      setExerciseId("none");
      invalidate();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: invalidate,
  });

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Sesiones — {program.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ol className="space-y-2">
            {sessions.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm"
              >
                <span>
                  {i + 1}. {s.title}
                  {s.content ? ` · 📄 ${s.content.title}` : ""}
                  {s.exercise ? ` · 🧘 ${s.exercise.title}` : ""}
                </span>
                <button
                  onClick={() => removeMutation.mutate(s.id)}
                  aria-label="Eliminar sesión"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin sesiones todavía.</p>
            ) : null}
          </ol>

          <div className="space-y-2 rounded-2xl border border-dashed border-border p-3">
            <Input
              placeholder="Título de la sesión"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select value={contentId} onValueChange={setContentId}>
              <SelectTrigger>
                <SelectValue placeholder="Contenido (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin contenido</SelectItem>
                {contentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={exerciseId} onValueChange={setExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder="Ejercicio (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin ejercicio</SelectItem>
                {exerciseOptions.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              disabled={!title || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              Añadir sesión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
