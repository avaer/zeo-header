const home = document.currentScript.getAttribute('home');
const tabsAttribute = document.currentScript.getAttribute('tabs');
const urlsAttribute = document.currentScript.getAttribute('urls');
const logout = document.currentScript.hasAttribute('logout');
let urls = urlsAttribute.length > 0 ? urlsAttribute.split(',') : [];
let tabs = tabsAttribute.length > 0 ? tabsAttribute.split(',').map((t, i) => ({
  tab: t,
  url: urls[i],
})) : [];
let tab = document.currentScript.getAttribute('tab');
let username = document.currentScript.getAttribute('username');
let notification = null;
let el = document.currentScript;

const _capitalize = s => s[0].toUpperCase() + s.slice(1);
const _nop = () => {};
const _copyToClipboard = s => {
  const mark = document.createElement('span');
  mark.textContent = s;
  mark.setAttribute('style', [
    // reset user styles for span element
    'all: unset',
    // prevents scrolling to the end of the page
    'position: fixed',
    'top: 0',
    'clip: rect(0, 0, 0, 0)',
    // used to preserve spaces and line breaks
    'white-space: pre',
    // do not inherit user-select (it may be `none`)
    '-webkit-user-select: text',
    '-moz-user-select: text',
    '-ms-user-select: text',
    'user-select: text',
  ].join(';'));
  document.body.appendChild(mark);

  const range = document.createRange();
  range.selectNode(mark);

  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const successful = document.execCommand('copy');
  return successful;
};
const _render = () => {
  const oldEl = el;

  const newEl = document.createElement('div');
  newEl.innerHTML = `\
    <header class=header>
      <div class=header-left>
        <div class=logo-wrap>
          <img src="/img/logo.svg" class=logo>
        </div>
        <a href="${home}" class=header-logo-anchor>zeo</a>
      </div>
      <navbar>
        ${tabs.map(t => `<a href="${t.url}" class="blue ${t.tab === tab ? 'selected' : ''}">${_capitalize(t.tab)}</a>`).join('\n')}
      </navbar>
      <div class=header-right>
        ${username ? `<navbar>
          <a href="/id" class="blue ${logout ? 'copyable' : ''}" id=header-copy-button>
            <span class=avatar>
              <img src="${creaturejs.makeStaticCreature('user:' + username)}" class=avatar-image id=avatar-image />
              <span id=avatar-username>${username}</span>
            </span>
            ${logout ?
              `<span class=copy>Click to copy</span>
              <span class=notification>...Copied!</span>`
            :
              ''
            }
          </a>
          ${logout ? `<a href="/id/login" class=button id=header-logout-button>Logout</a>` : ''}
        </navbar>` : ''}
      </div>
    </header>
    ${notification ? `<div class="notification ${notification.type}" id=notification>
      <img src="/id/img/ok.svg" class="img ok">
      <img src="/id/img/error.svg" class="img error">
      <img src="/id/img/emoticon.svg" class="img null">
      <div class=notification-text id=notification-text>${notification.message}</div>
      <a class=close id=notification-close>
        <img src="/id/img/close.svg">
      </a>
    </div>` : ''}
  `;

  if (logout && username) {
    const headerCopyButton = newEl.querySelector('#header-copy-button');
    headerCopyButton.addEventListener('click', e => {
      _copyToClipboard(username);

      headerCopyButton.classList.add('copied');

      setTimeout(() => {
        headerCopyButton.classList.remove('copied');
      }, 2000);

      e.preventDefault();
    });
  }

  const headerLogoutButton = newEl.querySelector('#header-logout-button');
  if (headerLogoutButton) {
    headerLogoutButton.addEventListener('click', e => {
      header.onlogout(e);
    });
  }

  const notificationEl = newEl.querySelector('#notification');
  if (notificationEl) {
    const notificationTextEl = newEl.querySelector('#notification-text');
    const notificationCloseEl = newEl.querySelector('#notification-close');
    notificationCloseEl.addEventListener('click', () => {
      notification = null;
      _render();
    });
  }

  oldEl.parentNode.replaceChild(newEl, oldEl);
  el = newEl;
};
_render();

const header = {
  setTab(newTab) {
    tab = newTab;
    _render();
  },
  setNotification(typeEnum, message) {
    const type = (() => {
      switch (typeEnum) {
        case true: return 'ok';
        case false: return 'error';
        default: return null;
      }
    })();

    notification = {
      type,
      message,
    };

    _render();
  },
  onlogout: _nop,
};
window.header = header;
