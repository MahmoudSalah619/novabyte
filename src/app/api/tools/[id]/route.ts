import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

import { scripts } from "@/app/scripts/scripts/data";

// Ensure this route runs in a Node.js runtime (so fs/path are available)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const script = scripts.find((item) => item.id === id);

  if (!script) {
    return NextResponse.json(
      { error: "Tool not found" },
      {
        status: 404,
      }
    );
  }

  const projectRoot = process.cwd();
  const absolutePath = path.join(projectRoot, script.filePath);

  try {
    const fileContents = await fs.readFile(absolutePath, "utf8");
    const searchParams = request.nextUrl.searchParams;
    const shouldDownload = searchParams.get("download") === "1";

    if (shouldDownload) {
      return new NextResponse(fileContents, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${script.fileName}"`,
        },
      });
    }

    return NextResponse.json(
      {
        id: script.id,
        name: script.name,
        fileName: script.fileName,
        code: fileContents,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to read tool source file" },
      {
        status: 500,
      }
    );
  }
}

