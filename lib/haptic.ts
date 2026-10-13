// iOS Safari has no vibration API. iOS 18+ plays a system haptic when an
// <input type="checkbox" switch> is toggled, so we toggle a hidden one.
// Still unverified on a real iPhone (DESIGN.md section 6): check it on both phones.
let label: HTMLLabelElement | null = null;

export function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(12);
    return;
  }
  if (!label) {
    const wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
    wrap.innerHTML = '<label><input type="checkbox" switch tabindex="-1"></label>';
    document.body.appendChild(wrap);
    label = wrap.querySelector('label');
  }
  label?.click();
}
