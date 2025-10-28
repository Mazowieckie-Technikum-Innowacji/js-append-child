class CustomComponent {
    constructor({ title, body, badge, icon } = {}) {
        this.title = title ?? 'Komponent DOM';
        this.body = body ?? '';
        this.badge = badge ?? '';
        this.icon = icon ?? '🌐';
    }

    render() {
        const article = document.createElement('article');
        article.className = 'lesson-card custom-component';

        const header = document.createElement('header');
        header.className = 'lesson-card__header';

        const badge = document.createElement('span');
        badge.className = 'lesson-card__badge';
        badge.textContent = this.badge;

        const title = document.createElement('h2');
        title.innerHTML = `${this.icon} ${this.title}`;

        const paragraph = document.createElement('p');
        paragraph.textContent = this.body;

        header.append(badge, title);
        article.append(header, paragraph);

        return article;
    }
}

export default CustomComponent;