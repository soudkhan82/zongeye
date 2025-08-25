"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export type CsvColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  format?: (value: unknown, row: T) => unknown; // optional custom formatter
};

type Props<T> = {
  data: T[];
  columns?: CsvColumn<T>[]; // if omitted, headers inferred from first row keys
  filename?: string; // default: export.csv
  includeHeader?: boolean; // default: true
  sep?: string; // default: ","
  bom?: boolean; // add UTF-8 BOM for Excel. default: true
  className?: string;
  children?: React.ReactNode; // button label
  disabled?: boolean;
  title?: string;
};

export default function CsvDownloadButton<T>({
  data,
  columns,
  filename = "export.csv",
  includeHeader = true,
  sep = ",",
  bom = true,
  className,
  children = "Download CSV",
  disabled,
  title,
}: Props<T>) {
  const toText = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    if (
      typeof v === "number" ||
      typeof v === "bigint" ||
      typeof v === "boolean"
    )
      return String(v);
    // arrays/objects → JSON
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const escapeCell = (raw: string): string => {
    // RFC4180-ish: quote if contains sep, quote, newline, or leading/trailing spaces
    const needsQuote =
      /["\r\n,]/.test(raw) || raw.startsWith(" ") || raw.endsWith(" ");
    if (!needsQuote) return raw;
    return `"${raw.replace(/"/g, '""')}"`;
  };

  const makeCsv = React.useCallback(() => {
    if (!data?.length) return "";

    // Infer columns if none provided
    let cols: CsvColumn<T>[];
    if (!columns || !columns.length) {
      const keys = Object.keys(data[0] as object) as (keyof T)[];
      cols = keys.map((k) => ({ header: String(k), accessor: k }));
    } else {
      cols = columns;
    }

    const lines: string[] = [];

    if (includeHeader) {
      lines.push(cols.map((c) => escapeCell(c.header)).join(sep));
    }

    for (const row of data) {
      const cells = cols.map((c) => {
        const raw =
          typeof c.accessor === "function"
            ? c.accessor(row)
            : (row as any)[c.accessor];
        const formatted = c.format ? c.format(raw, row) : raw;
        return escapeCell(toText(formatted));
      });
      lines.push(cells.join(sep));
    }

    const csv = lines.join("\r\n");
    return bom ? "\ufeff" + csv : csv; // BOM helps Excel parse UTF-8
  }, [data, columns, includeHeader, sep, bom]);

  const handleDownload = () => {
    const csv = makeCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      className={className}
      disabled={disabled || !data?.length}
      title={title}
      variant="outline"
    >
      {children}
    </Button>
  );
}
