import CustomComponent from './components/CustomComponent.js';
import {
    ACTION_SNIPPETS,
    ensureTemplateLoaded,
    createLessonCard,
    highlightBlock,
    loadState,
    persistState,
    setVisitCookie,
    createElement
} from './utils/domUtils.js';

const STORAGE_KEY = 'dom-playground-state';
const DEFAULT_STATE = { action: 'appendChild', tag: 'li', text: 'Nowy element' };

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await ensureTemplateLoaded('./templates/template.html');
        initHero();
        initLessons();
        initPlayground();
        hydrateFooter();
        initStartButton();
    } catch (error) {
        console.error('Wystąpił problem podczas inicjalizacji aplikacji.', error);
    }
});

function initHero() {
    const container = document.getElementById('lessonContainer');
    const introCard = new CustomComponent({
        title: 'appendChild i przyjaciele',
        body: 'Poznaj podstawowe metody manipulacji DOM w praktycznym playgroundzie. Eksperymentuj i obserwuj zmiany na żywo.',
        badge: 'Start',
        icon: '✨'
    });
    container.appendChild(introCard.render());
}

function initLessons() {
    const lessons = [
        {
            title: 'appendChild()',
            description: 'Dodaje nowy węzeł jako ostatnie dziecko danego rodzica.',
            badge: 'Podstawy',
            code: ACTION_SNIPPETS.appendChild('li', 'Nowy element')
        },
        {
            title: 'insertBefore()',
            description: 'Wstawia nowy węzeł przed wskazanym dzieckiem.',
            badge: 'Kontrola pozycji',
            code: ACTION_SNIPPETS.insertBefore('li', 'Wstaw przed pierwszym')
        },
        {
            title: 'replaceChild()',
            description: 'Zastępuje jedno z dzieci nowym węzłem.',
            badge: 'Edycja',
            code: ACTION_SNIPPETS.replaceChild('li', 'Zmieniony element')
        },
        {
            title: 'removeChild()',
            description: 'Usuwa konkretne dziecko z drzewa DOM.',
            badge: 'Sprzątanie',
            code: ACTION_SNIPPETS.removeChild()
        }
    ];

    const container = document.getElementById('lessonContainer');
    const fragment = document.createDocumentFragment();
    lessons.forEach((lesson) => fragment.appendChild(createLessonCard(lesson)));
    container.appendChild(fragment);
}

function initPlayground() {
    const state = loadState(STORAGE_KEY, DEFAULT_STATE);
    const actionSelector = document.getElementById('actionSelector');
    const nodeText = document.getElementById('nodeText');
    const nodeTag = document.getElementById('nodeTag');
    const codeSnippet = document.getElementById('codeSnippet');

    actionSelector.value = state.action;
    nodeText.value = state.text;
    nodeTag.value = state.tag;

    const renderSnippet = () => {
        const currentAction = actionSelector.value;
        const currentTag = sanitizeTag(nodeTag.value) || DEFAULT_STATE.tag;
        const currentText = nodeText.value.trim() || DEFAULT_STATE.text;
        const snippetBuilder = ACTION_SNIPPETS[currentAction];
        codeSnippet.textContent = snippetBuilder(currentTag, currentText);
        highlightBlock(codeSnippet);
        persistState(STORAGE_KEY, { action: currentAction, tag: currentTag, text: currentText });
    };

    document.getElementById('runAction').addEventListener('click', () => {
        const currentAction = actionSelector.value;
        const currentTag = sanitizeTag(nodeTag.value) || DEFAULT_STATE.tag;
        const currentText = nodeText.value.trim() || DEFAULT_STATE.text;
        runDomAction(currentAction, currentTag, currentText);
        renderSnippet();
    });

    document.getElementById('resetPlayground').addEventListener('click', () => {
        resetPreview();
        renderSnippet();
    });

    actionSelector.addEventListener('change', renderSnippet);
    nodeText.addEventListener('input', debounce(renderSnippet, 150));
    nodeTag.addEventListener('input', debounce(renderSnippet, 150));

    resetPreview();
    renderSnippet();
}

function initStartButton() {
    const startButton = document.getElementById('startLessonBtn');
    const playground = document.getElementById('playground');
    if (!startButton || !playground) {
        return;
    }

    startButton.addEventListener('click', () => {
        playground.scrollIntoView({ behavior: 'smooth' });
    });
}

function hydrateFooter() {
    const visitCount = setVisitCookie();
    const footer = document.querySelector('.footer');
    if (!footer) {
        return;
    }

    const info = createElement('p', {}, `Odwiedzasz to demo po raz ${visitCount}. Twoje preferencje zapisujemy w localStorage.`);
    footer.appendChild(info);
}

function runDomAction(action, tagName, textContent) {
    const parent = document.getElementById('previewList');
    if (!parent) {
        return;
    }

    if (action === 'removeChild') {
        const target = parent.lastElementChild;
        if (target) {
            parent.removeChild(target);
        }
        return;
    }

    const node = document.createElement(tagName);
    node.textContent = textContent;
    node.classList.add('preview-list__item');

    if (action === 'appendChild') {
        parent.appendChild(node);
    } else if (action === 'insertBefore') {
        parent.insertBefore(node, parent.firstElementChild);
    } else if (action === 'replaceChild') {
        const target = parent.lastElementChild;
        if (target) {
            parent.replaceChild(node, target);
        } else {
            parent.appendChild(node);
        }
    }

    node.classList.add('is-new');
    setTimeout(() => node.classList.remove('is-new'), 900);
}

function resetPreview() {
    const parent = document.getElementById('previewList');
    if (!parent) {
        return;
    }

    parent.innerHTML = '';
    ['Element A', 'Element B', 'Element C'].forEach((label) => {
        const item = document.createElement('li');
        item.textContent = label;
        item.className = 'preview-list__item';
        parent.appendChild(item);
    });
}

function sanitizeTag(tag) {
    return tag.replace(/[^a-z0-9-]/gi, '').toLowerCase();
}

function debounce(callback, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    };
}