// eslint-disable-next-line import/extensions
import buttonsLibrary from './buttonslibrary.js';

const english = 'en';
const russian = 'ru';
const lowercaseMode = 'normal';
const capitalizeMode = 'shifted';
const storedLanguageItem = 'keyboardLang';

class Keyboard {
  constructor() {
    this.lang = localStorage.getItem(storedLanguageItem) || english;
    this.capitalisation = lowercaseMode;
    this.capslocked = false;
  }

  addButtons() {
    const fragment = document.createDocumentFragment();
    const keyCodes = Object.keys(buttonsLibrary);
    keyCodes.forEach((key) => {
      const button = document.createElement('div');
      button.textContent = buttonsLibrary[key].key[this.capitalisation][this.lang];
      button.classList.add('keyboard__button');
      button.classList.add(`keyboard__button_width_${buttonsLibrary[key].width}`);
      button.dataset.code = key;
      fragment.appendChild(button);
    });

    return fragment;
  }

  switchLanguage() {
    this.lang = this.lang === english ? russian : english;
  }

  shiftCapitalisation() {
    this.capitalisation = this.capitalisation === lowercaseMode ? capitalizeMode : lowercaseMode;
  }

  toggleCapslock() {
    this.capslocked = !this.capslocked;
  }

  drawButtons() {
    const keyboardButtons = document.querySelectorAll('.keyboard__button');
    for (let i = 0; i < keyboardButtons.length; i += 1) {
      keyboardButtons[i].textContent = buttonsLibrary[keyboardButtons[i].dataset.code]
        .key[this.capitalisation][this.lang];
    }
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea');
    wrapper.appendChild(textarea);
    const keyboard = document.createElement('div');
    keyboard.classList.add('keyboard');
    const info = document.createElement('div');
    info.innerHTML = '<div class="info__hint"><p>Switch language: <span>alt</span> + <span>shift</span></p></div><div class="info__os"><p>Virtual Keyboard "BlueSky"<p></div>';
    info.classList.add('info');
    wrapper.appendChild(keyboard);
    keyboard.appendChild(this.addButtons());
    wrapper.appendChild(info);
    document.body.appendChild(wrapper);
    const shiftKeys = document.querySelectorAll('[data-code*="Shift');
    const capslockKey = document.querySelector('[data-code="CapsLock"');
    capslockKey.classList.add('keyboard__button_capslock');

    document.addEventListener('keydown', (evt) => {
      if (buttonsLibrary[evt.code]) {
        evt.preventDefault();
        if ((evt.code === 'ShiftLeft' || evt.code === 'ShiftRight')) {
          if (!Array.from(shiftKeys).some((element) => element.classList.contains('keyboard__button_active'))) {
            this.shiftCapitalisation();
          }

          this.drawButtons();
        }

        document.querySelector(`[data-code="${evt.code}"]`).classList.add('keyboard__button_active');
        const startPosition = textarea.selectionStart;
        const indent = '\t';
        const lineBreak = '\n';

        if (buttonsLibrary[evt.code].type === 'print') {
          if (startPosition === textarea.selectionEnd) {
            textarea.value = textarea.value.slice(0, startPosition)
              + buttonsLibrary[evt.code].key[this.capitalisation][this.lang]
              + textarea.value.slice(textarea.selectionStart);
          } else {
            textarea.setRangeText(buttonsLibrary[evt.code].key[this.capitalisation][this.lang]);
          }
          textarea.selectionStart = startPosition + 1;
          textarea.selectionEnd = textarea.selectionStart;
        } else if (buttonsLibrary[evt.code].type === 'func') {
          switch (evt.code) {
            case 'Backspace':
              if (startPosition === textarea.selectionEnd) {
                if (startPosition > 0) {
                  textarea.value = textarea.value.slice(0, startPosition - 1)
                    + textarea.value.slice(startPosition);
                  textarea.selectionStart = startPosition - 1;
                  textarea.selectionEnd = textarea.selectionStart;
                }
              } else {
                textarea.setRangeText('');
              }
              break;
            case 'Delete':
              if (startPosition === textarea.selectionEnd) {
                if (startPosition < textarea.value.length) {
                  textarea.value = textarea.value.slice(0, startPosition)
                    + textarea.value.slice(startPosition + 1);
                  textarea.selectionStart = startPosition;
                  textarea.selectionEnd = textarea.selectionStart;
                }
              } else {
                textarea.setRangeText('');
              }
              break;
            case 'Tab':
              if (startPosition === textarea.selectionEnd) {
                textarea.value = textarea.value.slice(0, startPosition)
                  + indent
                  + textarea.value.slice(textarea.selectionStart);
              } else {
                textarea.setRangeText(indent);
              }
              textarea.selectionStart = startPosition + 1;
              textarea.selectionEnd = textarea.selectionStart;
              break;
            case 'Enter':
              if (startPosition === textarea.selectionEnd) {
                textarea.value = textarea.value.slice(0, startPosition)
                  + lineBreak
                  + textarea.value.slice(textarea.selectionStart);
              } else {
                textarea.setRangeText(lineBreak);
              }
              textarea.selectionStart = startPosition + 1;
              textarea.selectionEnd = textarea.selectionStart;
              break;
            default:
              break;
          }
        }
      }
    });

    document.addEventListener('keyup', (evt) => {
      if (buttonsLibrary[evt.code]) {
        evt.preventDefault();
        document.querySelector(`[data-code="${evt.code}"]`).classList.remove('keyboard__button_active');

        if (evt.code === 'ShiftLeft' || evt.code === 'ShiftRight') {
          this.shiftCapitalisation();
          this.drawButtons();

          if (evt.altKey) {
            this.switchLanguage();
            this.drawButtons();
          }
        }

        if (evt.code === 'AltLeft' || evt.code === 'AltRight') {
          if (evt.shiftKey) {
            this.switchLanguage();
            this.drawButtons();
          }
        }

        if (evt.code === 'CapsLock') {
          this.shiftCapitalisation();
          this.drawButtons();
          this.toggleCapslock();
          capslockKey.classList.toggle('keyboard__button_capslock_active');
        }
      }
    });

    const mouseDownHandler = (evt) => {
      if (evt.target.classList.contains('keyboard__button')) {
        document.dispatchEvent(new KeyboardEvent('keydown', { code: evt.target.dataset.code }));
      }
    };

    const mouseOffHandler = (evt) => {
      document.dispatchEvent(new KeyboardEvent('keyup', { code: evt.target.dataset.code }));
      evt.target.removeEventListener('mouseup', mouseOffHandler);
      evt.target.removeEventListener('mouseout', mouseOffHandler);
      textarea.focus();
    };

    document.addEventListener('mousedown', (evt) => {
      mouseDownHandler(evt);
      evt.target.addEventListener('mouseup', mouseOffHandler);
      evt.target.addEventListener('mouseout', mouseOffHandler);
    });

    window.addEventListener('beforeunload', () => {
      localStorage.setItem(storedLanguageItem, this.lang);
    });
  }
}

export default Keyboard;
