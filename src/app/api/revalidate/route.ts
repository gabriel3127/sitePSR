import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get("slug")

  revalidatePath("/catalogo")

  if (slug) {
    revalidatePath(`/catalogo/p/${slug}`)
  } else {
    revalidatePath("/catalogo/p/[slug]", "page")
  }

  return NextResponse.json({ revalidated: true, slug: slug ?? "all" })
}
