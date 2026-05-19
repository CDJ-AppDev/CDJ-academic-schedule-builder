/**
 * @file popup.js
 * @description Injects high-fidelity custom modal dialogs that override native browser alert() and confirm() APIs. Provides CSS-animated overlays with tailored thematic styling.
 */

(function () {

  /**
   * Overrides the window.alert method.
   * Dynamically formats title headers, CSS theme boundaries, and icon markers based on the message string contents.
   * @param {string} message - Dialogue description
   * @param {string} [title] - Header title override
   */
  window.alert = function (message, title) {
    let icon = '🔔';
    let defaultTitle = 'Notice';
    let typeClass = 'primary';
    let iconClass = '';
    let titleClass = '';

    const msgLower = (message || '').toLowerCase();
    
    // Classify modal based on threat level or validation state
    if (msgLower.includes('conflict') || msgLower.includes('⚠️') || msgLower.includes('please') || msgLower.includes('must') || msgLower.includes('expired') || msgLower.includes('no courses')) {
      icon = '⚠️';
      defaultTitle = 'Warning';
      typeClass = 'warning';
      iconClass = 'warning';
      titleClass = 'warning-text';
      // Format out the raw emojis from the description string
      message = (message || '').replace('⚠️ ', '').replace('⚠️', '');
    } else if (msgLower.includes('error') || msgLower.includes('invalid') || msgLower.includes('failed') || msgLower.includes('cannot') || msgLower.includes('do not match') || msgLower.includes('not loaded') || msgLower.includes('not found')) {
      icon = '❌';
      defaultTitle = 'Error';
      typeClass = 'error';
      iconClass = 'error';
      titleClass = 'error-text';
    } else if (msgLower.includes('success') || msgLower.includes('sent')) {
      icon = '✅';
      defaultTitle = 'Success';
    }

    title = title || defaultTitle;

    // Purge outdated modal components
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
      <div class="custom-modal" role="dialog" aria-modal="true" aria-labelledby="cmod-title">
        <div class="custom-modal-icon ${iconClass}">${icon}</div>
        <div class="custom-modal-title ${titleClass}" id="cmod-title">${title}</div>
        <div class="custom-modal-body">${message}</div>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn ${typeClass}" id="custom-alert-ok">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    const close = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#custom-alert-ok').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  };

  /**
   * Spawns a custom confirmation dialog.
   * Fires the appropriate callback depending on user interaction.
   * @param {string} message - Dialogue description
   * @param {Function} onConfirm - Callback trigger when accepted
   * @param {Function} [onCancel] - Optional cancel trigger when closed
   * @param {string} [title] - Header title
   */
  window.confirmPopup = function (message, onConfirm, onCancel, title) {
    title = title || 'Confirmation';
    
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    overlay.innerHTML = `
      <div class="custom-modal" role="dialog" aria-modal="true" aria-labelledby="cmod-title">
        <div class="custom-modal-icon">❓</div>
        <div class="custom-modal-title" id="cmod-title">${title}</div>
        <div class="custom-modal-body">${message}</div>
        <div class="custom-modal-actions">
          <button class="custom-modal-btn secondary" id="custom-confirm-cancel">Cancel</button>
          <button class="custom-modal-btn primary" id="custom-confirm-ok">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    const close = (confirmed) => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        if (confirmed && typeof onConfirm === 'function') onConfirm();
        if (!confirmed && typeof onCancel === 'function') onCancel();
      }, 300);
    };

    overlay.querySelector('#custom-confirm-ok').addEventListener('click', () => close(true));
    overlay.querySelector('#custom-confirm-cancel').addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
  };

  /**
   * Unified Account Logout Handler.
   * Cleans security credentials and redirects users back to the landing screen.
   * @param {string} [redirectPath] - Target path redirect key
   */
  window.handleLogout = function (redirectPath) {
    redirectPath = redirectPath || '../index.html';
    window.confirmPopup(
      'Are you sure you want to log out and return to the main landing page?',
      () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = redirectPath;
      },
      null,
      'Confirm Logout'
    );
  };

})();
