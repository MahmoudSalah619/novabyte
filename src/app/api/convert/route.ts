import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import crypto from "crypto";
import fs from "fs";
// @ts-ignore
import archiver from "archiver";
import { processSwaggerSpec } from "@/lib/swaggerToRTK";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createZip = (sourceDir: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      resolve();
    });

    archive.on("error", (err: any) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

const cleanup = (paths: string[]) => {
  paths.forEach((p) => {
    try {
      if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
          fs.rmSync(p, { recursive: true, force: true });
        } else {
          fs.unlinkSync(p);
        }
      }
    } catch (err) {
      console.error(`Error deleting path ${p}:`, err);
    }
  });
};

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const { swaggerData } = body;
  if (!swaggerData) {
    return NextResponse.json({ error: "swaggerData is required" }, { status: 400 });
  }

  const jobId = crypto.randomUUID();
  const tmpDir = os.tmpdir();
  const tempOutputDir = path.join(tmpDir, `rtk_output_${jobId}`);
  const zipPath = path.join(tmpDir, `rtk_endpoints_${jobId}.zip`);

  try {
    // Process the Swagger specification in the temporary directory
    await processSwaggerSpec(swaggerData, tempOutputDir);

    // Create the ZIP archive
    await createZip(tempOutputDir, zipPath);

    // Read the ZIP file into a buffer
    const fileBuffer = fs.readFileSync(zipPath);

    // Clean up temporary files
    cleanup([tempOutputDir, zipPath]);

    // Return the ZIP file as a binary stream
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="rtk_endpoints_${jobId}.zip"`,
      },
    });
  } catch (error: any) {
    console.error("Error converting swagger spec:", error);
    cleanup([tempOutputDir, zipPath]);
    return NextResponse.json(
      { error: "Failed to process Swagger specification", details: error.message },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: "OK", timestamp: new Date().toISOString() });
}
