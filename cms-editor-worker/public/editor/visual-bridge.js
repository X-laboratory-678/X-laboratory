(() => {
  if (window.parent === window || window.__xlabVisualBridge) return;
  window.__xlabVisualBridge = true;
  const style = document.createElement('style');
  style.textContent = `
    [data-cms-field], [data-cms-entry], [data-cms-settings], [data-cms-settings-field], [data-cms-navigation-label] { cursor: pointer !important; }
    [data-cms-field]:hover, [data-cms-entry]:hover, [data-cms-add]:hover, [data-cms-settings]:hover, [data-cms-settings-field]:hover, [data-cms-navigation-label]:hover { outline: 3px solid #1877bd !important; outline-offset: 3px !important; background-color: rgba(24,119,189,.08) !important; }
    button[data-cms-add] { display: none !important; border: 0 !important; border-radius: 999px !important; padding: 8px 13px !important; background: #1769aa !important; color: white !important; font: 600 13px/1.2 system-ui,sans-serif !important; }
    button[data-cms-add][data-cms-bridge-visible] { display: inline-flex !important; }
  `;
  document.head.append(style);
  document.querySelectorAll('button[data-cms-add]').forEach((button) => button.setAttribute('data-cms-bridge-visible', 'true'));
  const pageFile = document.body?.dataset.cmsPage || '';
  document.addEventListener('click', (event) => {
    const add = event.target.closest('button[data-cms-add]');
    if (add) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.parent.postMessage({ type: 'xlab-cms-add', collection: add.dataset.cmsAdd || '' }, location.origin);
      return;
    }
    const nav = event.target.closest('[data-cms-navigation-label]');
    if (nav) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.parent.postMessage({ type: 'xlab-cms-settings', scope: 'navigation', locale: document.documentElement.lang === 'zh' ? 'zh' : 'en', identifier: nav.dataset.cmsNavigationLabel || '' }, location.origin);
      return;
    }
    const setting = event.target.closest('[data-cms-settings-field]');
    if (setting) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.parent.postMessage({ type: 'xlab-cms-settings', scope: 'site-info', locale: document.documentElement.lang === 'zh' ? 'zh' : 'en', field: setting.dataset.cmsSettingsField || '' }, location.origin);
      return;
    }
    const settingsContainer = event.target.closest('[data-cms-settings]');
    const field = event.target.closest('[data-cms-field]');
    const entry = event.target.closest('[data-cms-entry]');
    if (settingsContainer && !field && !entry) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.parent.postMessage({ type: 'xlab-cms-settings', scope: settingsContainer.dataset.cmsSettings || 'site-info', locale: document.documentElement.lang === 'zh' ? 'zh' : 'en' }, location.origin);
      return;
    }
    if (!field && !entry) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const node = field || entry;
    const record = node.closest('[data-cms-entry]') || entry;
    const page = node.closest('[data-cms-file]')?.dataset.cmsFile || pageFile;
    window.parent.postMessage({
      type: 'xlab-cms-select',
      path: record?.dataset.cmsEntry || '',
      collection: record?.dataset.cmsType || '',
      field: field?.dataset.cmsField || '',
      page,
      locale: document.documentElement.lang === 'zh' ? 'zh' : 'en'
    }, location.origin);
  }, true);
})();
