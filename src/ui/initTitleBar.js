const { getCurrentWindow } = window.__TAURI__.window;

export function initWindowControls() {
    const appWindow = getCurrentWindow();
    document
      .getElementById('titlebar-minimize')
      ?.addEventListener('click', () => appWindow.minimize());
    document
      .getElementById('titlebar-maximize')
      ?.addEventListener('click', () => appWindow.toggleMaximize());
    document
      .getElementById('titlebar-close')
      ?.addEventListener('click', () => appWindow.close());
}