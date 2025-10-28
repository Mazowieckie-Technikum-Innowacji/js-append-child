export const TEMPLATE_IDS = {
    lesson: 'lesson-card-template',
    task: 'task-card-template',
    quiz: 'quiz-question-template'
};

export const ACTION_SNIPPETS = {
    appendChild: (tag, text) => `const parent = document.querySelector('#previewList');\nconst node = document.createElement('${tag}');\nnode.textContent = '${text}';\nparent.appendChild(node);`,
    insertBefore: (tag, text) => `const parent = document.querySelector('#previewList');\nconst node = document.createElement('${tag}');\nnode.textContent = '${text}';\nconst anchor = parent.firstElementChild;\nparent.insertBefore(node, anchor);`,
    replaceChild: (tag, text) => `const parent = document.querySelector('#previewList');\nconst node = document.createElement('${tag}');\nnode.textContent = '${text}';\nconst target = parent.lastElementChild;\nif (target) parent.replaceChild(node, target);`,
    removeChild: () => `const parent = document.querySelector('#previewList');\nconst target = parent.lastElementChild;\nif (target) parent.removeChild(target);`
};

export async function ensureTemplateLoaded(path) {
    const missingTemplates = Object.values(TEMPLATE_IDS).filter((id) => !document.getElementById(id));
    if (missingTemplates.length === 0) {
        return;
    }

    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Nie udało się pobrać szablonu: ${response.status}`);
    }

    const html = await response.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const templates = wrapper.querySelectorAll('template');

    if (!templates.length) {
        throw new Error('Plik szablonu nie zawiera elementów <template>.');
    }

    templates.forEach((template) => {
        if (!template.id) {
            return;
        }
        if (!document.getElementById(template.id)) {
            document.body.appendChild(template);
        }
    });
}

export function createLessonCard({ title, description, badge, code }) {
    const fragment = cloneTemplate(TEMPLATE_IDS.lesson);
    fragment.querySelector('[data-lesson-title]').textContent = title;
    fragment.querySelector('[data-lesson-description]').textContent = description;
    fragment.querySelector('[data-lesson-badge]').textContent = badge ?? '';

    const codeElement = fragment.querySelector('[data-lesson-code]');
    if (code) {
        codeElement.textContent = code.trim();
        highlightBlock(codeElement);
    } else {
        codeElement.parentElement?.remove();
    }

    return fragment;
}

export function createTaskCard({ id, title, description, level, steps }) {
    const fragment = cloneTemplate(TEMPLATE_IDS.task);
    const root = fragment.querySelector('[data-task-root]');
    if (root) {
        root.dataset.taskId = id;
    }

    fragment.querySelector('[data-task-title]').textContent = title;
    fragment.querySelector('[data-task-description]').textContent = description;
    fragment.querySelector('[data-task-level]').textContent = level ?? 'DOM';

    const stepList = fragment.querySelector('[data-task-steps]');
    steps.forEach((step) => {
        const item = document.createElement('li');
        item.textContent = step;
        stepList.appendChild(item);
    });

    return fragment;
}

export function createQuizCard({ id, question, category, hint, code, options }) {
    const fragment = cloneTemplate(TEMPLATE_IDS.quiz);
    const root = fragment.querySelector('[data-quiz-root]');
    if (root) {
        root.dataset.quizId = id;
    }

    fragment.querySelector('[data-quiz-question]').textContent = question;
    const categoryElement = fragment.querySelector('[data-quiz-category]');
    categoryElement.textContent = category ?? 'Quiz';

    const hintElement = fragment.querySelector('[data-quiz-hint]');
    if (hint) {
        hintElement.textContent = hint;
    } else {
        hintElement.remove();
    }

    const codeElement = fragment.querySelector('[data-quiz-code]');
    if (code) {
        codeElement.textContent = code.trim();
        highlightBlock(codeElement);
    } else {
        codeElement.parentElement?.remove();
    }

    const optionsList = fragment.querySelector('[data-quiz-options]');
    const groupName = `quiz-${id}`;
    options.forEach(({ id: optionId, label }) => {
        const optionItem = document.createElement('li');
        const inputId = `${groupName}-${optionId}`;
        optionItem.innerHTML = `
            <label class="quiz-card__option" for="${inputId}">
                <input type="radio" name="${groupName}" id="${inputId}" value="${optionId}">
                <span>${label}</span>
            </label>
        `;
        optionsList.appendChild(optionItem);
    });

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

function cloneTemplate(id) {
    const template = document.getElementById(id);
    if (!template) {
        throw new Error(`Szablon o identyfikatorze "${id}" nie został załadowany.`);
    }
    return template.content.cloneNode(true);
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