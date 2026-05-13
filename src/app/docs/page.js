"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Zap } from "lucide-react";

const BASE_URL = "https://nyamkuy.app/api";

const endpoints = [
  {
    id: "resep-list",
    method: "GET",
    path: "/api/resep",
    summary: "Daftar Resep",
    description: "Ambil daftar semua resep dengan dukungan pagination.",
    params: [
      { name: "page", type: "integer", required: false, default: "1", desc: "Nomor halaman" },
    ],
    response: {
      fields: [
        { key: "data[].id", type: "integer", desc: "ID unik resep" },
        { key: "data[].nama", type: "string", desc: "Nama resep" },
        { key: "data[].deskripsi", type: "string", desc: "Deskripsi singkat" },
        { key: "data[].created_at", type: "string", desc: "Tanggal dibuat (ISO 8601)" },
        { key: "meta.total", type: "integer", desc: "Total jumlah resep" },
        { key: "meta.page", type: "integer", desc: "Halaman saat ini" },
        { key: "meta.limit", type: "integer", desc: "Jumlah item per halaman (20)" },
        { key: "meta.total_pages", type: "integer", desc: "Total halaman" },
      ],
    },
    examples: [
      `GET ${BASE_URL}/resep`,
      `GET ${BASE_URL}/resep?page=2`,
    ],
    errors: [],
  },
  {
    id: "resep-search",
    method: "GET",
    path: "/api/resep/search",
    summary: "Cari Resep",
    description: "Cari resep berdasarkan nama. Parameter q wajib disertakan.",
    params: [
      { name: "q", type: "string", required: true, default: null, desc: "Keyword pencarian" },
      { name: "page", type: "integer", required: false, default: "1", desc: "Nomor halaman" },
    ],
    response: {
      fields: [
        { key: "data[].id", type: "integer", desc: "ID unik resep" },
        { key: "data[].nama", type: "string", desc: "Nama resep" },
        { key: "data[].deskripsi", type: "string", desc: "Deskripsi singkat" },
        { key: "data[].created_at", type: "string", desc: "Tanggal dibuat (ISO 8601)" },
        { key: "meta.total", type: "integer", desc: "Total hasil pencarian" },
        { key: "meta.page", type: "integer", desc: "Halaman saat ini" },
        { key: "meta.limit", type: "integer", desc: "Jumlah item per halaman (20)" },
        { key: "meta.total_pages", type: "integer", desc: "Total halaman" },
        { key: "meta.q", type: "string", desc: "Keyword yang digunakan" },
      ],
    },
    examples: [
      `GET ${BASE_URL}/resep/search?q=ayam`,
      `GET ${BASE_URL}/resep/search?q=nasi&page=2`,
    ],
    errors: [{ code: 400, desc: "Parameter q kosong atau tidak disertakan" }],
  },
  {
    id: "resep-detail",
    method: "GET",
    path: "/api/resep/:id",
    summary: "Detail Resep",
    description: "Ambil detail lengkap satu resep termasuk bahan, bumbu, langkah, dan tips.",
    params: [
      { name: "id", type: "integer", required: true, default: null, desc: "ID resep (path parameter)" },
    ],
    response: {
      fields: [
        { key: "data.id", type: "integer", desc: "ID unik resep" },
        { key: "data.nama", type: "string", desc: "Nama resep" },
        { key: "data.deskripsi", type: "string", desc: "Deskripsi" },
        { key: "data.created_at", type: "string", desc: "Tanggal dibuat" },
        { key: "data.bahan[]", type: "object[]", desc: "Bahan: nama, kategori" },
        { key: "data.bumbu[]", type: "object[]", desc: "Bumbu: nama, jenis" },
        { key: "data.sambal[]", type: "object[]", desc: "Sambal: nama, jenis" },
        { key: "data.komponen[]", type: "object[]", desc: "Komponen: nama, jenis" },
        { key: "data.lalapan[]", type: "string[]", desc: "Daftar lalapan" },
        { key: "data.langkah[]", type: "object[]", desc: "Langkah: no, instruksi" },
        { key: "data.tips[]", type: "string[]", desc: "Tips memasak" },
      ],
    },
    examples: [
      `GET ${BASE_URL}/resep/1`,
      `GET ${BASE_URL}/resep/42`,
    ],
    errors: [{ code: 404, desc: "Resep dengan ID tersebut tidak ditemukan" }],
  },
  {
    id: "image-base",
    method: "GET",
    path: "/api/image/base",
    summary: "Gambar Resep (Full)",
    description: "Gambar resep ukuran penuh dalam format PNG. Response di-cache selama 24 jam.",
    params: [
      { name: "nama", type: "string", required: true, default: null, desc: "Nama resep" },
    ],
    response: {
      contentType: "image/png",
      cache: "Cache-Control: public, max-age=86400 (24 jam)",
    },
    examples: [
      `GET ${BASE_URL}/image/base?nama=Nasi Goreng`,
      `GET ${BASE_URL}/image/base?nama=Ayam Bakar`,
    ],
    errors: [{ code: 404, desc: "Gambar tidak ditemukan" }],
  },
  {
    id: "image-cropped",
    method: "GET",
    path: "/api/image/cropped",
    summary: "Gambar Resep (Cropped)",
    description: "Gambar resep versi crop/thumbnail dalam format PNG. Response di-cache selama 24 jam.",
    params: [
      { name: "nama", type: "string", required: true, default: null, desc: "Nama resep" },
    ],
    response: {
      contentType: "image/png",
      cache: "Cache-Control: public, max-age=86400 (24 jam)",
    },
    examples: [
      `GET ${BASE_URL}/image/cropped?nama=Nasi Goreng`,
      `GET ${BASE_URL}/image/cropped?nama=Ayam Bakar`,
    ],
    errors: [{ code: 404, desc: "Gambar tidak ditemukan" }],
  },
];

const methodStyle = {
  GET: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
};

const errorStyle = {
  400: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  404: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-6 w-6 shrink-0 ${className}`}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function EndpointCard({ ep }) {
  return (
    <AccordionItem value={ep.id} className="border rounded-lg px-0 overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Badge variant="outline" className={`shrink-0 font-mono text-xs font-bold ${methodStyle[ep.method]}`}>
            {ep.method}
          </Badge>
          <code className="text-sm font-mono text-foreground truncate">{ep.path}</code>
          <span className="text-sm text-muted-foreground hidden sm:block ml-auto mr-4">{ep.summary}</span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-5 pt-0">
        <Separator className="mb-4" />

        <p className="text-sm text-muted-foreground mb-5">{ep.description}</p>

        {/* Parameters */}
        {ep.params?.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Parameters
            </h4>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs h-8">Nama</TableHead>
                    <TableHead className="text-xs h-8">Tipe</TableHead>
                    <TableHead className="text-xs h-8">Wajib</TableHead>
                    <TableHead className="text-xs h-8">Default</TableHead>
                    <TableHead className="text-xs h-8">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ep.params.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-mono text-xs font-medium text-orange-600 dark:text-orange-400">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.type}</TableCell>
                      <TableCell className="text-xs">
                        {p.required ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">ya</Badge>
                        ) : (
                          <span className="text-muted-foreground">opsional</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {p.default ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Response */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Response
          </h4>
          {ep.response.contentType ? (
            <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground text-xs">Content-Type: </span>
                <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{ep.response.contentType}</code>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Cache: </span>
                <code className="text-xs font-mono text-sky-600 dark:text-sky-400">{ep.response.cache}</code>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs h-8">Field</TableHead>
                    <TableHead className="text-xs h-8">Tipe</TableHead>
                    <TableHead className="text-xs h-8">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ep.response.fields?.map((f) => (
                    <TableRow key={f.key}>
                      <TableCell className="font-mono text-xs text-sky-600 dark:text-sky-400">{f.key}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{f.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{f.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Errors */}
        {ep.errors?.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Error Codes
            </h4>
            <div className="flex flex-col gap-1.5">
              {ep.errors.map((e) => (
                <div key={e.code} className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-mono shrink-0 ${errorStyle[e.code]}`}>
                    {e.code}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{e.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {ep.examples?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Contoh
            </h4>
            <div className="space-y-2">
              {ep.examples.map((ex) => (
                <div
                  key={ex}
                  className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
                >
                  <code className="text-xs font-mono flex-1 break-all text-foreground">{ex}</code>
                  <CopyButton text={ex} />
                </div>
              ))}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <Zap className="h-3 w-3 text-orange-500" />
              Api Documentation
            </Badge>
            <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
              v1
            </Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">NyamKuy API</h1>

          <Card className="bg-muted/40">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <span className="text-xs text-muted-foreground shrink-0">Base URL</span>
              <code className="text-sm font-mono font-medium flex-1">{BASE_URL}</code>
              <CopyButton text={BASE_URL} />
            </CardContent>
          </Card>
        </div>

        {/* Endpoints */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Endpoints
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {endpoints.map((ep) => (
              <EndpointCard key={ep.id} ep={ep} />
            ))}
          </Accordion>
        </div>

        <Separator className="my-8" />
        <p className="text-center text-xs text-muted-foreground">
          nyamkuy.app &middot; API Documentation
        </p>
      </div>
    </div>
  );
}