const firstTab = document.querySelector('[data-news-tab]');
const tabList = firstTab?.closest('[role="tablist"]');

if (tabList) {
  const tabs = [...tabList.querySelectorAll('[data-news-tab]')];
  const newsSection = tabList.closest('.cola-news');
  const items = [...(newsSection?.querySelectorAll('[data-news-item]') ?? [])];

  if (!tabs.length) {
    // The page remains fully readable when there are no month tabs.
  } else {
    const selectMonth = (month) => {
      tabs.forEach((tab) => {
        const selected = tab.dataset.newsTab === month;
        tab.classList.toggle('is-selected', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      items.forEach((item) => {
        item.hidden = item.dataset.newsItem !== month;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => selectMonth(tab.dataset.newsTab));
      tab.addEventListener('keydown', (event) => {
        const isPrevious = event.key === 'ArrowLeft';
        const isNext = event.key === 'ArrowRight';
        const isFirst = event.key === 'Home';
        const isLast = event.key === 'End';
        if (!isPrevious && !isNext && !isFirst && !isLast) return;

        event.preventDefault();
        const currentIndex = tabs.indexOf(tab);
        let nextIndex = currentIndex;
        if (isFirst) nextIndex = 0;
        if (isLast) nextIndex = tabs.length - 1;
        if (isPrevious) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        if (isNext) nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        selectMonth(tabs[nextIndex].dataset.newsTab);
      });
    });

    selectMonth(tabs[0].dataset.newsTab);
  }
}
