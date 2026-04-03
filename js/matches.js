
const matches = {
  1: {
    title: "Алмаз-Антей — Динамо-Минск",
    stage: "Кубок Бурчалкина / Группа A / 1 тур",
    date: "16 мая 2025, 10:00",
    venue: "Стадион «Алмаз-Антей»",
    status: "Прямой эфир",
    score: "—",
    videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    summary: "На странице матча можно показывать прямой эфир или запись игры. Замените ссылку videoUrl на embed-ссылку YouTube.",
    events: ["Открытие эфира — за 10 минут до матча","1 тайм — 10:00","Перерыв","2 тайм — 10:35"]
  },
  2: {
    title: "Зенит — Кайрат",
    stage: "Кубок Бурчалкина / Группа B / 1 тур",
    date: "16 мая 2025, 12:00",
    venue: "Главное поле",
    status: "Запись",
    score: "2:0",
    videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    summary: "Здесь можно размещать запись матча, короткий протокол и события встречи.",
    events: ["14' — 1:0","52' — 2:0","Финальный свисток"]
  },
  3: {
    title: "Палмейрас — Сан-Лоренсо",
    stage: "Кубок Бурчалкина / Группа B / 1 тур",
    date: "16 мая 2025, 14:00",
    venue: "Поле №2",
    status: "Скоро",
    score: "—",
    videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    summary: "До начала матча здесь можно показывать заглушку, а после — запись встречи.",
    events: ["Эфир стартует за 10 минут до игры"]
  }
};

function renderMatchPage(){
  const root = document.getElementById('match-root');
  if(!root) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || '1';
  const m = matches[id];
  if(!m){
    root.innerHTML = '<section class="section"><div class="container card"><h2>Матч не найден</h2><p class="muted">Проверьте ID матча в ссылке.</p></div></section>';
    return;
  }
  const badgeClass = m.status === 'Прямой эфир' ? 'badge-live' : (m.status === 'Запись' ? 'badge-done' : 'badge-soon');
  root.innerHTML = `
    <section class="page-head">
      <div class="container">
        <span class="badge ${badgeClass}">${m.status}</span>
        <h1>${m.title}</h1>
        <p>${m.stage}</p>
      </div>
    </section>
    <section class="section">
      <div class="container grid-2">
        <div class="card">
          <iframe class="video" src="${m.videoUrl}" title="${m.title}" allowfullscreen></iframe>
        </div>
        <div class="card">
          <h3>Информация о матче</h3>
          <p><b>Дата:</b> ${m.date}</p>
          <p><b>Стадион:</b> ${m.venue}</p>
          <p><b>Счёт:</b> ${m.score}</p>
          <p>${m.summary}</p>
          <div class="buttons">
            <a class="btn btn-primary" href="streams.html">Все трансляции</a>
            <a class="btn btn-secondary" href="matches.html">Ко всем матчам</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section timeline">
      <div class="container card">
        <h3>Ход матча</h3>
        ${m.events.map(item => `<div class="mini">${item}</div>`).join('')}
      </div>
    </section>
  `;
}
document.addEventListener('DOMContentLoaded', renderMatchPage);
