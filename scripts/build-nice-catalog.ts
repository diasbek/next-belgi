/**
 * Build Nice/MKTU catalog JSON from FIPS bilingual XLSX.
 *
 * Source: data/nice/raw/mktu_13_26_2lang.xlsx
 * Output: src/data/nice/terms-{uz,ru,en}.json + classes.json
 *
 * Requires: pip install openpyxl (Python 3)
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const script = path.join(root, "scripts/build-nice-catalog.py");

execFileSync("python3", [script], { stdio: "inherit", cwd: root });
