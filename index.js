let notes = [], redoStack = [];
let octave = null, sticky = false;

function maxNotes() {
  return +notesPerGroup.value * +maxGroups.value;
}

function add(t) {
  if (notes.length >= maxNotes()) {
    copy();
    return;
  }

  redoStack = [];
  let n = t;
  if (octave === 'u') n = `\\overset{\\text{.}}{${t}}`;
  if (octave === 'l') n = `\\underset{\\text{.}}{${t}}`;

  notes.push(n);
  if (!sticky) clearOctave();
  render();
}

function render() {
  const g = +notesPerGroup.value;
  let raw = '', preview = '';

  notes.forEach((n, i) => {
    raw += n + ((i + 1) % g ? '\\ ' : '');
    if ((i + 1) % g === 0 && i + 1 < notes.length) raw += ' \\;\\big|\\; \n';

    preview += n + ' ';
    if ((i + 1) % g === 0) preview += ' \\;\\big|\\; ';
  });

  document.getElementById('output').textContent = raw;
  document.getElementById('latex-preview').innerHTML =
      preview ? `\\(${preview}\\)` : '';
  MathJax.typesetPromise();
}

function undo() {
  if (!notes.length) return;
  redoStack.push(notes.pop());
  render();
}

function redo() {
  if (!redoStack.length) return;
  notes.push(redoStack.pop());
  render();
}

function setOctave(o, btn) {
  octave = o;
  document.querySelectorAll('.upper,.lower')
      .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function clearOctave() {
  octave = null;
  document.querySelectorAll('.upper,.lower')
      .forEach(b => b.classList.remove('active'));
}

function toggleSticky(btn) {
  sticky = !sticky;
  btn.classList.toggle('active', sticky);
}

function copy() {
  const text = document.getElementById('output').textContent;
  if (!text || text == 'Nothing to show') return;

  navigator.clipboard.writeText(text).then(() => {
    showCopied();
  });
}

function showCopied() {
  const btn = document.querySelector('.action-btn.primary');
  if (!btn) return;

  if (btn.dataset.busy) return;  // prevent flicker
  btn.dataset.busy = '1';

  const oldText = btn.textContent;
  btn.textContent = '✅ Copied';

  setTimeout(() => {
    btn.textContent = oldText;
    delete btn.dataset.busy;
  }, 1000);
}


function resetAll() {
  notes = [];
  redoStack = [];
  octave = null;
  sticky = false;
  document.querySelectorAll('.action-btn')
      .forEach(b => b.classList.remove('active'));
  render();
  document.getElementById('output').textContent = 'Nothing to show';
}

function openInfo() {
  info.style.display = 'flex'
}
function closeInfo() {
  info.style.display = 'none'
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    undo()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    redo()
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
    setOctave('u', document.querySelector('.upper'))
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
    setOctave('l', document.querySelector('.lower'))
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
    e.preventDefault();
    copy()
  }
});
