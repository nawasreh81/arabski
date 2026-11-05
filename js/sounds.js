/* The "hard sounds" section: Arabic sounds that Polish has no letter for.
   `family` links a group to the sound mistakes tracked in app.js. */
(function () {
  'use strict';

  function W(ar, ph, pl, en) { return { ar, ph, pl, en }; }

  window.AR_SOUNDS = [
    {
      family: 'ain', letters: '\'', title: { pl: 'Dźwięk \' (ajn)', en: 'The \' sound (ayn)' },
      intro: { pl: 'Najbardziej arabski dźwięk. Powstaje głęboko w gardle.', en: 'The most Arabic sound of all. It is made deep in the throat.' },
      like: { pl: 'Ściśnij gardło jak przy lekkim krztuszeniu się i powiedz „a”. Nie jest to zwykła przerwa.', en: 'Tighten your throat as if gagging slightly and say “a”. It is not just a pause.' },
      point: { pl: 'Bez tego dźwięku wiele słów nadal będzie zrozumiałych, więc nie zniechęcaj się. Ćwicz go powoli.', en: 'Many words stay understandable without it, so don’t be discouraged. Practice it slowly.' },
      words: [W('عمري', '\'umri', 'moje życie', 'my life'), W('عربي', '\'arabi', 'arabski', 'Arabic'), W('سعيد', 'sa\'id', 'szczęśliwy', 'happy'), W('عيونك', '\'ujunak', 'twoje oczy', 'your eyes')]
    },
    {
      family: 'ha', letters: 'H · h', title: { pl: 'Dwa dźwięki h', en: 'Two h sounds' },
      intro: { pl: 'Arabski ma mocne H i lekkie h. To dwie różne litery.', en: 'Arabic has a strong H and a light h. They are two different letters.' },
      like: { pl: 'H: chuchnij mocno, jak na zaparowaną szybę, ze ściśniętym gardłem. Lekkie h: jak w angielskim hello.', en: 'H: breathe out hard, as if fogging a window, with a tight throat. Light h: as in English hello.' },
      point: { pl: 'Polskie h jest bliższe dźwiękowi ch. W arabskim H nie ma tarcia z tyłu języka.', en: 'Polish h is closer to ch. Arabic H has no friction at the back of the tongue.' },
      words: [W('حبيبي', 'Habibi', 'kochanie', 'my love'), W('حياتي', 'Hajati', 'moje życie', 'my life'), W('هون', 'hon', 'tutaj', 'here'), W('هلأ', 'halla', 'teraz', 'now')]
    },
    {
      family: 'kh', letters: 'ch · gh', title: { pl: 'Dźwięki ch i gh', en: 'The ch and gh sounds' },
      intro: { pl: 'Ch znasz już z polskiego. Gh to jego dźwięczna wersja.', en: 'You already know ch from Polish. Gh is its voiced version.' },
      like: { pl: 'Ch: jak w słowie chleb. Gh: jak francuskie r lub płukanie gardła.', en: 'Ch: as in Polish chleb. Gh: like a French r, or gargling.' },
      point: { pl: 'Dźwięk ch to twoja przewaga: Polacy wymawiają go naturalnie.', en: 'The ch sound is your advantage: Polish speakers say it naturally.' },
      words: [W('خبز', 'chubz', 'chleb', 'bread'), W('خلص', 'chalas', 'już, dosyć', 'enough, done'), W('خير', 'cher', 'dobro', 'goodness'), W('شغل', 'szughul', 'praca', 'work')]
    },
    {
      family: 'emph', letters: 's · t · d', title: { pl: 'Ciemne s, t, d', en: 'Dark s, t, d' },
      intro: { pl: 'Niektóre s, t, d brzmią w arabskim ciężej i niżej. Zapisujemy je tak samo jak zwykłe.', en: 'Some s, t, d sounds are heavier and lower in Arabic. We write them the same as the plain ones.' },
      like: { pl: 'Cofnij język i lekko zaokrąglij usta, jakby dźwięk miał wyjść z głębi jamy ustnej.', en: 'Pull your tongue back and round your lips a little, as if the sound comes from deep in your mouth.' },
      point: { pl: 'Na początku wystarczy zwykłe s, t, d. Słuchaj męża i naśladuj go.', en: 'At first, plain s, t, d are enough. Listen to your husband and copy him.' },
      words: [W('صباح', 'sabaH', 'poranek', 'morning'), W('طيب', 'tajjib', 'dobry, smaczny', 'good, tasty'), W('صحتين', 'saHtejn', 'smacznego', 'enjoy your meal'), W('طبخ', 'tabach', 'gotował', 'he cooked')]
    }
  ];
})();
