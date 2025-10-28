export const TEMPLATE_ID = 'lesson-card-template';

export const ACTION_SNIPPETS = {
    appendChild: (tag, text) => `const parent = document.querySelector('#previewList');\nconst node = document.createElement('${tag}');\nnode.textContent = '${text}';\nparent.appendChild(node);`,
    insertBefore: (tag, text) => `const parent = document.querySelector('#previewList');\nconst node = document.createElement('${tag}');\nnode.textContent = '${text}';\nconst anchor = parent.firstElementChild;\nparent.insertBefore(node, anchor);`,
    replaceChild: (tag, text) => `const parent = document.querySelector('#previewList');\nconst node = document.createElement('${tag}');\nnode.textContent = '${text}';\nconst target = parent.lastElementChild;\nif (target) parent.replaceChild(node, target);`,
    removeChild: () => `const parent = document.querySelector('#previewList');\nconst target = parent.lastElementChild;\nif (target) parent.removeChild(target);`
};

export async function ensureTemplateLoaded(path) {
    if (document.getElementById(TEMPLATE_ID)) {
        return;
    }

    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Nie udało się pobrać szablonu: ${response.status}`);
    }

    const html = await response.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const template = wrapper.querySelector('template');

    if (!template) {
        throw new Error('Plik szablonu nie zawiera elementu <template>.');
    }

    document.body.appendChild(template);
}

export function createLessonCard({ title, description, badge, code }) {
    const template = document.getElementById(TEMPLATE_ID);
    if (!template) {
        throw new Error('Szablon kart lekcji nie został jeszcze załadowany.');
    }

    const fragment = template.content.cloneNode(true);
    fragment.querySelector('[data-lesson-title]').textContent = title;
    fragment.querySelector('[data-lesson-description]').textContent = description;
    fragment.querySelector('[data-lesson-badge]').textContent = badge ?? '';

    const codeElement = fragment.querySelector('[data-lesson-code]');
    codeElement.textContent = code.trim();
    highlightBlock(codeElement);

    return fragment;
}

export function highlightBlock(codeElement) {
    if (window.hljs && codeElement) {
        window.hljs.highlightElement(codeElement);
    }
}

export function persistState(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('Nie udało się zapisać stanu w localStorage.', error);
    }
}

export function loadState(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        console.warn('Nie udało się odczytać stanu z localStorage.', error);
        return fallback;
    }
}

export function setVisitCookie() {
    const visits = Number(readCookie('domPlaygroundVisits') || 0) + 1;
    document.cookie = `domPlaygroundVisits=${visits};max-age=31536000;path=/;SameSite=Lax`;
    return visits;
}

function readCookie(name) {
    return document.cookie
        .split('; ')
        .find((part) => part.startsWith(`${name}=`))
        ?.split('=')[1];
}

export function createElement(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });

    children.forEach((child) => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}