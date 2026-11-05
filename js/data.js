/* Lesson content: Jordanian Arabic for a Polish woman speaking with her husband and his family.
   ar = Arabic spelling, used for the voice and for checking speech. It is never shown to the learner.
   ph = the same sentence in Polish letters, one word for each Arabic word.
   Key: ' = ع, H = ح, h = ه, ch = خ, gh = غ, sz = ش, dż = ج, ł = و, j = ي, g = ق (as said in Jordan). */
(function () {
  'use strict';

  function P(ar, ph, pl, en, notePl, noteEn) {
    const o = { ar, ph, pl, en };
    if (notePl) o.note = { pl: notePl, en: noteEn };
    return o;
  }
  function C(ar, ph, pl, en) { return { c: ar, ph, pl, en }; }
  function U(i) { return { u: i }; }

  const HUSBAND = { pl: 'Mąż', en: 'Husband', he: true };
  const NEIGHBOR = { pl: 'Sąsiadka', en: 'Neighbor' };
  const MOTHER = { pl: 'Teściowa', en: 'Mother-in-law' };
  const GUEST = { pl: 'Gość', en: 'Guest' };

  const START = { pl: 'Początek', en: 'Getting started' };
  const LOVE = { pl: 'Rodzina: mąż', en: 'Family: husband' };
  const PEOPLE = { pl: 'Rodzina i goście', en: 'Family and guests' };

  const LESSONS = [
    {
      id: 'L1', title: { pl: 'Zwroty ratunkowe', en: 'Survival phrases' },
      sub: { pl: 'Gdy nie rozumiesz, co ktoś mówi', en: 'When you don’t understand someone' }, unit: START, who: NEIGHBOR,
      phrases: [
        P('آسفة، ما فهمت.', 'asfe, ma fhimt.', 'Przepraszam, nie zrozumiałam.', 'Sorry, I didn’t understand.',
          'Kobieta mówi asfe, a mężczyzna asef.', 'A woman says asfe; a man says asef.'),
        P('عيدي كمان مرة، لو سمحتي.', '\'idi kaman marra, lał samaHti.', 'Powtórz jeszcze raz, proszę.', 'Say it again, please.',
          'Tak mówisz do kobiety. Do mężczyzny: \'id kaman marra, lał samaHt.', 'This is to a woman. To a man: \'id kaman marra, lał samaHt.'),
        P('احكي شوي شوي.', 'iHki szłej szłej.', 'Mów powoli.', 'Speak slowly.'),
        P('بحكي عربي شوي.', 'baHki \'arabi szłej.', 'Mówię trochę po arabsku.', 'I speak a little Arabic.'),
        P('شو يعني؟', 'szu ja\'ni?', 'Co to znaczy?', 'What does that mean?'),
        P('شكراً كتير!', 'szukran ktir!', 'Bardzo dziękuję!', 'Thank you very much!')
      ],
      dialog: [
        C('أهلا! إنتي جارتنا الجديدة؟', 'ahla! inti dżaritna ildżdide?', 'Cześć! Jesteś naszą nową sąsiadką?', 'Hi! Are you our new neighbor?'), U(0),
        C('بسأل: إنتي ساكنة هون؟', 'bas\'al: inti sakne hon?', 'Pytam: czy tu mieszkasz?', 'I’m asking: do you live here?'), U(1),
        C('إنتي ساكنة هون؟', 'inti sakne hon?', 'Czy tu mieszkasz?', 'Do you live here?'), U(2),
        C('إنتي… ساكنة… هون؟', 'inti… sakne… hon?', 'Czy… tu… mieszkasz?', 'Do… you… live here?'), U(3),
        C('أهلا وسهلا فيكي!', 'ahla ła sahla fiki!', 'Witaj serdecznie!', 'You’re very welcome here!'), U(5)
      ]
    },
    {
      id: 'L2', title: { pl: 'Dzień dobry, kochanie', en: 'Good morning, love' },
      sub: { pl: 'Pierwsze słowa dnia z mężem', en: 'First words of the day with your husband' }, unit: LOVE, who: HUSBAND,
      phrases: [
        P('صباح الخير يا حبيبي.', 'sabaH il-cher ja Habibi.', 'Dzień dobry, kochanie.', 'Good morning, my love.',
          'Do mężczyzny Habibi, do kobiety Habibti.', 'To a man: Habibi. To a woman: Habibti.'),
        P('صباح النور يا عمري.', 'sabaH in-nur ja \'umri.', 'Dzień dobry, moje życie.', 'Good morning, my life.',
          'To stała odpowiedź na sabaH il-cher. Dosłownie: poranek światła.', 'This is the set reply to sabaH il-cher. Literally: morning of light.'),
        P('كيف نمت؟', 'kif nimt?', 'Jak spałeś?', 'How did you sleep?'),
        P('نمت منيح، الحمد لله.', 'nimt mniH, il-Hamdu lillah.', 'Dobrze spałam, dzięki Bogu.', 'I slept well, thank God.'),
        P('بدك قهوة؟', 'biddak gahła?', 'Chcesz kawy?', 'Do you want coffee?'),
        P('يلا، يومك سعيد!', 'jalla, jomak sa\'id!', 'No to miłego dnia!', 'Okay, have a nice day!')
      ],
      dialog: [
        C('صباح الخير يا حبيبتي.', 'sabaH il-cher ja Habibti.', 'Dzień dobry, kochanie.', 'Good morning, my love.'), U(1),
        C('كيف نمتي؟', 'kif nimti?', 'Jak spałaś?', 'How did you sleep?'), U(3),
        C('أنا تعبان شوي.', 'ana ta\'ban szłej.', 'Jestem trochę zmęczony.', 'I’m a little tired.'), U(4),
        C('آه، يسلمو. لازم أروح هلأ.', 'ah, jislamu. lazim aruH halla.', 'Tak, dzięki. Muszę już iść.', 'Yes, thanks. I have to go now.'), U(5)
      ]
    },
    {
      id: 'L3', title: { pl: 'Czułe słowa', en: 'Sweet words' },
      sub: { pl: 'Komplementy dla męża', en: 'Compliments for your husband' }, unit: LOVE, who: HUSBAND,
      phrases: [
        P('إنت حبيبي.', 'inte Habibi.', 'Jesteś moją miłością.', 'You are my love.',
          'Do mężczyzny inte, do kobiety inti.', 'To a man: inte. To a woman: inti.'),
        P('إنت أحلى واحد.', 'inte aHla łaHad.', 'Jesteś najwspanialszy.', 'You are the sweetest one.'),
        P('عيونك حلوين.', '\'ujunak Hiłłin.', 'Masz piękne oczy.', 'Your eyes are beautiful.'),
        P('بموت فيك.', 'bamut fik.', 'Szaleję za tobą.', 'I’m crazy about you.',
          'Dosłownie: umieram w tobie. To czułe, częste wyznanie.', 'Literally: I die in you. It is a common, tender phrase.'),
        P('إنت كل حياتي.', 'inte kull Hajati.', 'Jesteś całym moim życiem.', 'You are my whole life.'),
        P('يا قلبي.', 'ja galbi.', 'Moje serce.', 'My heart.')
      ],
      dialog: [
        C('شو أنا بالنسبة إلك؟', 'szu ana binnisbe ilik?', 'Kim jestem dla ciebie?', 'What am I to you?'), U(4),
        C('وشو كمان؟', 'ła szu kaman?', 'A co jeszcze?', 'And what else?'), U(1),
        C('بتحبيني كتير؟', 'bitHibbini ktir?', 'Bardzo mnie kochasz?', 'Do you love me a lot?'), U(3),
        C('وأنا بحبك يا عمري.', 'ła ana baHibbik ja \'umri.', 'A ja kocham ciebie, moje życie.', 'And I love you, my life.'), U(5)
      ]
    },
    {
      id: 'L4', title: { pl: 'Tęsknota i miłość', en: 'Longing and love' },
      sub: { pl: 'Gdy jesteście daleko od siebie', en: 'When you are apart' }, unit: LOVE, who: HUSBAND,
      phrases: [
        P('بحبك.', 'baHibbak.', 'Kocham cię.', 'I love you.',
          'Do mężczyzny baHibbak. On powie do ciebie baHibbik.', 'To a man: baHibbak. He will say baHibbik to you.'),
        P('اشتقتلك.', 'isztagtillak.', 'Tęskniłam za tobą.', 'I missed you.'),
        P('إنت على بالي.', 'inte \'ala bali.', 'Myślę o tobie.', 'You’re on my mind.'),
        P('ما بقدر أعيش بدونك.', 'ma bagdar a\'isz bidunak.', 'Nie mogę żyć bez ciebie.', 'I can’t live without you.'),
        P('إيمتى بترجع؟', 'emta btirdża\'?', 'Kiedy wrócisz?', 'When will you come back?'),
        P('ارجع بسرعة يا حبيبي.', 'irdża\' bsur\'a ja Habibi.', 'Wracaj szybko, kochanie.', 'Come back soon, my love.')
      ],
      dialog: [
        C('أنا بالشغل. شو أخبارك؟', 'ana biszszughul. szu achbarik?', 'Jestem w pracy. Co u ciebie?', 'I’m at work. How are you?'), U(1),
        C('وأنا كمان اشتقتلك.', 'ła ana kaman isztagtillik.', 'Ja też za tobą tęskniłem.', 'I missed you too.'), U(4),
        C('بعد ساعتين إن شاء الله.', 'ba\'id sa\'tejn in sza allah.', 'Za dwie godziny, jeśli Bóg da.', 'In two hours, God willing.'), U(5),
        C('حاضر يا حبيبتي.', 'Hadir ja Habibti.', 'Dobrze, kochanie.', 'Of course, my love.'), U(0)
      ]
    },
    {
      id: 'L5', title: { pl: 'Dziękuję i doceniam', en: 'Thanks and appreciation' },
      sub: { pl: 'Jak docenić to, co robi mąż', en: 'Appreciating what your husband does' }, unit: LOVE, who: HUSBAND,
      phrases: [
        P('يسلمو إيديك.', 'jislamu idejk.', 'Dziękuję, że to zrobiłeś.', 'Thank you for doing this.',
          'Dosłownie: niech twoje ręce będą zdrowe. Mówi się to komuś, kto coś dla ciebie zrobił.', 'Literally: may your hands be well. Said to someone who made or did something for you.'),
        P('الله يعطيك العافية.', 'allah ja\'tik il-\'afje.', 'Niech Bóg da ci siłę.', 'May God give you strength.',
          'Mówi się to komuś po pracy lub w trakcie pracy.', 'Said to someone who is working or has just finished.'),
        P('تعبت حالك.', 'ta\'abit Halak.', 'Niepotrzebnie się trudziłeś.', 'You went to so much trouble.'),
        P('شكراً يا حبيبي.', 'szukran ja Habibi.', 'Dziękuję, kochanie.', 'Thank you, my love.'),
        P('إنت أحسن جوز.', 'inte aHsan dżoz.', 'Jesteś najlepszym mężem.', 'You’re the best husband.'),
        P('الله يخليك إلي.', 'allah ichallik ili.', 'Niech Bóg zachowa cię dla mnie.', 'May God keep you for me.')
      ],
      dialog: [
        C('عملتلك العشا.', '\'imiltillik il-\'asza.', 'Zrobiłem ci kolację.', 'I made you dinner.'), U(0),
        C('اليوم كان الشغل كتير.', 'il-jom kan iszszughul ktir.', 'Dziś było dużo pracy.', 'There was a lot of work today.'), U(1),
        C('الله يعافيكي.', 'allah ji\'afiki.', 'Niech Bóg da ci zdrowie.', 'May God give you health.'), U(4),
        C('وإنتي أحسن زوجة.', 'ła inti aHsan zodże.', 'A ty jesteś najlepszą żoną.', 'And you’re the best wife.'), U(5)
      ]
    },
    {
      id: 'L6', title: { pl: 'Powitania i uprzejmości', en: 'Greetings and courtesies' },
      sub: { pl: 'Stałe pary pytań i odpowiedzi', en: 'Set questions and replies' }, unit: PEOPLE, who: MOTHER,
      phrases: [
        P('مرحبا، كيفك؟', 'marHaba, kifik?', 'Cześć, jak się masz?', 'Hello, how are you?',
          'Do kobiety kifik, do mężczyzny kifak.', 'To a woman: kifik. To a man: kifak.'),
        P('الحمد لله، تمام.', 'il-Hamdu lillah, tamam.', 'Dzięki Bogu, wszystko dobrze.', 'Thank God, all good.'),
        P('كيف الصحة؟', 'kif is-saHHa?', 'Jak zdrowie?', 'How’s your health?'),
        P('أهلا وسهلا.', 'ahla łasahla.', 'Witaj serdecznie.', 'You’re very welcome.'),
        P('يعطيكي العافية.', 'ja\'tiki il-\'afje.', 'Niech Bóg da ci siłę.', 'May God give you strength.'),
        P('الله يعافيكي.', 'allah ji\'afiki.', 'Niech Bóg da ci zdrowie.', 'May God give you health.',
          'To stała odpowiedź na ja\'tiki il-\'afje.', 'This is the set reply to ja\'tiki il-\'afje.')
      ],
      dialog: [
        C('يا هلا يا بنتي!', 'ja hala ja binti!', 'Witaj, córeczko!', 'Welcome, my daughter!'), U(0),
        C('منيحة، إنتي كيفك؟', 'mniHa, inti kifik?', 'Dobrze, a ty jak się masz?', 'Fine, and how are you?'), U(1),
        C('يعطيكي العافية.', 'ja\'tiki il-\'afje.', 'Niech Bóg da ci siłę.', 'May God give you strength.'), U(5),
        C('الصحة منيحة، الحمد لله. وإنتي؟', 'is-saHHa mniHa, il-Hamdu lillah. ła inti?', 'Zdrowie dobre, dzięki Bogu. A ty?', 'Health is good, thank God. And you?'), U(1)
      ]
    },
    {
      id: 'L7', title: { pl: 'Kawa i gościnność', en: 'Coffee and hospitality' },
      sub: { pl: 'Gdy przychodzą goście', en: 'When guests arrive' }, unit: PEOPLE, who: GUEST,
      phrases: [
        P('تفضلي، ادخلي.', 'tfaddali, udchuli.', 'Proszę, wejdź.', 'Please, come in.',
          'Do kobiety tfaddali, do mężczyzny tfaddal.', 'To a woman: tfaddali. To a man: tfaddal.'),
        P('اقعدي، البيت بيتك.', 'ug\'udi, il-bet betik.', 'Usiądź, czuj się jak u siebie.', 'Sit down, make yourself at home.'),
        P('شو بتشربي؟', 'szu btiszrabi?', 'Czego się napijesz?', 'What would you like to drink?'),
        P('قهوة ولا شاي؟', 'gahła łalla szaj?', 'Kawa czy herbata?', 'Coffee or tea?'),
        P('كيف بدك القهوة؟', 'kif biddik il-gahła?', 'Jaką chcesz kawę?', 'How do you want your coffee?'),
        P('دايمة.', 'dajme.', 'Oby zawsze tak było.', 'May it always be so.',
          'Mówi się to gospodarzowi po wypiciu kawy.', 'Said to the host after finishing coffee.')
      ],
      dialog: [
        C('السلام عليكم!', 'is-salamu \'alejkum!', 'Pokój z wami!', 'Peace be upon you!'), U(0),
        C('يسلمو! بيتكم حلو.', 'jislamu! betkum Hiłu.', 'Dzięki! Macie ładny dom.', 'Thanks! Your home is lovely.'), U(1),
        C('شكراً، إشي بسيط.', 'szukran, iszi basit.', 'Dziękuję, coś prostego.', 'Thanks, something simple.'), U(3),
        C('قهوة، يسلمو.', 'gahła, jislamu.', 'Kawę, dziękuję.', 'Coffee, thanks.'), U(4)
      ]
    },
    {
      id: 'L8', title: { pl: 'Przy stole', en: 'At the table' },
      sub: { pl: 'Co mówi się podczas jedzenia', en: 'What people say during a meal' }, unit: PEOPLE, who: MOTHER,
      phrases: [
        P('الأكل طيب كتير.', 'il-akil tajjib ktir.', 'Jedzenie jest bardzo dobre.', 'The food is very good.'),
        P('صحتين وعافية.', 'saHtejn ła\'afje.', 'Smacznego i na zdrowie.', 'Enjoy, and good health.'),
        P('شبعت، الحمد لله.', 'szbi\'it, il-Hamdu lillah.', 'Najadłam się, dzięki Bogu.', 'I’m full, thank God.',
          'Gospodyni będzie nalegać. To normalne: powtórz to z uśmiechem.', 'The host will insist. That’s normal: repeat it with a smile.'),
        P('بدي شوي كمان.', 'biddi szłej kaman.', 'Chcę jeszcze trochę.', 'I’d like a little more.'),
        P('مين طبخ اليوم؟', 'min tabach il-jom?', 'Kto dziś gotował?', 'Who cooked today?'),
        P('تسلم إيديكي.', 'tislam idejki.', 'Dziękuję za pyszne jedzenie.', 'Thank you for the delicious food.',
          'Dosłownie: niech twoje ręce będą zdrowe. To najlepszy komplement dla kucharki.', 'Literally: may your hands be well. It’s the best compliment for a cook.')
      ],
      dialog: [
        C('كلي يا بنتي، كلي!', 'kuli ja binti, kuli!', 'Jedz, córeczko, jedz!', 'Eat, my daughter, eat!'), U(0),
        C('صحتين! بدك كمان؟', 'saHtejn! biddik kaman?', 'Na zdrowie! Chcesz jeszcze?', 'Enjoy! Do you want more?'), U(3),
        C('أنا طبخت اليوم.', 'ana tabacht il-jom.', 'Ja dziś gotowałam.', 'I cooked today.'), U(5),
        C('كلي كمان شوي!', 'kuli kaman szłej!', 'Zjedz jeszcze trochę!', 'Eat a little more!'), U(2)
      ]
    },
    {
      id: 'L9', title: { pl: 'Rodzina', en: 'Family' },
      sub: { pl: 'Jak mówić o bliskich', en: 'Talking about relatives' }, unit: PEOPLE, who: NEIGHBOR,
      phrases: [
        P('هادا جوزي.', 'hada dżozi.', 'To mój mąż.', 'This is my husband.'),
        P('هاي حماتي.', 'haj Hamati.', 'To moja teściowa.', 'This is my mother-in-law.'),
        P('عندي ولاد.', '\'indi ulad.', 'Mam dzieci.', 'I have children.'),
        P('أهلك كيفهم؟', 'ahlik kifhum?', 'Jak się ma twoja rodzina?', 'How is your family?'),
        P('سلميلي عليهم.', 'sallimili \'alejhum.', 'Pozdrów ich ode mnie.', 'Say hello to them for me.'),
        P('العيلة أهم إشي.', 'il-\'ejle ahamm iszi.', 'Rodzina jest najważniejsza.', 'Family is the most important thing.')
      ],
      dialog: [
        C('مين هادا؟', 'min hada?', 'Kto to jest?', 'Who is this?'), U(0),
        C('وهاي مين؟', 'ła haj min?', 'A to kto?', 'And who is this?'), U(1),
        C('عندك ولاد؟', '\'indik ulad?', 'Masz dzieci?', 'Do you have children?'), U(2),
        C('ما شاء الله! الله يخليهم.', 'ma sza allah! allah ichallihum.', 'Wspaniale! Niech Bóg ich chroni.', 'How wonderful! May God keep them.'), U(5)
      ]
    },
    {
      id: 'L10', title: { pl: 'Dom na co dzień', en: 'Everyday home life' },
      sub: { pl: 'Zwykłe sprawy z mężem', en: 'Ordinary things with your husband' }, unit: LOVE, who: HUSBAND,
      phrases: [
        P('شو بدك نطبخ اليوم؟', 'szu biddak nutbuch il-jom?', 'Co chcesz, żebyśmy dziś ugotowali?', 'What do you want us to cook today?'),
        P('وين المفتاح؟', 'łen il-miftaH?', 'Gdzie jest klucz?', 'Where is the key?'),
        P('جيب خبز معك.', 'dżib chubz ma\'ak.', 'Przynieś ze sobą chleb.', 'Bring some bread with you.'),
        P('أنا تعبانة شوي.', 'ana ta\'bane szłej.', 'Jestem trochę zmęczona.', 'I’m a little tired.',
          'Kobieta mówi ta\'bane, a mężczyzna ta\'ban.', 'A woman says ta\'bane; a man says ta\'ban.'),
        P('ساعدني لو سمحت.', 'sa\'idni lał samaHt.', 'Pomóż mi, proszę.', 'Help me, please.'),
        P('خلص، هلأ بجي.', 'chalas, halla badżi.', 'Dobrze, zaraz przyjdę.', 'Okay, I’m coming now.')
      ],
      dialog: [
        C('جعت يا حبيبتي.', 'dżu\'it ja Habibti.', 'Zgłodniałem, kochanie.', 'I’m hungry, my love.'), U(0),
        C('زي ما بدك. بدي أطلع هلأ.', 'zej ma biddik. biddi atla\' halla.', 'Jak chcesz. Wychodzę teraz.', 'Whatever you like. I’m going out now.'), U(1),
        C('لقيته. بدك إشي من السوق؟', 'lagetu. biddik iszi min is-sug?', 'Znalazłem go. Chcesz coś z targu?', 'Found it. Do you want anything from the market?'), U(2),
        C('ماشي. مالك؟', 'maszi. malik?', 'Dobrze. Co ci jest?', 'Okay. What’s wrong?'), U(3)
      ]
    },
    {
      id: 'L11', title: { pl: 'Święta i ważne chwile', en: 'Holidays and big moments' },
      sub: { pl: 'Wesele, święto, kondolencje', en: 'Weddings, holidays, condolences' }, unit: PEOPLE, who: NEIGHBOR,
      phrases: [
        P('مبروك!', 'mabruk!', 'Gratulacje!', 'Congratulations!'),
        P('الله يبارك فيكي.', 'allah ibarik fiki.', 'Niech Bóg ci błogosławi.', 'May God bless you.',
          'To stała odpowiedź na mabruk.', 'This is the set reply to mabruk.'),
        P('كل عام وإنتو بخير.', 'kull \'am łintu bcher.', 'Wszystkiego dobrego z okazji święta.', 'Happy holiday to you all.'),
        P('عظم الله أجركم.', '\'azzam allah adżrakum.', 'Moje kondolencje.', 'My condolences.',
          'Tak mówi się rodzinie zmarłego.', 'This is said to the family of someone who has died.'),
        P('الله يرحمه.', 'allah jirHamu.', 'Niech Bóg ma go w opiece.', 'May God have mercy on him.'),
        P('الحمد لله عالسلامة.', 'il-Hamdu lillah \'as-salame.', 'Dobrze, że wróciłaś cała i zdrowa.', 'Glad you’re back safely.')
      ],
      dialog: [
        C('بنتي تجوزت!', 'binti tdżałzat!', 'Moja córka wyszła za mąż!', 'My daughter got married!'), U(0),
        C('بكرا العيد!', 'bukra il-\'id!', 'Jutro jest święto!', 'Tomorrow is the holiday!'), U(2),
        C('توفى عمي امبارح.', 'tłaffa \'ammi imbariH.', 'Mój wujek zmarł wczoraj.', 'My uncle died yesterday.'), U(3),
        C('رجعت من السفر اليوم.', 'rdża\'it min is-safar il-jom.', 'Wróciłam dziś z podróży.', 'I got back from my trip today.'), U(5)
      ]
    },
    {
      id: 'L12', title: { pl: 'Przepraszam i dobranoc', en: 'Sorry and good night' },
      sub: { pl: 'Godzenie się i koniec dnia', en: 'Making up and ending the day' }, unit: LOVE, who: HUSBAND,
      phrases: [
        P('سامحني يا حبيبي.', 'samiHni ja Habibi.', 'Wybacz mi, kochanie.', 'Forgive me, my love.'),
        P('ما كان قصدي.', 'ma kan gasdi.', 'Nie chciałam tego.', 'I didn’t mean it.'),
        P('إنت زعلان مني؟', 'inte za\'lan minni?', 'Gniewasz się na mnie?', 'Are you upset with me?'),
        P('خلص، ننسى.', 'chalas, ninsa.', 'Dobrze, zapomnijmy o tym.', 'Okay, let’s forget it.'),
        P('تصبح على خير.', 'tisbaH \'ala cher.', 'Dobranoc.', 'Good night.',
          'Do mężczyzny tisbaH, do kobiety tisbaHi.', 'To a man: tisbaH. To a woman: tisbaHi.'),
        P('وإنت من أهله.', 'łinte min ahlu.', 'Dobranoc (odpowiedź).', 'Good night (reply).',
          'To stała odpowiedź na tisbaH \'ala cher.', 'This is the set reply to tisbaH \'ala cher.')
      ],
      dialog: [
        C('ليش هيك حكيتي؟', 'lesz hejk Hakejti?', 'Dlaczego tak powiedziałaś?', 'Why did you say that?'), U(1),
        C('زعلت شوي.', 'zi\'ilit szłej.', 'Trochę się zdenerwowałem.', 'I got a little upset.'), U(0),
        C('ماشي يا عمري.', 'maszi ja \'umri.', 'Dobrze, moje życie.', 'Okay, my life.'), U(3),
        C('تصبحي على خير.', 'tisbaHi \'ala cher.', 'Dobranoc.', 'Good night.'), U(5)
      ]
    }
  ];

  const LATER = [
    { title: { pl: 'Zakupy i targ', en: 'Shopping and the market' }, sub: { pl: 'liczby, ceny, targowanie', en: 'numbers, prices, bargaining' } },
    { title: { pl: 'Dzieci', en: 'Children' }, sub: { pl: 'szkoła, zabawa, dyscyplina', en: 'school, play, discipline' } },
    { title: { pl: 'Lekarz i zdrowie', en: 'Doctor and health' }, sub: { pl: 'ból, leki, wizyty', en: 'pain, medicine, visits' } }
  ];

  window.AR_DATA = { LESSONS, LATER };
})();
