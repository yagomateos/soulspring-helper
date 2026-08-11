import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/mc/admin/AdminGuard";
import { AdminTable } from "@/components/mc/admin/AdminTable";
import { PageHeading, PageShell } from "@/components/mc/PageShell";
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
  fetchAllExercisesAdmin,
  setExerciseActive,
  upsertExercise,
  type ExerciseInput,
  type ExerciseRow,
} from "@/lib/data/exercises";
import { AREAS } from "@/lib/mc/areas";
import { CATEGORY_LABELS } from "@/lib/mc/exercises";

export const Route = createFileRoute("/admin/ejercicios")({
  head: () => ({ meta: [{ title: "Ejercicios — Panel" }, { name: "robots", content: "noindex" }] }),
  component: AdminEjerciciosPage,
});

const CATEGORIES = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[];

const EMPTY: ExerciseInput = {
  slug: "",
  title: "",
  category: CATEGORIES[0]!,
  minutes: 5,
  description: "",
  instructions: [],
  areas: [],
  is_active: true,
};

function AdminEjerciciosPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-12">
        <PageHeading
          eyebrow="Panel"
          title="Ejercicios"
          description="Prácticas de la biblioteca de ejercicios."
        />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Panel
        </Link>
        <AdminGuard>
          <AdminEjerciciosManager />
        </AdminGuard>
      </div>
    </PageShell>
  );
}

function AdminEjerciciosManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ExerciseRow | null | "new">(null);
  const [form, setForm] = useState<ExerciseInput>(EMPTY);
  const [instructionsText, setInstructionsText] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-exercises"],
    queryFn: fetchAllExercisesAdmin,
  });

  const openCreate = () => {
    setForm(EMPTY);
    setInstructionsText("");
    setEditing("new");
  };

  const openEdit = (item: ExerciseRow) => {
    const instructions = Array.isArray(item.instructions) ? (item.instructions as string[]) : [];
    setForm({
      slug: item.slug,
      title: item.title,
      category: item.category,
      minutes: item.minutes,
      description: item.description,
      instructions,
      areas: Array.isArray(item.areas) ? (item.areas as string[]) : [],
      is_active: item.is_active,
    });
    setInstructionsText(instructions.join("\n"));
    setEditing(item);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertExercise(
        {
          ...form,
          instructions: instructionsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        },
        editing !== "new" && editing ? editing.id : undefined,
      ),
    onSuccess: () => {
      toast.success("Ejercicio guardado");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-exercises"] });
    },
    onError: () => toast.error("No se ha podido guardar."),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: ExerciseRow) => setExerciseActive(item.id, !item.is_active),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-exercises"] }),
  });

  const toggleArea = (area: string) => {
    setForm((f) => ({
      ...f,
      areas: f.areas.includes(area) ? f.areas.filter((a) => a !== area) : [...f.areas, area],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Crear ejercicio</Button>
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
              header: "Categoría",
              cell: (i) =>
                CATEGORY_LABELS[i.category as keyof typeof CATEGORY_LABELS] ?? i.category,
            },
            { header: "Minutos", cell: (i) => i.minutes },
            { header: "Estado", cell: (i) => (i.is_active ? "Activo" : "Inactivo") },
          ]}
        />
      )}

      <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing === "new" ? "Nuevo ejercicio" : "Editar ejercicio"}
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
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="mi-ejercicio"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Minutos</Label>
                <Input
                  type="number"
                  value={form.minutes}
                  onChange={(e) => setForm({ ...form, minutes: Number(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Áreas</Label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleArea(a.id)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      form.areas.includes(a.id)
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Instrucciones (una por línea)</Label>
              <Textarea
                rows={5}
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
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
