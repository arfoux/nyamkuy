import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

async function getRecipeId(params) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams?.id, 10);
  return Number.isNaN(id) ? null : id;
}

async function requireSession() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { session };
}

async function ensureRecipe(db, resepId) {
  return db
    .prepare("SELECT id FROM resep WHERE id = ? LIMIT 1")
    .bind(resepId)
    .first();
}

export async function GET(_request, { params }) {
  void _request;

  const resepId = await getRecipeId(params);

  if (!resepId) {
    return NextResponse.json(
      { error: "ID tidak valid" },
      { status: 400 }
    );
  }

  const { response, session } = await requireSession();
  if (response) return response;

  const { env } = getRequestContext();
  const db = env.DB;

  const saved = await db
    .prepare(
      "SELECT 1 FROM saved_recipes WHERE user_id = ? AND resep_id = ? LIMIT 1"
    )
    .bind(session.userId, resepId)
    .first();

  return NextResponse.json({ saved: Boolean(saved) });
}

export async function POST(_request, { params }) {
  void _request;

  const resepId = await getRecipeId(params);

  if (!resepId) {
    return NextResponse.json(
      { error: "ID tidak valid" },
      { status: 400 }
    );
  }

  const { response, session } = await requireSession();
  if (response) return response;

  const { env } = getRequestContext();
  const db = env.DB;

  const recipe = await ensureRecipe(db, resepId);
  if (!recipe) {
    return NextResponse.json(
      { error: "Resep tidak ditemukan" },
      { status: 404 }
    );
  }

  await db
    .prepare(
      `INSERT OR IGNORE INTO saved_recipes (id, user_id, resep_id, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), session.userId, resepId, Date.now())
    .run();

  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE(_request, { params }) {
  void _request;

  const resepId = await getRecipeId(params);

  if (!resepId) {
    return NextResponse.json(
      { error: "ID tidak valid" },
      { status: 400 }
    );
  }

  const { response, session } = await requireSession();
  if (response) return response;

  const { env } = getRequestContext();
  const db = env.DB;

  await db
    .prepare("DELETE FROM saved_recipes WHERE user_id = ? AND resep_id = ?")
    .bind(session.userId, resepId)
    .run();

  return NextResponse.json({ ok: true, saved: false });
}
