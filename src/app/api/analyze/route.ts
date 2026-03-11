import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "aefirmadive-"));
    const tempFilePath = path.join(tempDir, file.name || "firmware.bin");
    
    await fs.writeFile(tempFilePath, buffer);

    let stringsOutput = "";
    try {
      const { stdout } = await execAsync(`strings -n 8 "${tempFilePath}" | head -n 400`);
      stringsOutput = stdout;
    } catch (e) {
      console.error("Strings error:", e);
      stringsOutput = "Error running strings extraction.";
    }

    let binwalkOutput = "";
    try {
      // Trying real binwalk without extraction to get signatures safely
      const { stdout } = await execAsync(`binwalk "${tempFilePath}" | head -n 100`);
      binwalkOutput = stdout;
    } catch (e: any) {
      console.error("Binwalk error:", e);
      binwalkOutput = e.stdout || "Binwalk execution failed or not installed.";
    }

    await fs.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json({ 
      success: true, 
      strings: stringsOutput,
      binwalk: binwalkOutput,
      fileName: file.name
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to process firmware locally" }, { status: 500 });
  }
}
