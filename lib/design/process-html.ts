/**
 * Process design HTML sections with dynamic values.
 * Source: design/PetalFlow-Dashboard-standalone.html
 */

export interface DesignTemplateVars {
  userName: string;
  newPetalsCount: number;
  petalsSaved: number;
  minutesToWatch: number;
}

export function applyDesignTemplate(
  html: string,
  vars: DesignTemplateVars
): string {
  return html
    .replace(/\{\{userName\}\}/g, vars.userName)
    .replace(/\{\{newPetalsCount\}\}/g, String(vars.newPetalsCount))
    .replace(/\{\{petalsSaved\}\}/g, String(vars.petalsSaved))
    .replace(/\{\{minutesToWatch\}\}/g, String(vars.minutesToWatch));
}

export function injectTimelineSlot(
  before: string,
  after: string,
  slotHtml: string
): string {
  return `${before}<div id="petalflow-timeline-root">${slotHtml}</div>${after}`;
}
