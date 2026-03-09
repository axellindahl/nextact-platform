export type TemplateVars = {
  character_name?: string;
  valued_direction?: string;
  main_obstacle?: string;
  current_behavior?: string;
  context?: string;
  context_detail?: string;
};

/**
 * Replaces {variable_name} placeholders in a string with values from vars.
 * Unknown placeholders are left as-is (e.g. {unknown} stays {unknown}).
 */
export function substituteTemplateVars(text: string, vars: TemplateVars): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key as keyof TemplateVars];
    return value ?? match;
  });
}
