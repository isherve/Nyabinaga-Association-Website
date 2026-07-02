// Full translations for the group ("amatsinda") content and shared phrases so
// that choosing a language shows the ENTIRE site in that language (no mixing).
//
// Keyed by the exact English source string -> { fr, rw }. The helper `tp()` in
// groups.js looks up a string and returns the chosen language, falling back to
// the original English if a translation is missing.
//
// Note: proper names (group names) are left untranslated by design.

export const phraseTranslations = {
  // ---- Tags ----
  Trade: { fr: 'Commerce', rw: 'Ubucuruzi' },
  Gas: { fr: 'Gaz', rw: 'Gazi' },
  Food: { fr: 'Alimentation', rw: 'Ibiribwa' },
  Livestock: { fr: 'Élevage', rw: 'Ubworozi' },
  Savings: { fr: 'Épargne', rw: 'Ubwizigame' },
  Farming: { fr: 'Agriculture', rw: 'Ubuhinzi' },
  Vegetables: { fr: 'Légumes', rw: 'Imboga' },
  Coffee: { fr: 'Café', rw: 'Ikawa' },
  Tomatoes: { fr: 'Tomates', rw: 'Inyanya' },
  Maize: { fr: 'Maïs', rw: 'Ibigori' },
  Beans: { fr: 'Haricots', rw: 'Ibishyimbo' },
  Crafts: { fr: 'Artisanat', rw: 'Ubukorikori' },
  Soap: { fr: 'Savon', rw: 'Isabune' },
  Poultry: { fr: 'Volaille', rw: 'Inkoko' },
  Weaving: { fr: 'Tissage', rw: 'Kuboha' },
  Rice: { fr: 'Riz', rw: 'Umuceri' },
  Forestry: { fr: 'Sylviculture', rw: 'Amashyamba' },
  Retail: { fr: 'Détail', rw: 'Ubudandaza' },
  Registered: { fr: 'Enregistré', rw: 'Byanditswe' },

  // ---- Activities ----
  'Gas trading (cooking gas) & food trading': {
    fr: 'Commerce de gaz (gaz de cuisine) et de produits alimentaires',
    rw: 'Ubucuruzi bwa gazi (gazi yo guteka) n\'ibiribwa',
  },
  'Pig farming': { fr: 'Élevage de porcs', rw: 'Ubworozi bw\'ingurube' },
  'Farming & vegetable trade': {
    fr: 'Agriculture et commerce de légumes',
    rw: 'Ubuhinzi n\'ubucuruzi bw\'imboga',
  },
  'Sugarcane, cassava farming & goat rearing': {
    fr: 'Canne à sucre, culture du manioc et élevage de chèvres',
    rw: 'Ibisheke, ubuhinzi bw\'imyumbati n\'ubworozi bw\'ihene',
  },
  'Coffee, tomato, cassava & banana farming': {
    fr: 'Culture de café, tomates, manioc et bananes',
    rw: 'Ubuhinzi bw\'ikawa, inyanya, imyumbati n\'ibitoki',
  },
  'Coffee, tomato farming & cassava trade': {
    fr: 'Culture de café, tomates et commerce de manioc',
    rw: 'Ubuhinzi bw\'ikawa, inyanya n\'ubucuruzi bw\'imyumbati',
  },
  'Maize, beans & soy farming': {
    fr: 'Culture de maïs, haricots et soja',
    rw: 'Ubuhinzi bw\'ibigori, ibishyimbo na soya',
  },
  'Liquid soap production': {
    fr: 'Production de savon liquide',
    rw: 'Gukora isabune y\'amazi',
  },
  'Basket & handicraft weaving; rice farming': {
    fr: 'Vannerie et artisanat ; culture du riz',
    rw: 'Kuboha ibiseke n\'ubukorikori; ubuhinzi bw\'umuceri',
  },
  'Soy & beans farming, forestry': {
    fr: 'Culture de soja et haricots, sylviculture',
    rw: 'Ubuhinzi bwa soya n\'ibishyimbo, amashyamba',
  },
  'Small joint retail trade': {
    fr: 'Petit commerce de détail collectif',
    rw: 'Ubucuruzi buto rusange bw\'ubudandaza',
  },
  'Registered livelihood group': {
    fr: 'Groupe de subsistance enregistré',
    rw: 'Itsinda ry\'ubuzima ryanditswe',
  },

  // ---- Highlights ----
  'Owns 123 gas cylinders and 2 sales buildings': {
    fr: 'Possède 123 bouteilles de gaz et 2 bâtiments de vente',
    rw: 'Bafite amacupa ya gazi 123 n\'inyubako 2 zo kugurishiramo',
  },
  '25 members saving 25,000 RWF/week together': {
    fr: '25 membres épargnant 25 000 FRW/semaine ensemble',
    rw: 'Abanyamuryango 25 bazigama 25,000 FRW/icyumweru hamwe',
  },
  'Supplies vegetables to the project every week': {
    fr: 'Fournit des légumes au projet chaque semaine',
    rw: 'Batanga imboga ku mushinga buri cyumweru',
  },
  '23 goats and 100 coffee trees': {
    fr: '23 chèvres et 100 caféiers',
    rw: 'Ihene 23 n\'ibiti by\'ikawa 100',
  },
  '1,050 coffee trees — the largest group by assets': {
    fr: '1 050 caféiers — le groupe le plus riche en actifs',
    rw: 'Ibiti by\'ikawa 1,050 — itsinda rifite umutungo munini kurusha ayandi',
  },
  'Coffee, cassava trade and pig farming combined': {
    fr: 'Café, commerce de manioc et élevage de porcs réunis',
    rw: 'Ikawa, ubucuruzi bw\'imyumbati n\'ubworozi bw\'ingurube bihujwe',
  },
  'Grows maize, beans, soy, carrots and onions': {
    fr: 'Cultive maïs, haricots, soja, carottes et oignons',
    rw: 'Bahinga ibigori, ibishyimbo, soya, karoti n\'ibitunguru',
  },
  '15 members making liquid soap & raising 30 chickens': {
    fr: '15 membres fabriquant du savon liquide et élevant 30 poules',
    rw: 'Abanyamuryango 15 bakora isabune y\'amazi kandi barera inkoko 30',
  },
  '10 sacks of rice plus handwoven crafts': {
    fr: '10 sacs de riz et artisanat tissé à la main',
    rw: 'Imifuka 10 y\'umuceri n\'ubukorikori bwabohewe intoki',
  },
  'Started with only a name — now owns a growing herd': {
    fr: 'Parti d\'un simple nom — possède désormais un troupeau grandissant',
    rw: 'Batangiye n\'izina gusa — none bafite umukumbi ugenda wiyongera',
  },
  'Owns a forest plot generating forestry income': {
    fr: 'Possède une parcelle forestière générant des revenus',
    rw: 'Bafite ishyamba ribyara inyungu z\'amashyamba',
  },
  'Shared shop selling grains, oil, vegetables & fruit': {
    fr: 'Boutique commune vendant céréales, huile, légumes et fruits',
    rw: 'Iduka rusange rigurisha imyaka, amavuta, imboga n\'imbuto',
  },
  'A legally registered member group': {
    fr: 'Un groupe membre légalement enregistré',
    rw: 'Itsinda rinyamuryango ryanditswe mu buryo bwemewe',
  },

  // ---- Savings lines ----
  'Each member saves 1,000 RWF/week (100,000 RWF/month combined)': {
    fr: 'Chaque membre épargne 1 000 FRW/semaine (100 000 FRW/mois au total)',
    rw: 'Buri munyamuryango azigama 1,000 FRW/icyumweru (100,000 FRW/ukwezi hamwe)',
  },
  'Each member saves 1,000 RWF/month (23,000 RWF/month combined)': {
    fr: 'Chaque membre épargne 1 000 FRW/mois (23 000 FRW/mois au total)',
    rw: 'Buri munyamuryango azigama 1,000 FRW/ukwezi (23,000 FRW/ukwezi hamwe)',
  },
  'Each member saves 2,000 RWF/month (26,000 RWF/month combined)': {
    fr: 'Chaque membre épargne 2 000 FRW/mois (26 000 FRW/mois au total)',
    rw: 'Buri munyamuryango azigama 2,000 FRW/ukwezi (26,000 FRW/ukwezi hamwe)',
  },
  'Grew from 500 to 1,000 RWF/month per member (15,000 RWF/month combined)': {
    fr: 'Passé de 500 à 1 000 FRW/mois par membre (15 000 FRW/mois au total)',
    rw: 'Byavuye kuri 500 bigera kuri 1,000 FRW/ukwezi kuri buri munyamuryango (15,000 FRW/ukwezi hamwe)',
  },
  'Each member saves 1,000 RWF/month (9,000 RWF/month combined)': {
    fr: 'Chaque membre épargne 1 000 FRW/mois (9 000 FRW/mois au total)',
    rw: 'Buri munyamuryango azigama 1,000 FRW/ukwezi (9,000 FRW/ukwezi hamwe)',
  },
  'Each member saves 5,100 RWF/month': {
    fr: 'Chaque membre épargne 5 100 FRW/mois',
    rw: 'Buri munyamuryango azigama 5,100 FRW/ukwezi',
  },

  // ---- Details ----
  'Owns 123 gas cylinders/bottles (valued at 3,728,000 RWF), 2 buildings used for gas sales (1,361,040 RWF), a boutique/shop business (458,960 RWF), cooking equipment (950,000 RWF), and working capital in their food business (905,600 RWF).':
    {
      fr: 'Possède 123 bouteilles de gaz (évaluées à 3 728 000 FRW), 2 bâtiments servant à la vente de gaz (1 361 040 FRW), une boutique (458 960 FRW), du matériel de cuisine (950 000 FRW) et un fonds de roulement dans leur commerce alimentaire (905 600 FRW).',
      rw: 'Bafite amacupa ya gazi 123 (afite agaciro ka 3,728,000 FRW), inyubako 2 zikoreshwa mu kugurisha gazi (1,361,040 FRW), ubucuruzi bwa butike (458,960 FRW), ibikoresho byo guteka (950,000 FRW), n\'imari ikoreshwa mu bucuruzi bw\'ibiribwa (905,600 FRW).',
    },
  'Group of 25 members, each saving 1,000 RWF/week (25,000 RWF/week combined, 100,000 RWF/month). Recently one of their sows gave birth to 9 piglets.':
    {
      fr: 'Groupe de 25 membres, chacun épargnant 1 000 FRW/semaine (25 000 FRW/semaine au total, 100 000 FRW/mois). Récemment, une de leurs truies a donné naissance à 9 porcelets.',
      rw: 'Itsinda ry\'abanyamuryango 25, buri wese azigama 1,000 FRW/icyumweru (25,000 FRW/icyumweru hamwe, 100,000 FRW/ukwezi). Vuba aha imwe mu ngurube zabo yabyaye ingurube nto 9.',
    },
  'Owns 3 farm plots (one worth 1,800,000 RWF planted with sugarcane valued at 650,000 RWF; another worth 850,000 RWF earmarked for coffee). The group sells vegetables and cabbage weekly, supplying the project itself, earning about 68,500 RWF/month. They also rent 3 additional plots (150,000 RWF) planted with carrots, cabbage and seedlings, plus a sugarcane plot (1,250,000 RWF).':
    {
      fr: 'Possède 3 parcelles (une de 1 800 000 FRW plantée de canne à sucre évaluée à 650 000 FRW ; une autre de 850 000 FRW destinée au café). Le groupe vend chaque semaine des légumes et du chou, approvisionnant le projet lui-même, gagnant environ 68 500 FRW/mois. Il loue aussi 3 parcelles supplémentaires (150 000 FRW) plantées de carottes, chou et semis, plus une parcelle de canne à sucre (1 250 000 FRW).',
      rw: 'Bafite imirima 3 (umwe ufite agaciro ka 1,800,000 FRW watewemo ibisheke bifite agaciro ka 650,000 FRW; undi ufite agaciro ka 850,000 FRW wagenewe ikawa). Itsinda rigurisha imboga n\'amashu buri cyumweru, rihaza umushinga ubwawo, ryinjiza hafi 68,500 FRW/ukwezi. Bakodesha kandi imirima 3 y\'inyongera (150,000 FRW) yatewemo karoti, amashu n\'imbuto, hamwe n\'umurima w\'ibisheke (1,250,000 FRW).',
    },
  '23 members, each saving 1,000 RWF/month (23,000 RWF/month combined). Owns 23 goats (4,255,000 RWF), 100 coffee trees (1,800,000 RWF), 1 pig (315,000 RWF), sugarcane harvested twice a year (600,000 RWF), and income from coffee harvest (350,000 RWF).':
    {
      fr: '23 membres, chacun épargnant 1 000 FRW/mois (23 000 FRW/mois au total). Possède 23 chèvres (4 255 000 FRW), 100 caféiers (1 800 000 FRW), 1 porc (315 000 FRW), de la canne à sucre récoltée deux fois par an (600 000 FRW) et des revenus de la récolte de café (350 000 FRW).',
      rw: 'Abanyamuryango 23, buri wese azigama 1,000 FRW/ukwezi (23,000 FRW/ukwezi hamwe). Bafite ihene 23 (4,255,000 FRW), ibiti by\'ikawa 100 (1,800,000 FRW), ingurube 1 (315,000 FRW), ibisheke bisaruwa kabiri mu mwaka (600,000 FRW), n\'inyungu ziva mu isarura ry\'ikawa (350,000 FRW).',
    },
  '13 members, each saving 2,000 RWF/month (26,000 RWF/month combined). They also grow mulching grass to protect their coffee plants. Owns 4 farm plots (total 9,830,000 RWF), a tomato plot (407,000 RWF), 1,050 coffee trees (15,750,000 RWF), and 2 goats (306,400 RWF). Recent harvest income: 550,000 RWF (tomatoes) and 600,000 RWF (coffee).':
    {
      fr: '13 membres, chacun épargnant 2 000 FRW/mois (26 000 FRW/mois au total). Ils cultivent aussi de l\'herbe de paillage pour protéger leurs caféiers. Possède 4 parcelles (total 9 830 000 FRW), une parcelle de tomates (407 000 FRW), 1 050 caféiers (15 750 000 FRW) et 2 chèvres (306 400 FRW). Revenus récents : 550 000 FRW (tomates) et 600 000 FRW (café).',
      rw: 'Abanyamuryango 13, buri wese azigama 2,000 FRW/ukwezi (26,000 FRW/ukwezi hamwe). Bahinga kandi ubwatsi bwo gutwikira ngo barinde ibiti byabo by\'ikawa. Bafite imirima 4 (yose hamwe 9,830,000 FRW), umurima w\'inyanya (407,000 FRW), ibiti by\'ikawa 1,050 (15,750,000 FRW), n\'ihene 2 (306,400 FRW). Inyungu z\'isarura riheruka: 550,000 FRW (inyanya) na 600,000 FRW (ikawa).',
    },
  'Owns a tomato plot (538,400 RWF), 134 coffee trees (1,608,000 RWF), and pays 180,000 RWF/month for fertilizer. Owns a farm (1,980,000 RWF), a cassava trading business (980,000 RWF), pig farming (360,000 RWF), and recent harvest income of 780,000 RWF (coffee).':
    {
      fr: 'Possède une parcelle de tomates (538 400 FRW), 134 caféiers (1 608 000 FRW) et paie 180 000 FRW/mois d\'engrais. Possède une ferme (1 980 000 FRW), un commerce de manioc (980 000 FRW), un élevage de porcs (360 000 FRW) et des revenus récents de 780 000 FRW (café).',
      rw: 'Bafite umurima w\'inyanya (538,400 FRW), ibiti by\'ikawa 134 (1,608,000 FRW), kandi batanga 180,000 FRW/ukwezi ku ifumbire. Bafite umurima (1,980,000 FRW), ubucuruzi bw\'imyumbati (980,000 FRW), ubworozi bw\'ingurube (360,000 FRW), n\'inyungu z\'isarura riheruka za 780,000 FRW (ikawa).',
    },
  'Rents 2 farm plots (267,000 RWF and 365,000 RWF), owns 1 plot (1,650,000 RWF), a maize harvest worth 450,000 RWF, an internal loan fund of 354,000 RWF, a beans harvest of 168,000 RWF, and a carrot/onion plot (620,000 RWF).':
    {
      fr: 'Loue 2 parcelles (267 000 FRW et 365 000 FRW), possède 1 parcelle (1 650 000 FRW), une récolte de maïs de 450 000 FRW, un fonds de prêt interne de 354 000 FRW, une récolte de haricots de 168 000 FRW et une parcelle de carottes/oignons (620 000 FRW).',
      rw: 'Bakodesha imirima 2 (267,000 FRW na 365,000 FRW), bafite umurima 1 (1,650,000 FRW), isarura ry\'ibigori rifite agaciro ka 450,000 FRW, ikigega cy\'inguzanyo cyo mu itsinda cya 354,000 FRW, isarura ry\'ibishyimbo rya 168,000 FRW, n\'umurima wa karoti/ibitunguru (620,000 FRW).',
    },
  'Started by saving 500 RWF/month and have since increased to 1,000 RWF/month (15,000 RWF/month combined). Each member received 2 chickens (7,500 RWF each).':
    {
      fr: 'A commencé en épargnant 500 FRW/mois puis est passé à 1 000 FRW/mois (15 000 FRW/mois au total). Chaque membre a reçu 2 poules (7 500 FRW chacune).',
      rw: 'Batangiye bazigama 500 FRW/ukwezi maze bagera kuri 1,000 FRW/ukwezi (15,000 FRW/ukwezi hamwe). Buri munyamuryango yahawe inkoko 2 (7,500 FRW buri imwe).',
    },
  'Runs several activities: soy farming (55,000 RWF), maize farming (78,000 RWF), cassava farming (159,000 RWF), a rented farm plot (260,000 RWF), 741,300 RWF in savings, 238,700 RWF loaned to members, and 10 sacks of rice (1,800,000 RWF). Rice farming alone contributes 1,930,860 RWF.':
    {
      fr: 'Mène plusieurs activités : culture de soja (55 000 FRW), maïs (78 000 FRW), manioc (159 000 FRW), une parcelle louée (260 000 FRW), 741 300 FRW d\'épargne, 238 700 FRW prêtés aux membres et 10 sacs de riz (1 800 000 FRW). La riziculture seule rapporte 1 930 860 FRW.',
      rw: 'Bakora ibikorwa byinshi: ubuhinzi bwa soya (55,000 FRW), ibigori (78,000 FRW), imyumbati (159,000 FRW), umurima bakodesheje (260,000 FRW), 741,300 FRW mu bwizigame, 238,700 FRW baguriza abanyamuryango, n\'imifuka 10 y\'umuceri (1,800,000 FRW). Ubuhinzi bw\'umuceri bwonyine buzana 1,930,860 FRW.',
    },
  'The group started with nothing at all — just a name. After members were encouraged to begin saving together, they pooled funds and bought their first pig, which has since given birth to 8 piglets.':
    {
      fr: 'Le groupe a commencé sans rien — juste un nom. Après avoir été encouragés à épargner ensemble, les membres ont réuni des fonds et acheté leur premier porc, qui a depuis donné naissance à 8 porcelets.',
      rw: 'Itsinda ryatangiye nta kintu na kimwe rifite — izina gusa. Nyuma yo gushishikarizwa gutangira kuzigama hamwe, abanyamuryango bahujije amafaranga baragura ingurube yabo ya mbere, ubu yamaze kubyara ingurube nto 8.',
    },
  '9 members, each saving 1,000 RWF/month (9,000 RWF/month combined). Owns a forest plot (1,500,000 RWF), soy crop (42,000 RWF), 30kg of beans (30,000 RWF), and recent harvest income from beans (31,200 RWF), soy (25,000 RWF), and forestry income (4,518,080 RWF).':
    {
      fr: '9 membres, chacun épargnant 1 000 FRW/mois (9 000 FRW/mois au total). Possède une parcelle forestière (1 500 000 FRW), une culture de soja (42 000 FRW), 30 kg de haricots (30 000 FRW) et des revenus récents des haricots (31 200 FRW), du soja (25 000 FRW) et de la sylviculture (4 518 080 FRW).',
      rw: 'Abanyamuryango 9, buri wese azigama 1,000 FRW/ukwezi (9,000 FRW/ukwezi hamwe). Bafite ishyamba (1,500,000 FRW), igihingwa cya soya (42,000 FRW), ibishyimbo bya kilo 30 (30,000 FRW), n\'inyungu z\'isarura riheruka ku bishyimbo (31,200 FRW), soya (25,000 FRW), n\'inyungu z\'amashyamba (4,518,080 FRW).',
    },
  '11 members, saving 5,100 RWF/month per member. The group runs a shared small trading business selling beans, rice, soy, cooking oil, groundnuts, vegetables, and fruit.':
    {
      fr: '11 membres, épargnant 5 100 FRW/mois par membre. Le groupe gère un petit commerce commun vendant haricots, riz, soja, huile de cuisine, arachides, légumes et fruits.',
      rw: 'Abanyamuryango 11, bazigama 5,100 FRW/ukwezi kuri buri wese. Itsinda rikora ubucuruzi buto rusange bugurisha ibishyimbo, umuceri, soya, amavuta yo guteka, ubunyobwa, imboga n\'imbuto.',
    },
  'A registered livelihood group and one of the legally registered groups with notarized statutes. Detailed financials were not itemized in the source material, but it operates alongside the other member groups.':
    {
      fr: 'Un groupe de subsistance enregistré, parmi les groupes légalement enregistrés avec statuts notariés. Les détails financiers n\'étaient pas ventilés dans le document source, mais il opère aux côtés des autres groupes membres.',
      rw: 'Itsinda ry\'ubuzima ryanditswe kandi rimwe mu matsinda yanditswe mu buryo bwemewe afite amategeko yanditse. Amakuru arambuye y\'imari ntiyatondekanijwe mu nyandiko y\'inkomoko, ariko rikorana n\'ayandi matsinda anyamuryango.',
    },

  // ---- Breakdown labels ----
  '123 gas cylinders/bottles': { fr: '123 bouteilles de gaz', rw: 'Amacupa ya gazi 123' },
  '2 buildings for gas sales': { fr: '2 bâtiments pour la vente de gaz', rw: 'Inyubako 2 zo kugurisha gazi' },
  'Boutique / shop business': { fr: 'Boutique / commerce', rw: 'Ubucuruzi bwa butike / iduka' },
  'Cooking equipment': { fr: 'Matériel de cuisine', rw: 'Ibikoresho byo guteka' },
  'Food business working capital': { fr: 'Fonds de roulement (alimentation)', rw: 'Imari y\'ubucuruzi bw\'ibiribwa' },
  '2 adult pigs': { fr: '2 porcs adultes', rw: 'Ingurube 2 zikuze' },
  'Pig shelters': { fr: 'Abris à porcs', rw: 'Ibiraro by\'ingurube' },
  '8 young pigs': { fr: '8 porcelets', rw: 'Ingurube nto 8' },
  '12 pigs distributed to members': { fr: '12 porcs distribués aux membres', rw: 'Ingurube 12 zahawe abanyamuryango' },
  'Internal loan fund': { fr: 'Fonds de prêt interne', rw: 'Ikigega cy\'inguzanyo cyo mu itsinda' },
  'Savings account': { fr: 'Compte d\'épargne', rw: 'Konti y\'ubwizigame' },
  'Farm plot (sugarcane)': { fr: 'Parcelle (canne à sucre)', rw: 'Umurima (ibisheke)' },
  'Sugarcane crop': { fr: 'Culture de canne à sucre', rw: 'Igihingwa cy\'ibisheke' },
  'Farm plot (for coffee)': { fr: 'Parcelle (pour le café)', rw: 'Umurima (uw\'ikawa)' },
  'Rented plots (carrots, cabbage, seedlings)': {
    fr: 'Parcelles louées (carottes, chou, semis)',
    rw: 'Imirima ikodeshwa (karoti, amashu, imbuto)',
  },
  'Sugarcane plot': { fr: 'Parcelle de canne à sucre', rw: 'Umurima w\'ibisheke' },
  'Bank savings': { fr: 'Épargne bancaire', rw: 'Ubwizigame muri banki' },
  '23 goats': { fr: '23 chèvres', rw: 'Ihene 23' },
  '100 coffee trees': { fr: '100 caféiers', rw: 'Ibiti by\'ikawa 100' },
  '1 pig': { fr: '1 porc', rw: 'Ingurube 1' },
  'Sugarcane (harvested twice a year)': {
    fr: 'Canne à sucre (récoltée deux fois par an)',
    rw: 'Ibisheke (bisaruwa kabiri mu mwaka)',
  },
  'Coffee harvest income': { fr: 'Revenus de la récolte de café', rw: 'Inyungu z\'isarura ry\'ikawa' },
  'Loaned to members': { fr: 'Prêté aux membres', rw: 'Byatijwe abanyamuryango' },
  '4 farm plots': { fr: '4 parcelles', rw: 'Imirima 4' },
  'Tomato plot': { fr: 'Parcelle de tomates', rw: 'Umurima w\'inyanya' },
  '1,050 coffee trees': { fr: '1 050 caféiers', rw: 'Ibiti by\'ikawa 1,050' },
  '2 goats': { fr: '2 chèvres', rw: 'Ihene 2' },
  'Tomato harvest income': { fr: 'Revenus de la récolte de tomates', rw: 'Inyungu z\'isarura ry\'inyanya' },
  '134 coffee trees': { fr: '134 caféiers', rw: 'Ibiti by\'ikawa 134' },
  Farm: { fr: 'Ferme', rw: 'Umurima' },
  'Cassava trading business': { fr: 'Commerce de manioc', rw: 'Ubucuruzi bw\'imyumbati' },
  'Rented farm plot 1': { fr: 'Parcelle louée 1', rw: 'Umurima ukodeshwa 1' },
  'Rented farm plot 2': { fr: 'Parcelle louée 2', rw: 'Umurima ukodeshwa 2' },
  'Owned farm plot': { fr: 'Parcelle en propriété', rw: 'Umurima wihariye' },
  'Maize harvest': { fr: 'Récolte de maïs', rw: 'Isarura ry\'ibigori' },
  'Beans harvest': { fr: 'Récolte de haricots', rw: 'Isarura ry\'ibishyimbo' },
  'Carrot / onion plot': { fr: 'Parcelle de carottes / oignons', rw: 'Umurima wa karoti / ibitunguru' },
  '30 chickens': { fr: '30 poules', rw: 'Inkoko 30' },
  'Group savings': { fr: 'Épargne du groupe', rw: 'Ubwizigame bw\'itsinda' },
  'Soap stock': { fr: 'Stock de savon', rw: 'Ububiko bw\'isabune' },
  'Rented farm plot': { fr: 'Parcelle louée', rw: 'Umurima ukodeshwa' },
  'Soap-making equipment': { fr: 'Matériel de fabrication de savon', rw: 'Ibikoresho byo gukora isabune' },
  'Soy farming': { fr: 'Culture de soja', rw: 'Ubuhinzi bwa soya' },
  'Maize farming': { fr: 'Culture de maïs', rw: 'Ubuhinzi bw\'ibigori' },
  'Cassava farming': { fr: 'Culture de manioc', rw: 'Ubuhinzi bw\'imyumbati' },
  '10 sacks of rice': { fr: '10 sacs de riz', rw: 'Imifuka 10 y\'umuceri' },
  '1 adult pig': { fr: '1 porc adulte', rw: 'Ingurube 1 ikuze' },
  '9 young pigs': { fr: '9 porcelets', rw: 'Ingurube nto 9' },
  'Member savings': { fr: 'Épargne des membres', rw: 'Ubwizigame bw\'abanyamuryango' },
  '3 additional pigs purchased': { fr: '3 porcs supplémentaires achetés', rw: 'Ingurube 3 z\'inyongera zaguzwe' },
  'Forest plot': { fr: 'Parcelle forestière', rw: 'Ishyamba' },
  'Soy crop': { fr: 'Culture de soja', rw: 'Igihingwa cya soya' },
  '30kg of beans': { fr: '30 kg de haricots', rw: 'Ibishyimbo bya kilo 30' },
  'Beans harvest income': { fr: 'Revenus de la récolte de haricots', rw: 'Inyungu z\'isarura ry\'ibishyimbo' },
  'Soy harvest income': { fr: 'Revenus de la récolte de soja', rw: 'Inyungu z\'isarura rya soya' },
  'Forestry income': { fr: 'Revenus de la sylviculture', rw: 'Inyungu z\'amashyamba' },
  'Pig farming': { fr: 'Élevage de porcs', rw: 'Ubworozi bw\'ingurube' },

  // ---- Impact date values ----
  'November 1, 2011': { fr: '1er novembre 2011', rw: '1 Ugushyingo 2011' },
  'November 19, 2011': { fr: '19 novembre 2011', rw: '19 Ugushyingo 2011' },
}

// Fix a typo-safe lookup: translate a phrase into the given language.
export function tp(text, lang) {
  if (!text || lang === 'en') return text
  const entry = phraseTranslations[text]
  if (!entry) return text
  return entry[lang] ?? text
}
