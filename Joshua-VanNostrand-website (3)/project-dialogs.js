(() => {
  let trigger = null;
  document.querySelectorAll('[data-project]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.project);
      if (!dialog || dialog.open) return;
      trigger = button;
      dialog.showModal();
    });
  });
  document.querySelectorAll('.project-dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => { if (trigger) trigger.focus(); });
  });
})();
