"use client";

import { useEditor } from "./editor-context";
import { getNodeFields, kindLabel } from "@/packages/types";
import { z } from "zod";
import { useState } from "react";

export function PropertyPanel() {
  const { selectedNode, updateNodeProps, removeNode } = useEditor();

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
        <p className="text-3xl">👈</p>
        <p className="mt-2 text-sm font-medium text-zinc-500">Selecione um elemento</p>
        <p className="mt-1 text-xs text-zinc-400">
          Clique em qualquer item no canvas para editar suas propriedades
        </p>
      </div>
    );
  }

  const fields = getNodeFields(selectedNode.kind);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Propriedades</p>
          <p className="mt-0.5 font-semibold text-zinc-800">
            {kindLabel[selectedNode.kind] ?? selectedNode.kind}
          </p>
        </div>
        <button
          onClick={() => removeNode(selectedNode.id)}
          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
        >
          Remover
        </button>
      </div>

      {/* Form — gerado automaticamente do schema Zod */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        {fields.map(({ name, schema }) => (
          <FieldInput
            key={name}
            fieldName={name}
            schema={schema}
            value={selectedNode.props[name]}
            onChange={(value) =>
              updateNodeProps(selectedNode.id, { [name]: value })
            }
          />
        ))}

        <CustomPropsEditor
          custom={selectedNode.props.custom as Record<string, unknown> | undefined}
          onChange={(custom) =>
            updateNodeProps(selectedNode.id, { custom })
          }
        />
      </form>
    </div>
  );
}

// ─── Field input generator ───────────────────────────────────

function FieldInput({
  fieldName,
  schema,
  value,
  onChange,
}: {
  fieldName: string;
  schema: z.ZodTypeAny;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (isEnum(schema)) {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-600">{fieldName}</span>
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
        >
          {getEnumValues(schema).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
    );
  }

  if (isBoolean(schema)) {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
        />
        <span className="text-sm text-zinc-700">{fieldName}</span>
      </label>
    );
  }

  const lower = fieldName.toLowerCase();

  if (lower.includes("src") || lower.includes("href") || lower.includes("url") || lower.includes("image")) {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-600">{fieldName}</span>
        <input
          type="url"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
        />
      </label>
    );
  }

  if (lower.includes("width") || lower.includes("height") || lower.includes("size") || lower.includes("count") || lower.includes("index")) {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-600">{fieldName}</span>
        <input
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
        />
      </label>
    );
  }

  if (isString(schema)) {
    const isLongText = fieldName === "text" || fieldName === "description" || fieldName === "title";
    return (
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-600">{fieldName}</span>
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={isLongText ? 3 : 2}
          className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
        />
      </label>
    );
  }

  if (isNumber(schema)) {
    return (
      <label className="block space-y-1">
        <span className="text-xs font-medium text-zinc-600">{fieldName}</span>
        <input
          type="number"
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
        />
      </label>
    );
  }

  // Fallback
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-600">{fieldName}</span>
      <input
        type="text"
        value={JSON.stringify(value ?? "")}
        onChange={(e) => {
          try { onChange(JSON.parse(e.target.value)); }
          catch { onChange(e.target.value); }
        }}
        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 font-mono text-xs"
      />
    </label>
  );
}

// ─── Custom props ────────────────────────────────────────────

function CustomPropsEditor({
  custom,
  onChange,
}: {
  custom?: Record<string, unknown>;
  onChange: (custom: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const entries = Object.entries(custom ?? {});

  function handleAdd() {
    if (!newKey.trim()) return;
    onChange({ ...custom, [newKey.trim()]: newValue });
    setNewKey("");
    setNewValue("");
  }

  function handleRemove(key: string) {
    const next = { ...custom };
    delete next[key];
    onChange(next);
  }

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-zinc-200 p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-700"
      >
        <span>⚙️ Props Avançadas ({entries.length})</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-zinc-400">
            Adicione qualquer prop extra (data-*, aria-*, props de libs externas)
          </p>

          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5 text-xs">
              <span className="font-medium text-indigo-600">{k}</span>
              <span className="text-zinc-400">=</span>
              <span className="flex-1 truncate text-zinc-600">{String(v)}</span>
              <button type="button" onClick={() => handleRemove(k)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}

          <div className="flex gap-1.5">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="key"
              className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-indigo-400"
            />
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="value"
              className="flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-200"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapOptional(schema: any): any {
  if (schema && typeof schema === "object") {
    if (schema instanceof z.ZodOptional) {
      return unwrapOptional(schema.unwrap());
    }
    if (schema instanceof z.ZodDefault) {
      return unwrapOptional(schema.removeDefault());
    }
  }
  return schema;
}

function isEnum(schema: z.ZodTypeAny): boolean {
  const inner = unwrapOptional(schema);
  return inner instanceof z.ZodEnum;
}

function isBoolean(schema: z.ZodTypeAny): boolean {
  const inner = unwrapOptional(schema);
  return inner instanceof z.ZodBoolean;
}

function isString(schema: z.ZodTypeAny): boolean {
  const inner = unwrapOptional(schema);
  return inner instanceof z.ZodString;
}

function isNumber(schema: z.ZodTypeAny): boolean {
  const inner = unwrapOptional(schema);
  return inner instanceof z.ZodNumber;
}

function getEnumValues(schema: z.ZodTypeAny): string[] {
  const inner = unwrapOptional(schema);
  if (inner instanceof z.ZodEnum) {
    return [...inner.options] as string[];
  }
  return [];
}
