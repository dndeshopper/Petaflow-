import { readFileSync, existsSync } from "fs";
import path from "path";
import {
  DESIGN_FULL_DASHBOARD_HTML,
  DESIGN_STYLES_CSS,
} from "@/lib/design/html-sections";
import { DesignHtmlBridge } from "@/components/design/design-html-bridge";

function loadFullDashboardHtml(): string {
  const filePath = path.join(process.cwd(), "design", "full-dashboard-body.html");
  if (existsSync(filePath)) {
    return readFileSync(filePath, "utf8");
  }
  return DESIGN_FULL_DASHBOARD_HTML;
}

/**
 * Renders PetalFlow-Dashboard-standalone.html identically inside Next.js.
 * Source: design/PetalFlow-Dashboard-standalone.html
 */
export function DesignIdenticalView() {
  const html = loadFullDashboardHtml();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${DESIGN_STYLES_CSS}
            html, body { margin: 0; padding: 0; background: #f4f3f1; }
            #petalflow-identical-root { min-height: 100vh; overflow-x: auto; }
          `,
        }}
      />
      <DesignHtmlBridge />
      <div
        id="petalflow-identical-root"
        dangerouslySetInnerHTML={{ __html: html }}
        suppressHydrationWarning
      />
    </>
  );
}
