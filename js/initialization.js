// Initialization functions for all objects

function initializeRedDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    const vx = 0;
    const vy = 0;
    
    // Return red dot object with position, velocity, mass, radius, collision counts, and trail
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: CONFIG.redMass, // Full mass for regular red dots
        radius: CONFIG.dotRadius / 2, // Full radius for regular red dots
        blueCollisionCount: 0, // Track collisions with blue dot
        greenCollisionCount: 0, // Track collisions with green dots
        trail: [],
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        cloudFadeAmount: 1.0 // Fade amount when in clouds (1.0 = fully visible, 0.0 = deleted)
    };
}

// Function to split a red dot into two mini-reds
function splitRedDot(index) {
    if (index < 0 || index >= redDots.length) return;
    
    const parentDot = redDots[index];
    const miniMass = CONFIG.redMass * 0.5; // 0.5 times the mass
    const miniRadius = CONFIG.dotRadius / 4; // Half the diameter (half the radius)
    
    // Create two mini-reds at slightly offset positions
    const offset = parentDot.radius; // Small offset to prevent overlap
    const angle1 = Math.random() * Math.PI * 2; // Random direction for first mini-red
    const angle2 = angle1 + Math.PI; // Opposite direction for second mini-red
    
    const miniRed1 = {
        x: parentDot.x + Math.cos(angle1) * offset,
        y: parentDot.y + Math.sin(angle1) * offset,
        vx: parentDot.vx,
        vy: parentDot.vy,
        mass: miniMass,
        radius: miniRadius,
        blueCollisionCount: 0, // Reset collision counts
        greenCollisionCount: 0,
        trail: [],
        fadeInTime: 0 // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        // Note: mini-reds don't have cloudFadeAmount - they're exempt from cloud effects
    };
    
    const miniRed2 = {
        x: parentDot.x + Math.cos(angle2) * offset,
        y: parentDot.y + Math.sin(angle2) * offset,
        vx: parentDot.vx,
        vy: parentDot.vy,
        mass: miniMass,
        radius: miniRadius,
        blueCollisionCount: 0, // Reset collision counts
        greenCollisionCount: 0,
        trail: [],
        fadeInTime: 0 // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        // Note: mini-reds don't have cloudFadeAmount - they're exempt from cloud effects
    };
    
    // Replace the parent dot with the first mini-red
    redDots[index] = miniRed1;
    // Add the second mini-red
    redDots.push(miniRed2);
    
    // Play flute D6 sound when mini-reds are created
    if (typeof playFluteD6 === 'function') {
        playFluteD6();
    }
}

function initializeBlueDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    blueDotX = minX + Math.random() * (maxX - minX);
    blueDotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    blueVx = 0;
    blueVy = 0;
    
    // Reset fade-in time
    blueDotFadeInTime = 0;
}

function initializeGreenDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    const vx = 0;
    const vy = 0;
    
    // Return green dot object with position, velocity, trail, antigravity state, and cloud time
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        trail: [],
        blueCollisionCount: 0, // Track collisions with blue dot for antigravity
        greenCollisionCount: 0, // Track collisions with other green dots for antigravity
        antigravityActive: false,
        antigravityTimeRemaining: 0,
        cloudTime: 0, // Track time spent in clouds (for antigravity activation)
        lastWindchimeTime: 0, // Track last windchime play time for antigravity sound
        fadeInTime: 0 // Time since creation (for fade-in effect, 0 to 1.0 seconds)
    };
}

function initializeCloud() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Random radius: up to 10x the width of green star (green star width = CONFIG.dotRadius * 2)
    // So radius should be between CONFIG.dotRadius * 4 and CONFIG.dotRadius * 20
    const minRadius = CONFIG.dotRadius * 4; // 2x green star width
    const maxRadius = CONFIG.dotRadius * 20; // 10x green star width
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    // Generate random cloud shape (4 to 8 puffs)
    const numPuffs = Math.floor(Math.random() * 5) + 4; // Random between 4 and 8
    const puffs = [];
    
    for (let i = 0; i < numPuffs; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = (Math.random() * 0.4 + 0.1) * radius; // 10% to 50% of radius from center
        const puffX = x + Math.cos(angle) * distance;
        const puffY = y + Math.sin(angle) * distance;
        // Random puff size (30% to 80% of base radius)
        const puffRadius = radius * (0.3 + Math.random() * 0.5);
        
        puffs.push({ x: puffX, y: puffY, r: puffRadius });
    }
    
    // Return cloud object with position, radius, shape data, and mass (clouds don't move)
    return {
        x: x,
        y: y,
        radius: radius,
        puffs: puffs,
        mass: CONFIG.redMass * 0.1, // Default mass: 0.1x red mass
        fadeInTime: 0 // Time since creation (for fade-in effect, 0 to 1.0 seconds)
    };
}

// Function to change cloud shape and acquire mass
function changeCloudShapeAndMass(cloud) {
    // Generate new random cloud shape (4 to 8 puffs)
    const numPuffs = Math.floor(Math.random() * 5) + 4; // Random between 4 and 8
    const puffs = [];
    
    for (let i = 0; i < numPuffs; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = (Math.random() * 0.4 + 0.1) * cloud.radius; // 10% to 50% of radius from center
        const puffX = cloud.x + Math.cos(angle) * distance;
        const puffY = cloud.y + Math.sin(angle) * distance;
        // Random puff size (30% to 80% of base radius)
        const puffRadius = cloud.radius * (0.3 + Math.random() * 0.5);
        
        puffs.push({ x: puffX, y: puffY, r: puffRadius });
    }
    
    // Update cloud shape
    cloud.puffs = puffs;
    
    // Acquire mass from 0.5 to 2 times red mass
    cloud.mass = CONFIG.redMass * (0.5 + Math.random() * 1.5); // Random between 0.5 and 2.0
}

function initializeYellowCrescent(x, y) {
    // Create yellow crescent at the specified position (where cloud was)
    // Initial velocity: set to 0
    const vx = 0;
    const vy = 0;
    
    // Return yellow crescent object with position, velocity, mass, and radius
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: CONFIG.yellowCrescentMass,
        radius: CONFIG.dotRadius * 1.5, // Slightly larger than red dots
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        decayTime: 0, // Time since creation (radioactive decay, 0 to 10 seconds)
        dissolveTime: -1, // Time in dissolve transition (0 to 0.5 seconds, -1 if not dissolving)
        transformType: null // 'blue' or 'red' - set when decay completes
    };
}

// Title translations (with proper capitalization for each language)
const titleTranslations = {
    english: "If a Video Game Designer Had Made the Solar System",
    spanish: "Si un Diseñador de Videojuegos Hubiera Hecho el Sistema Solar",
    catalan: "Si un Dissenyador de Videojocs Hagués Fet el Sistema Solar",
    italian: "Se un Progettista di Videogiochi Avesse Fatto il Sistema Solare",
    german: "Wenn ein Videospiel-Designer das Sonnensystem Gemacht Hätte",
    czech: "Kdyby Návrhář Videoher Udělal Sluneční Soustavu",
    japanese: "もしビデオゲームデザイナーが太陽系を作っていたら",
    hindi: "यदि एक वीडियो गेम डिज़ाइनर ने सौर मंडल बनाया होता",
    simplifiedChinese: "如果视频游戏设计师创造了太阳系",
    hawaiian: "Inā Ua Hana Kekahi Mea Hoʻolālā Pāʻani Wikiō i ka Pōʻai Lā",
    swedish: "Om en Speldesigner Hade Skapat Solsystemet",
    danish: "Hvis en Spildesigner Havde Lavet Solsystemet",
    icelandic: "Ef Tölvuleikjahönnuður Hefði Búið Til Sólkerfið",
    oldNorse: "Ef Leikjaskapari Hafa Gjört Sólkerfið",
    walloon: "Si on Dizeu d' Djeus Vidèyo Åreut Fait l' Sisteme Solrece",
    basque: "Bideo-joko Diseinatzaile Batek Eguzki Sistema Egin Izu Balu",
    frisian: "As in Fideospultsje-Ûntwerper it Sinnestelsel Makke Hie",
    dutch: "Als een Videogameontwerper het Zonnestelsel Had Gemaakt",
    ukrainian: "Якби Дизайнер Відеоігор Створив Сонячну Систему",
    bulgarian: "Ако Дизайнер на Видеоигри Направи Слънчевата Система",
    armenian: "Եթե Վիդեո Խաղերի Դիզայներն Էր Ստեղծել Արեգակնային Համակարգը",
    galician: "Se un Deseñador de Videoxogos Fixera o Sistema Solar",
    portuguese: "Se um Designer de Videogames Tivesse Feito o Sistema Solar",
    irish: "Dá mBa Dhearadh Cluiche Físeáin a Rinne an Córas Gréine"
};

// Random quotations from Einstein, Newton, and David Bowie's 'Life on Mars'
const randomQuotations = {
    english: [
        "Imagination is more important than knowledge.",
        "The important thing is not to stop questioning.",
        "I have no special talent. I am only passionately curious.",
        "If I have seen further, it is by standing on the shoulders of giants.",
        "To every action there is always opposed an equal reaction.",
        "It's a god-awful small affair to the girl with the mousy hair.",
        "But the film is a saddening bore.",
        "It's on America's tortured brow that Mickey Mouse has grown up a cow."
    ],
    spanish: [
        "La imaginación es más importante que el conocimiento.",
        "Lo importante es no dejar de cuestionar.",
        "No tengo talento especial. Solo soy apasionadamente curioso.",
        "Si he visto más lejos, es por estar sobre hombros de gigantes.",
        "A toda acción siempre se opone una reacción igual.",
        "Es un asunto terriblemente pequeño para la chica del pelo ratón.",
        "Pero la película es un aburrimiento triste.",
        "Es en la frente torturada de América que Mickey Mouse ha crecido una vaca."
    ],
    catalan: [
        "La imaginació és més important que el coneixement.",
        "L'important és no deixar de qüestionar.",
        "No tinc talent especial. Només sóc apassionadament curiós.",
        "Si he vist més lluny, és per estar sobre espatlles de gegants.",
        "A tota acció sempre s'oposa una reacció igual.",
        "És un assumpte terriblement petit per a la noia del pèl ratolí.",
        "Però la pel·lícula és un avorriment trist.",
        "És a la front torturada d'Amèrica que Mickey Mouse ha crescut una vaca."
    ],
    italian: [
        "L'immaginazione è più importante della conoscenza.",
        "L'importante è non smettere di interrogarsi.",
        "Non ho talento speciale. Sono solo appassionatamente curioso.",
        "Se ho visto più lontano, è stando sulle spalle dei giganti.",
        "Ad ogni azione si oppone sempre una reazione uguale.",
        "È una faccenda terribilmente piccola per la ragazza dai capelli topo.",
        "Ma il film è una noia triste.",
        "È sulla fronte torturata d'America che Topolino è cresciuto una mucca."
    ],
    german: [
        "Phantasie ist wichtiger als Wissen.",
        "Wichtig ist, nicht aufzuhören zu fragen.",
        "Ich habe kein besonderes Talent. Ich bin nur leidenschaftlich neugierig.",
        "Wenn ich weiter gesehen habe, so deshalb, weil ich auf den Schultern von Riesen stand.",
        "Jeder Aktion ist immer eine gleiche Reaktion entgegengesetzt.",
        "Es ist eine gott-erbärmlich kleine Angelegenheit für das Mädchen mit den mausigen Haaren.",
        "Aber der Film ist eine traurige Langeweile.",
        "Es ist auf Amerikas gequälter Stirn, dass Mickey Mouse eine Kuh groß geworden ist."
    ],
    czech: [
        "Představivost je důležitější než znalosti.",
        "Důležité je nepřestat se ptát.",
        "Nemám žádný zvláštní talent. Jsem jen vášnivě zvědavý.",
        "Pokud jsem viděl dál, je to tím, že stojím na ramenou obrů.",
        "Každé akci se vždy staví proti stejná reakce.",
        "Je to hrozně malá záležitost pro dívku s myšími vlasy.",
        "Ale film je smutná nuda.",
        "Je to na mučeném čele Ameriky, že Mickey Mouse vyrostl krávu."
    ],
    japanese: [
        "想像力は知識よりも重要です。",
        "重要なのは、疑問を持ち続けることです。",
        "特別な才能はありません。ただ情熱的に好奇心旺盛です。",
        "より遠くを見たのは、巨人の肩の上に立っているからです。",
        "あらゆる作用には、常に等しい反作用が対立します。",
        "ネズミ色の髪の女の子にとって、それは恐ろしく小さな出来事です。",
        "しかし、映画は悲しい退屈です。",
        "アメリカの苦しめられた額で、ミッキーマウスが牛に成長したのです。"
    ],
    hindi: [
        "कल्पना ज्ञान से अधिक महत्वपूर्ण है।",
        "महत्वपूर्ण बात यह है कि सवाल करना बंद न करें।",
        "मेरे पास कोई विशेष प्रतिभा नहीं है। मैं केवल जुनूनी रूप से उत्सुक हूं।",
        "अगर मैंने आगे देखा है, तो यह दिग्गजों के कंधों पर खड़े होने से है।",
        "हर क्रिया के लिए हमेशा एक समान प्रतिक्रिया का विरोध होता है।",
        "यह चूहे जैसे बालों वाली लड़की के लिए एक भयानक छोटा मामला है।",
        "लेकिन फिल्म एक दुखद उबाऊ है।",
        "यह अमेरिका के यातनाग्रस्त माथे पर है कि मिकी माउस एक गाय बड़ा हो गया है।"
    ],
    simplifiedChinese: [
        "想象力比知识更重要。",
        "重要的是不要停止质疑。",
        "我没有特殊才能。我只是充满激情地好奇。",
        "如果我看到了更远的地方，那是因为站在巨人的肩膀上。",
        "每个作用总是有一个相等的反作用。",
        "对于那个有老鼠般头发的女孩来说，这是一件非常小的事情。",
        "但这部电影是一个令人悲伤的乏味。",
        "正是在美国受折磨的额头上，米老鼠长成了一头牛。"
    ],
    hawaiian: [
        "ʻOi aku ka manaʻo ma mua o ka ʻike.",
        "He mea nui ka hoʻomau ʻana i ka nīnau.",
        "ʻAʻohe koʻu talena kūikawā. Ua ʻano ʻano wau wale nō.",
        "Inā ua ʻike aku au i kahi mamao, no ka kū ʻana ma luna o nā poʻohiwi o nā kānaka nui.",
        "I kēlā me kēia hana, aia kekahi pane like.",
        "He mea liʻiliʻi loa ia no ka kaikamahine me ka lauoho ʻiole.",
        "Akā, he mea hoʻohuoi ka kiʻi ʻoniʻoni.",
        "Ma ka lae ʻeha o ʻAmelika i ulu ai ʻo Mickey Mouse i bipi."
    ],
    swedish: [
        "Fantasi är viktigare än kunskap.",
        "Det viktiga är att inte sluta ifrågasätta.",
        "Jag har ingen särskild talang. Jag är bara passionerat nyfiken.",
        "Om jag har sett längre, är det genom att stå på jättarnas axlar.",
        "Till varje handling finns alltid en lika reaktion.",
        "Det är en gud-avskyvärd liten affär för flickan med det mössiga håret.",
        "Men filmen är en sorglig tråkighet.",
        "Det är på Amerikas torterade panna som Musse Pigg har vuxit upp en ko."
    ],
    danish: [
        "Fantasi er vigtigere end viden.",
        "Det vigtige er ikke at stoppe med at stille spørgsmål.",
        "Jeg har ingen særlig talent. Jeg er kun lidenskabeligt nysgerrig.",
        "Hvis jeg har set længere, er det ved at stå på kæmpers skuldre.",
        "Til enhver handling er der altid en lige reaktion.",
        "Det er en gud-forfærdelig lille affære for pigen med det musede hår.",
        "Men filmen er en sørgelig kedsomhed.",
        "Det er på Amerikas torturerede pande, at Mickey Mouse er vokset op en ko."
    ],
    icelandic: [
        "Ímyndunarafl er mikilvægara en þekking.",
        "Það mikilvæga er að hætta ekki að spyrja.",
        "Ég hef enga sérstaka hæfileika. Ég er bara ástríðufulllega forvitinn.",
        "Ef ég hef séð lengra, er það með því að standa á öxlum risanna.",
        "Fyrir hverja aðgerð er alltaf jafn viðbrögð.",
        "Það er guð-hryllilega lítið mál fyrir stúlkuna með músahár.",
        "En kvikmyndin er sorgleg leiðindi.",
        "Það er á pínuðu enni Ameríku sem Mickey Mouse hefur vaxið upp kú."
    ],
    oldNorse: [
        "Ímyndunarafl er mikilvægara en þekking.",
        "Þat mikilvæga er at hætta ekki at spyrja.",
        "Ek hefi enga sérstaka hæfileika. Ek em bara ástríðufulllega forvitinn.",
        "Ef ek hefi séð lengra, er þat með því at standa á öxlum risanna.",
        "Fyrir hverja aðgerð er alltaf jafn viðbrögð.",
        "Þat er guð-hryllilega lítið mál fyrir stúlkuna með músahár.",
        "En kvikmyndin er sorgleg leiðindi.",
        "Þat er á pínuðu enni Ameríku sem Mickey Mouse hefir vaxið upp kú."
    ],
    walloon: [
        "L' imådjinåcion est pus importante ki l' saveur.",
        "L' importante, c' est di n' nén s' arester di dmander.",
        "Dji n' a pont d' talint special. Dji soye seulmint passioné curieus.",
        "Si dji m' a veyou pus lon, c' est pa stå so les spales des djudlås.",
        "A tchaeke accion, i gn a todi ene egale reaccion.",
        "C' est ene pitite afwaire po l' båshele avou les tchveas d' sori.",
        "Mins l' fime, c' est ene tristèsse.",
        "C' est so l' front torturé d' Amerike ki Mickey Mouse a crexhou ene vatche."
    ],
    basque: [
        "Irudimena ezagutza baino garrantzitsuagoa da.",
        "Garrantzitsua da galderak egiteari ez uztea.",
        "Ez dut talentu berezirik. Besterik gabe, pasioz bitxia naiz.",
        "Urrunago ikusi badut, erraldoien sorbaldetan nagoelako da.",
        "Ekintza bakoitzari beti erantzun berdin bat dago kontrajarrita.",
        "Sagu ileko neskarentzat gertaera txiki bat da.",
        "Baina filma aspergarri triste bat da.",
        "Amerikako kopetan da Mickey Mouse behi bat hazi dena."
    ],
    frisian: [
        "Fantasij is wichtiger as kennis.",
        "It wichtichste is net ophâlde mei freegjen.",
        "Ik haw gjin bysûndere talint. Ik bin allinnich passyfolle nijsgjirrich.",
        "As ik fierder sjoen haw, is it troch op skouders fan reuzen te stean.",
        "Oan elke aksje is altyd in gelikweardige reaksje tsjinsteld.",
        "It is in god-ferfelige lytse saak foar it famke mei it mûze-eftige hier.",
        "Mar de film is in drôve ferfeeling.",
        "It is op Amerika syn martele foarholle dat Mickey Mouse in ko grut wurden is."
    ],
    dutch: [
        "Verbeelding is belangrijker dan kennis.",
        "Het belangrijke is niet stoppen met vragen stellen.",
        "Ik heb geen bijzonder talent. Ik ben alleen gepassioneerd nieuwsgierig.",
        "Als ik verder heb gezien, is het door op de schouders van reuzen te staan.",
        "Op elke actie is er altijd een gelijke reactie.",
        "Het is een god-afschuwelijke kleine affaire voor het meisje met het muisachtige haar.",
        "Maar de film is een treurige verveling.",
        "Het is op Amerika's gemartelde voorhoofd dat Mickey Mouse een koe is opgegroeid."
    ],
    ukrainian: [
        "Уява важливіша за знання.",
        "Важливо не припиняти ставити питання.",
        "У мене немає особливого таланту. Я лише пристрасно цікавий.",
        "Якщо я бачив далі, це тому, що стою на плечах гігантів.",
        "На кожну дію завжди є рівна протидія.",
        "Це бог-жахлива маленька справа для дівчини з мишастим волоссям.",
        "Але фільм - це сумна нудьга.",
        "Це на змученому чолі Америки, що Міккі Маус виріс корову."
    ],
    bulgarian: [
        "Въображението е по-важно от знанието.",
        "Важното е да не спираме да задаваме въпроси.",
        "Нямам специален талант. Просто съм страстно любопитен.",
        "Ако съм видял по-далеч, това е защото стоя на раменете на гиганти.",
        "На всяко действие винаги има равна реакция.",
        "Това е бог-ужасна малка работа за момичето с миши косми.",
        "Но филмът е тъжна скука.",
        "Това е на измъченото чело на Америка, че Мики Маус е израснал крава."
    ],
    armenian: [
        "Երևակայությունը ավելի կարևոր է, քան գիտելիքը:",
        "Կարևորը չդադարել հարցեր տալն է:",
        "Ես հատուկ տաղանդ չունեմ: Ես միայն կրքոտ հետաքրքրասեր եմ:",
        "Եթե ես ավելի հեռու եմ տեսել, դա այն պատճառով է, որ կանգնած եմ հսկաների ուսերի վրա:",
        "Յուրաքանչյուր գործողությանը միշտ հակադրվում է հավասար արձագանք:",
        "Դա աստված-սարսափելի փոքր գործ է մկնանման մազերով աղջկա համար:",
        "Բայց ֆիլմը տխուր ձանձրույթ է:",
        "Դա Ամերիկայի տանջված ճակատին է, որ Միկի Մաուսը աճել է կով:"
    ],
    galician: [
        "A imaxinación é máis importante que o coñecemento.",
        "O importante é non deixar de cuestionar.",
        "Non teño talento especial. Só son apaixonadamente curioso.",
        "Se vin máis lonxe, é por estar sobre os ombreiros de xigantes.",
        "A toda acción sempre se opón unha reacción igual.",
        "É un asunto terriblemente pequeno para a rapaza do pelo de rato.",
        "Pero a película é un aburrimento triste.",
        "É na fronte torturada de América que Mickey Mouse creceu unha vaca."
    ],
    portuguese: [
        "A imaginação é mais importante que o conhecimento.",
        "O importante é não parar de questionar.",
        "Não tenho talento especial. Sou apenas apaixonadamente curioso.",
        "Se vi mais longe, é por estar sobre os ombros de gigantes.",
        "A toda ação sempre se opõe uma reação igual.",
        "É um assunto terrivelmente pequeno para a garota com cabelo de rato.",
        "Mas o filme é um tédio triste.",
        "É na testa torturada da América que Mickey Mouse cresceu uma vaca."
    ],
    irish: [
        "Tá an tsamhlaíocht níos tábhachtaí ná an t-eolas.",
        "Is é an rud tábhachtach gan stopadh a chur le ceisteanna.",
        "Níl aon tallann speisialta agam. Níl mé ach go paiseanta fiosrach.",
        "Má chonaic mé níos faide, is trí sheasamh ar ghuaille na bhfathach é.",
        "Gach gníomh, tá freagairt chomhionann i gcoinne i gcónaí.",
        "Is cás beag uafásach é don chailín leis an gruaig luchóg.",
        "Ach is bréan brónach é an scannán.",
        "Is ar éadan céasta Mheiriceá a d'fhás Mickey Mouse bó."
    ]
};

// Language order for cycling (excluding English which appears every 10 resets)
const languageOrder = [
    'spanish', 'catalan', 'italian', 'german', 'czech', 'japanese', 'hindi',
    'simplifiedChinese', 'hawaiian', 'swedish', 'danish', 'icelandic', 'oldNorse',
    'walloon', 'basque', 'frisian', 'dutch', 'ukrainian', 'bulgarian', 'armenian',
    'galician', 'portuguese', 'irish'
];

// Function to adjust title font size to fit on one line
function adjustTitleFontSize(titleElement) {
    titleElement.style.fontSize = ''; // Reset to default
    titleElement.style.whiteSpace = 'nowrap';
    const computedStyle = window.getComputedStyle(titleElement);
    let fontSize = parseFloat(computedStyle.fontSize);
    const minFontSize = 12;
    const containerWidth = titleElement.parentElement.clientWidth - 40;
    let textWidth = titleElement.scrollWidth;
    while (textWidth > containerWidth && fontSize > minFontSize) {
        fontSize -= 1;
        titleElement.style.fontSize = fontSize + 'px';
        textWidth = titleElement.scrollWidth; // Recalculate after change
    }
}

// Async function to update title with fade transition
async function updateTitle(useAutoCycle = false) {
    if (titleUpdateInProgress) return; // Prevent overlapping updates
    
    titleUpdateInProgress = true;
    const titleElement = document.querySelector('h1');
    if (!titleElement) {
        titleUpdateInProgress = false;
        return;
    }
    
    const cycleCount = useAutoCycle ? autoTitleCycleCount : resetCount;
    let newText = '';
    
    // Determine what to show
    const shouldShowQuotation = cycleCount > 0 && cycleCount % 5 === 0;
    const shouldShowEnglish = cycleCount % 10 === 0 || !lastNineLanguages.includes('english');
    
    if (shouldShowQuotation) {
        // Show random quotation
        const allLanguages = Object.keys(randomQuotations);
        const randomLang = allLanguages[Math.floor(Math.random() * allLanguages.length)];
        const quotes = randomQuotations[randomLang];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        newText = randomQuote;
    } else if (shouldShowEnglish) {
        newText = titleTranslations.english;
    } else {
        // Cycle through languages in order
        const lang = languageOrder[currentLanguageIndex % languageOrder.length];
        newText = titleTranslations[lang];
        currentLanguageIndex = (currentLanguageIndex + 1) % languageOrder.length;
    }
    
    // Update lastNineLanguages
    const currentLang = Object.keys(titleTranslations).find(key => titleTranslations[key] === newText) || 'english';
    lastNineLanguages.shift();
    lastNineLanguages.push(currentLang);
    
    // Increment the appropriate counter
    if (useAutoCycle) {
        autoTitleCycleCount++;
    }
    
    // Fade out old title
    titleElement.style.opacity = '0';
    
    // Wait for fade out to complete (0.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Change text content while invisible
    titleElement.textContent = newText;
    
    // Adjust font size to fit on one line
    adjustTitleFontSize(titleElement);
    
    // Fade in new title
    titleElement.style.opacity = '1';
    
    // Reset flag after fade completes
    setTimeout(() => {
        titleUpdateInProgress = false;
    }, 500);
}

// Reset function to reinitialize all objects
function resetSimulation() {
    // Increment reset counter
    resetCount++;
    
    // Update title language (based on reset count)
    updateTitle(false); // false = use reset count, not automatic cycling
    
    // Reset automatic title cycling state
    autoTitleCycleCount = 0;
    autoTitleCyclingStarted = false;
    lastAutoTitleChangeTime = 0;
    titleUpdateInProgress = false;
    
    // Clear red dots array
    redDots.length = 0;
    
    // Clear green dots array
    greenDots.length = 0;
    
    // Clear clouds
    clouds.length = 0;
    
    // Clear yellow crescents
    yellowCrescents.length = 0;
    
    // Clear trails
    blueTrail.length = 0;
    
    // Reset antigravity state
    blueAntigravityActive = false;
    blueAntigravityTimeRemaining = 0;
    blueGreenAntigravityCount = 0;
    blueCloudTime = 0; // Reset blue cloud time
    lastBlueWindchimeTime = 0; // Reset blue windchime timer
    lastOrganChordTime = 0; // Reset organ chord timer
    blueDotFadeInTime = 0; // Reset blue dot fade-in time
    
    // Initialize random number of red dots (2 to 8)
    const numRedDots = Math.floor(Math.random() * 7) + 2; // Random number from 2 to 8
    for (let i = 0; i < numRedDots; i++) {
        redDots.push(initializeRedDot());
    }
    
    // Initialize green dots: 1 in 10 chance of 2 or 3 green stars, otherwise 1
    let numGreenDots = 1; // Default: 1 green star
    if (Math.random() < 0.1) { // 1 in 10 chance (10%)
        numGreenDots = Math.floor(Math.random() * 2) + 2; // Random number from 2 to 3
    }
    for (let i = 0; i < numGreenDots; i++) {
        greenDots.push(initializeGreenDot());
    }
    
    // Reinitialize blue dot with random position
    initializeBlueDot();
    
    // Initialize one cloud at the start
    clouds.push(initializeCloud());
    
    // Reset collision counts
    blueGreenCollisionCount = 0;
    
    // Reset timer
    startTime = Date.now();
}
