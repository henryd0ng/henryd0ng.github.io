export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const previous = document.activeElement;
    const input = document.createElement('textarea');
    input.value = value;
    input.readOnly = true;
    input.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    (document.querySelector('dialog[open]') ?? document.body).append(input);
    input.select();
    try { return document.execCommand('copy'); }
    catch { return false; }
    finally {
      input.remove();
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    }
  }
}
