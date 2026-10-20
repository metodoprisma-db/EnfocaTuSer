import type { CatalogItem, CompassZone } from "@/types/app";

export const discoveries: CatalogItem[] = [
  {
    id: "discovery-01",
    slug: "empieza-sin-luchar",
    index: 0,
    number: 1,
    kind: "discovery",
    title: "Empieza sin luchar",
    description: "La calma aparece cuando dejas de pelear con lo que sientes.",
    insight:
      "No hace falta arreglarte para comenzar. Puedes reconocer la emoción, darle un nombre aproximado y ofrecerle un poco de espacio.",
    prompts: [
      "¿Qué emoción me cuesta recibir hoy?",
      "¿Qué cambia si dejo de empujarla por un momento?",
    ],
    action:
      "Nota una emoción durante unos segundos y dile por dentro: puedes estar aquí.",
    seed: "Puedo escucharme sin convertirme en una batalla.",
    mentorNote:
      "Clarissa y Scarlett te recuerdan que comenzar también puede sentirse suave.",
  },
  {
    id: "discovery-02",
    slug: "mira-donde-estas",
    index: 1,
    number: 2,
    kind: "discovery",
    title: "Mira dónde estás",
    description: "Observa tu presente con curiosidad, sin ponerle una nota.",
    insight:
      "Antes de avanzar, ayuda mirar qué está pesando. Una fotografía honesta del presente permite reconocer movimientos que la prisa suele ocultar.",
    prompts: [
      "¿En qué área de mi vida noto más peso?",
      "¿Cómo deseo relacionarme con ese tema dentro de unos meses?",
    ],
    action:
      "Pon un nombre sencillo a la dificultad y escribe cómo se siente hoy.",
    seed: "Puedo mirarme con honestidad y ternura.",
    mentorNote:
      "Clarissa y Scarlett sostienen este momento contigo, sin juicios ni comparaciones.",
  },
  {
    id: "discovery-03",
    slug: "siente-mas-piensa-menos",
    index: 2,
    number: 3,
    kind: "discovery",
    title: "Siente más, piensa menos",
    description: "No cada pensamiento necesita una respuesta inmediata.",
    insight:
      "La mente arma historias para protegerte. Por un instante, deja la explicación a un lado y nota la sensación que vive en el cuerpo.",
    prompts: [
      "¿Qué historia repito cuando aparece esta emoción?",
      "¿Qué noto en el cuerpo si suelto la explicación?",
    ],
    action:
      "Mira a tu alrededor, respira con naturalidad y encuentra una sensación pequeña.",
    seed: "Soy más amplia que la historia que mi mente cuenta.",
    mentorNote:
      "Clarissa y Scarlett te acompañan a volver del ruido mental a tu presencia.",
  },
  {
    id: "discovery-04",
    slug: "cuestiona-tus-reglas",
    index: 3,
    number: 4,
    kind: "discovery",
    title: "Cuestiona tus reglas",
    description: "Parte del peso viene de reglas que aprendiste sin elegir.",
    insight:
      "Quizá asocias valor con agotamiento, perfección o aprobación. Una creencia puede revisarse sin negar tu historia.",
    prompts: [
      "¿Qué regla sobre éxito, amor o dinero me aprieta?",
      "¿De quién aprendí esa regla y qué opción más amable existe?",
    ],
    action:
      "Escribe una regla antigua y completa: hoy me permito mirarla de otra manera.",
    seed: "Una creencia aprendida puede abrirse a una nueva mirada.",
    mentorNote:
      "Clarissa y Scarlett te invitan a elegir coherencia antes que autoexigencia.",
  },
  {
    id: "discovery-05",
    slug: "haz-espacio-a-la-resistencia",
    index: 4,
    number: 5,
    kind: "discovery",
    title: "Haz espacio a la resistencia",
    description: "La parte que se cierra también está intentando cuidarte.",
    insight:
      "A veces aparece rechazo, cansancio o deseo de controlar. Mirar esa resistencia con respeto reduce la lucha y deja ver lo que necesita.",
    prompts: [
      "¿Qué parte de este proceso me incomoda?",
      "¿Qué temo que ocurra si aflojo un poco el control?",
    ],
    action:
      "Nota el rechazo y deja de discutir con él durante tres respiraciones.",
    seed: "Incluso mi resistencia merece ser escuchada.",
    mentorNote:
      "Clarissa y Scarlett están cerca mientras quitas esta capa a tu ritmo.",
  },
  {
    id: "discovery-06",
    slug: "haz-sitio-a-lo-bueno",
    index: 5,
    number: 6,
    kind: "discovery",
    title: "Haz sitio a lo bueno",
    description: "Abrir espacio al dolor también deja entrar cuidado y claridad.",
    insight:
      "No hace falta forzar optimismo. Puedes recibir una cualidad amable, como paciencia o valentía, al mismo tiempo que reconoces lo difícil.",
    prompts: [
      "¿Qué emoción necesita espacio hoy?",
      "¿Qué cualidad amable deseo invitar a este momento?",
    ],
    action:
      "Imagina por unos segundos cómo se sentiría recibir esa cualidad sin empujar el resultado.",
    seed: "Lo amable también puede encontrar espacio en mí.",
    mentorNote:
      "Clarissa y Scarlett celebran tu recorrido con un encuentro preparado para escucharte.",
    hasGift: true,
  },
  {
    id: "discovery-07",
    slug: "suelta-una-piedra-a-la-vez",
    index: 6,
    number: 7,
    kind: "discovery",
    title: "Suelta una piedra a la vez",
    description: "Lo grande puede mirarse en partes pequeñas y seguras.",
    insight:
      "Cuando algo sobrepasa, intentar resolverlo completo suma peso. Elegir una parte manejable abre movimiento sin traicionar tu paz.",
    prompts: [
      "¿Qué asunto se siente demasiado grande?",
      "¿Qué parte pequeña puedo mirar hoy con seguridad?",
    ],
    action: "Elige una sola parte. El resto puede esperar fuera de este momento.",
    seed: "Un movimiento pequeño también cambia mi camino.",
    mentorNote:
      "Clarissa y Scarlett reconocen cada microvictoria que nace desde el ser.",
  },
  {
    id: "discovery-08",
    slug: "mira-tus-pensamientos-con-distancia",
    index: 7,
    number: 8,
    kind: "discovery",
    title: "Mira tus pensamientos con distancia",
    description: "Una idea intensa no cuenta toda tu historia.",
    insight:
      "Un pensamiento puede sonar convincente y aun así ser una interpretación. Distinguir hechos de suposiciones devuelve claridad.",
    prompts: [
      "¿Qué frase dura repito sobre mí o mi futuro?",
      "¿Qué parte es un hecho y qué parte es una interpretación?",
    ],
    action:
      "Di por dentro: estoy notando este pensamiento y puedo observarlo.",
    seed: "Puedo comprobar los hechos sin entregar mi dirección al miedo.",
    mentorNote:
      "Clarissa y Scarlett te invitan a mirar el pensamiento sin convertirlo en identidad.",
  },
  {
    id: "discovery-09",
    slug: "un-pequeno-si-puedo",
    index: 8,
    number: 9,
    kind: "discovery",
    title: "Un pequeño sí puedo",
    description: "Cuando falta energía, una elección posible ya abre camino.",
    insight:
      "La mente agotada dice que nada alcanza. En lugar de discutir, busca una acción diminuta que cuide tu cuerpo o tu entorno.",
    prompts: [
      "¿Dónde me siento sin fuerzas?",
      "¿Qué gesto sencillo me ofrecería un poco de apoyo?",
    ],
    action:
      "Elige entre beber agua, pedir compañía, abrir una ventana o descansar unos minutos.",
    seed: "Hoy basta con el paso que sí está a mi alcance.",
    mentorNote:
      "Clarissa y Scarlett te acompañan a reconocer valor en lo pequeño.",
  },
  {
    id: "discovery-10",
    slug: "afloja-la-necesidad-de-ganar",
    index: 9,
    number: 10,
    kind: "discovery",
    title: "Afloja la necesidad de ganar",
    description: "Tener razón puede costar más paz de la que entrega.",
    insight:
      "Defender una historia a veces protege una herida. Preguntarte qué hay debajo permite poner límites desde mayor claridad.",
    prompts: [
      "¿Qué intento demostrar cuando discuto?",
      "¿Qué emoción aparecería si dejo de defender esa posición?",
    ],
    action: "Deja una opinión sin respuesta por un momento y observa tu cuerpo.",
    seed: "Mi paz puede importar más que cerrar una discusión.",
    mentorNote:
      "Clarissa y Scarlett sostienen una firmeza que no necesita atacar.",
  },
  {
    id: "discovery-11",
    slug: "libera-el-peso-de-culpar",
    index: 10,
    number: 11,
    kind: "discovery",
    title: "Libera el peso de culpar",
    description: "Puedes cuidar tu herida sin vivir dentro del reproche.",
    insight:
      "Reconocer el daño no obliga a repetirlo en tu interior. Soltar parte de la culpa permite cuidar límites, dignidad y paz.",
    prompts: [
      "¿Qué dolor se activa cuando pienso en esa situación?",
      "¿Qué necesito para cuidarme sin alimentar el peso?",
    ],
    action:
      "Nombra la emoción debajo del reproche y ofrécele un límite seguro.",
    seed: "Puedo protegerme y hacer espacio para la paz.",
    mentorNote:
      "Clarissa y Scarlett te acompañan con respeto hacia tu historia y tus límites.",
  },
  {
    id: "discovery-12",
    slug: "querer-sin-agarrar",
    index: 11,
    number: 12,
    kind: "discovery",
    title: "Querer sin agarrar",
    description: "Amar algo no exige controlarlo.",
    insight:
      "El miedo a perder suele hablar de compañía, cariño o seguridad. Puedes cuidar esas necesidades sin apretar más fuerte.",
    prompts: [
      "¿Qué temo perder y qué representa para mí?",
      "¿Qué parte de esa seguridad puedo cultivar en mi interior?",
    ],
    action: "Agradece algo valioso sin pedirle que resuelva todo tu bienestar.",
    seed: "Puedo amar y al mismo tiempo dejar respirar.",
    mentorNote:
      "Clarissa y Scarlett te recuerdan que el amor también incluye espacio.",
  },
  {
    id: "discovery-13",
    slug: "dale-espacio-a-la-tristeza",
    index: 12,
    number: 13,
    kind: "discovery",
    title: "Dale espacio a la tristeza",
    description: "El dolor merece tiempo, compañía y ternura.",
    insight:
      "La tristeza no es un fallo. Puedes elegir una parte manejable, sentirla con apoyo y detenerte cuando el cuerpo lo pida.",
    prompts: [
      "¿Qué tristeza pequeña necesita atención?",
      "¿Qué gesto de cuidado puede acompañarme?",
    ],
    action:
      "Permite unos instantes de tristeza en un lugar seguro y busca apoyo si se vuelve intensa.",
    seed: "Sentir tristeza no reduce mi valor.",
    mentorNote:
      "Clarissa y Scarlett reciben tu emoción con discreción y calidez.",
  },
  {
    id: "discovery-14",
    slug: "encuentra-apoyo-en-ti",
    index: 13,
    number: 14,
    kind: "discovery",
    title: "Encuentra apoyo en ti",
    description: "Cuidarte también incluye dejarte acompañar.",
    insight:
      "Tu valor no depende por completo de aprobación externa. Sostenerte y pedir ayuda pueden convivir en el mismo acto de amor.",
    prompts: [
      "¿Qué busco con mucha fuerza fuera de mí?",
      "¿Cómo puedo ofrecerme hoy una parte de eso?",
    ],
    action: "Elige una forma concreta de autocuidado o pide apoyo a alguien cercano.",
    seed: "Puedo recibir amor sin perderme de mí.",
    mentorNote:
      "Clarissa y Scarlett te acompañan a elegirse con responsabilidad afectiva.",
  },
  {
    id: "discovery-15",
    slug: "mira-al-miedo-con-ternura",
    index: 14,
    number: 15,
    kind: "discovery",
    title: "Mira al miedo con ternura",
    description: "La valentía permite avanzar con miedo y con cuidado.",
    insight:
      "No hace falta vencer todos los temores. Observa uno, nota su huella corporal y encuentra un paso seguro que honre lo importante.",
    prompts: [
      "¿Qué miedo me frena y dónde lo siento?",
      "¿Qué paso seguro puedo dar con algo de confianza?",
    ],
    action: "Elige un movimiento pequeño que el miedo pueda acompañar.",
    seed: "Puedo avanzar con suavidad y presencia.",
    mentorNote:
      "Clarissa y Scarlett honran la valentía tranquila que cultivaste en este camino.",
  },
];

export const depthPractices: CatalogItem[] = [
  {
    id: "extra-01",
    slug: "desear-sin-urgencia",
    index: 0,
    number: 1,
    kind: "extra",
    title: "Desear sin apretar",
    description: "Cuida tus metas sin pedirles que definan tu valor.",
    insight:
      "Querer algo puede inspirarte. El peso aparece cuando la paz queda atada al resultado.",
    prompts: [
      "¿Qué persigo como si mi bienestar dependiera de ello?",
      "¿Cómo actuaría hoy con menos necesidad de controlar?",
    ],
    action: "Da un paso hacia tu meta y deja abierto el resultado.",
    seed: "Puedo desear sin quedar atrapada.",
    mentorNote: "Clarissa y Scarlett te invitan a crear desde abundancia interior.",
  },
  {
    id: "extra-02",
    slug: "enfado-que-no-manda",
    index: 1,
    number: 2,
    kind: "extra",
    title: "Enfado que no manda",
    description: "Escucha la fuerza de la emoción antes de elegir una acción.",
    insight:
      "El enfado puede señalar un límite, una pena o una necesidad. Sentirlo no decide lo que haces después.",
    prompts: [
      "¿Qué necesidad vive debajo de mi enfado?",
      "¿Qué límite claro puedo expresar con respeto?",
    ],
    action: "Espera una respiración y elige una frase breve desde tu experiencia.",
    seed: "Puedo sentir fuerza y elegir cuidado.",
    mentorNote: "Clarissa y Scarlett sostienen tu firmeza con amor.",
  },
  {
    id: "extra-03",
    slug: "aflojar-la-armadura",
    index: 2,
    number: 3,
    kind: "extra",
    title: "Aflojar la armadura",
    description: "Tu valor no depende de parecer invulnerable.",
    insight:
      "La necesidad de impresionar o evitar errores suele proteger una parte sensible. Reconocerla abre aprendizaje.",
    prompts: [
      "¿Dónde necesito quedar por encima?",
      "¿Qué libertad aparece si admito que estoy aprendiendo?",
    ],
    action: "Reconoce algo que aún estás aprendiendo y respira.",
    seed: "Mi valor no necesita una armadura.",
    mentorNote: "Clarissa y Scarlett celebran la honestidad que acerca a tu ser.",
  },
  {
    id: "extra-04",
    slug: "un-paso-valiente",
    index: 3,
    number: 4,
    kind: "extra",
    title: "Un paso valiente",
    description: "La valentía puede ser pedir ayuda y moverte con cuidado.",
    insight:
      "El coraje no exige dejar de temblar. Es disposición para mirar y actuar dentro de lo posible.",
    prompts: [
      "¿Qué puedo mirar con un poco más de calma?",
      "¿Qué acción segura me acerca a lo que importa?",
    ],
    action: "Haz una acción pequeña o pide compañía para realizarla.",
    seed: "El coraje también puede sentirse suave.",
    mentorNote: "Clarissa y Scarlett caminan cerca de ese paso.",
  },
  {
    id: "extra-05",
    slug: "aceptar-para-elegir",
    index: 4,
    number: 5,
    kind: "extra",
    title: "Aceptar para elegir",
    description: "Reconocer la realidad abre decisiones más claras.",
    insight:
      "Aceptar lo que existe hoy no aprueba lo injusto. Te ayuda a reconocer el punto de partida y elegir desde allí.",
    prompts: [
      "¿Qué hecho deseo que fuera distinto?",
      "¿Qué opción útil queda disponible ahora?",
    ],
    action: "Nombra el hecho y una elección que todavía te pertenece.",
    seed: "Puedo ver lo que hay y conservar mi capacidad de elegir.",
    mentorNote: "Clarissa y Scarlett te acompañan a unir realidad y esperanza.",
  },
  {
    id: "extra-06",
    slug: "amor-con-espacio",
    index: 5,
    number: 6,
    kind: "extra",
    title: "Amor con espacio",
    description: "El cariño también incluye respeto, límites y cuidado propio.",
    insight:
      "Amar se vuelve más libre cuando una persona no carga con la tarea de completar todo lo que falta.",
    prompts: [
      "¿Dónde confundo amar con controlar?",
      "¿Cómo puedo ofrecer cariño sin abandonar mis límites?",
    ],
    action: "Ofrece un gesto de cariño sin exigir una respuesta concreta.",
    seed: "El amor deja respirar.",
    mentorNote: "Clarissa y Scarlett te recuerdan que elegirte también es amar.",
  },
  {
    id: "extra-07",
    slug: "descansar-en-la-quietud",
    index: 6,
    number: 7,
    kind: "extra",
    title: "Descansar en la quietud",
    description: "La paz puede aparecer en un momento cotidiano.",
    insight:
      "Entre una idea y otra existe un instante de silencio. No necesita convertirse en una prueba de avance.",
    prompts: [
      "¿Dónde aparece un poco de quietud en mi día?",
      "¿Qué noto si dejo que ese momento sea suficiente?",
    ],
    action: "Mira la luz, el cielo o un objeto durante un minuto.",
    seed: "Este instante puede ofrecerme descanso.",
    mentorNote: "Clarissa y Scarlett comparten contigo esta pausa sencilla.",
  },
  {
    id: "extra-08",
    slug: "escuchar-al-cuerpo",
    index: 7,
    number: 8,
    kind: "extra",
    title: "Escuchar al cuerpo",
    description: "Tu cuerpo merece cuidado además de observación.",
    insight:
      "Las emociones pueden sentirse como tensión o cansancio. Escuchar ayuda a conocerte sin atribuir cada dolencia a una causa emocional.",
    prompts: [
      "¿Qué señal corporal he dejado al final?",
      "¿Qué cuidado real necesito hoy?",
    ],
    action: "Ajusta tu postura, hidrátate, descansa o busca atención profesional.",
    seed: "Cuidar mi cuerpo es una forma de volver a mí.",
    mentorNote: "Clarissa y Scarlett te invitan a recibir la sabiduría del cuerpo.",
  },
  {
    id: "extra-09",
    slug: "relaciones-con-aire",
    index: 8,
    number: 9,
    kind: "extra",
    title: "Relaciones con aire",
    description: "Acercarte a otra persona sin perder tu centro.",
    insight:
      "Hablar con claridad permite pedir lo que necesitas y reconocer que la otra persona también elige.",
    prompts: [
      "¿Qué espero que otra persona haga para sentir paz?",
      "¿Qué puedo pedir con honestidad y respeto?",
    ],
    action: "Habla desde yo siento y yo necesito, sin acusar.",
    seed: "Puedo acercarme sin controlar.",
    mentorNote: "Clarissa y Scarlett sostienen vínculos con responsabilidad afectiva.",
  },
  {
    id: "extra-10",
    slug: "trabajar-sin-castigarte",
    index: 9,
    number: 10,
    kind: "extra",
    title: "Trabajar sin castigarte",
    description: "Avanza hacia tus metas sin convertir cada error en condena.",
    insight:
      "Puedes aprender y buscar resultados sin medir tu valor por el desempeño. Menos presión deja más espacio para claridad.",
    prompts: [
      "¿Qué meta persigo desde el miedo a no valer?",
      "¿Qué haría con más presencia si no buscara demostrarme?",
    ],
    action: "Realiza un avance pequeño y reconoce su lugar en el proceso.",
    seed: "Mi valor no depende de un resultado.",
    mentorNote: "Clarissa y Scarlett te acompañan de la excelencia hacia la paz.",
  },
  {
    id: "extra-11",
    slug: "mas-amplia-que-mi-historia",
    index: 10,
    number: 11,
    kind: "extra",
    title: "Más amplia que mi historia",
    description: "Una emoción o etiqueta no contiene todo lo que eres.",
    insight:
      "La mente crea identidades rígidas. Cambiar soy por estoy sintiendo abre espacio entre tu ser y el momento.",
    prompts: [
      "¿Qué etiqueta repito sobre mí?",
      "¿Cómo me describiría sin usar esa etiqueta?",
    ],
    action: "Cambia una frase que empieza con soy por una observación temporal.",
    seed: "Mi ser es más amplio que una etiqueta.",
    mentorNote: "Clarissa y Scarlett ven en ti más posibilidades que una historia fija.",
  },
  {
    id: "extra-12",
    slug: "gratitud-que-se-vuelve-vida",
    index: 11,
    number: 12,
    kind: "extra",
    title: "Gratitud que se vuelve vida",
    description: "Deja que el agradecimiento se transforme en presencia.",
    insight:
      "Agradecer no borra lo difícil. Permite reconocer una fuente de apoyo y convertirla en un gesto concreto.",
    prompts: [
      "¿Qué puedo agradecer hoy sin negar lo difícil?",
      "¿Qué bien pequeño puedo compartir?",
    ],
    action: "Nombra algo que agradeces y ofrece un gesto libre de obligación.",
    seed: "La gratitud puede habitar mis acciones.",
    mentorNote: "Clarissa y Scarlett cierran este recorrido agradeciendo tu presencia.",
  },
];

export const compassZones: CompassZone[] = [
  {
    id: "oruga",
    stage: "Oruga",
    leadership: "Liderazgos Egocéntricos (-200)",
    calibration: "Fuerza / Baja Calibración",
    title: "Estados de supervivencia, reacción y desconexión",
    detail:
      "Aquí no hay nada que juzgar. Reconocer el estado presente ya abre un poco de espacio para acompañarte.",
    frequencies: [
      { emotion: "Vergüenza", value: "20", guidance: "Esta emoción puede hacerte querer esconderte. Clarissa y Scarlett te invitan a separar lo que sientes de lo que vales.", discoverySlug: "mira-donde-estas" },
      { emotion: "Culpa", value: "30", guidance: "Puedes reconocer lo ocurrido sin convertir el error en identidad. La reparación también puede empezar con amabilidad.", discoverySlug: "libera-el-peso-de-culpar" },
      { emotion: "Apatía", value: "50", guidance: "Cuando falta energía, el paso más pequeño cuenta. Hoy puede bastar con recibir apoyo y cuidar tu cuerpo.", discoverySlug: "un-pequeno-si-puedo" },
      { emotion: "Sufrimiento", value: "75", guidance: "No necesitas sostenerlo todo de una vez. Clarissa y Scarlett te acompañan a mirar una parte manejable.", discoverySlug: "dale-espacio-a-la-tristeza" },
      { emotion: "Temor", value: "100", guidance: "El miedo intenta proteger algo importante. Puedes escucharlo y elegir un movimiento pequeño y seguro.", discoverySlug: "mira-al-miedo-con-ternura" },
      { emotion: "Deseo", value: "125", guidance: "Desear no es un problema. La invitación es aflojar la urgencia para que tu paz no dependa del resultado.", discoverySlug: "querer-sin-agarrar" },
      { emotion: "Ira", value: "150", guidance: "La fuerza de la ira puede señalar un límite. Haz espacio antes de decidir cómo expresarlo con claridad.", discoverySlug: "libera-el-peso-de-culpar" },
      { emotion: "Orgullo", value: "175", guidance: "Quizá una parte de ti está cuidando una herida. No necesitas demostrar nada para volver a tu centro.", discoverySlug: "afloja-la-necesidad-de-ganar" },
    ],
  },
  {
    id: "crisalida",
    stage: "Crisálida",
    leadership: "Liderazgos Transformadores (+200)",
    calibration: "El Puente",
    title: "Estados de aprendizaje y toma de conciencia",
    detail:
      "Este puente permite observar, aprender y elegir. No exige tener todas las respuestas antes de avanzar.",
    frequencies: [
      { emotion: "Coraje", value: "200", guidance: "El coraje puede convivir con el temblor. Clarissa y Scarlett celebran ese sí pequeño que nace desde tu verdad.", discoverySlug: "un-pequeno-si-puedo" },
      { emotion: "Neutralidad", value: "250", guidance: "No todo necesita resolverse hoy. Puedes dejar una pregunta abierta y conservar tu paz.", discoverySlug: "mira-tus-pensamientos-con-distancia" },
      { emotion: "Voluntad", value: "310", guidance: "Tu disposición abre movimiento. Elige un paso realista que cuide tu energía y tu intención.", discoverySlug: "suelta-una-piedra-a-la-vez" },
      { emotion: "Aceptación", value: "350", guidance: "Aceptar el punto de partida no es resignarse. Es ver con claridad desde dónde deseas elegir.", discoverySlug: "haz-espacio-a-la-resistencia" },
      { emotion: "Razonamiento", value: "400", guidance: "La comprensión puede ordenar lo vivido. Recuerda incluir al cuerpo y al sentir en esa mirada.", discoverySlug: "siente-mas-piensa-menos" },
    ],
  },
  {
    id: "mariposa",
    stage: "Mariposa",
    leadership: "Liderazgos Auténticos (+500)",
    calibration: "Poder / Alta Calibración",
    title: "Estados de expansión, conexión, claridad y creación consciente",
    detail:
      "Recibe esta apertura sin convertirla en obligación. Cada estado puede visitarte y también transformarse.",
    frequencies: [
      { emotion: "Amor", value: "500", guidance: "El amor también incluye límites, espacio y cuidado propio. Permite que esta presencia alcance tu siguiente elección.", discoverySlug: "querer-sin-agarrar" },
      { emotion: "Alegría", value: "540", guidance: "Puedes disfrutar este momento sin sujetarlo. Clarissa y Scarlett celebran contigo la ligereza que aparece.", discoverySlug: "haz-sitio-a-lo-bueno" },
      { emotion: "Paz", value: "600", guidance: "Deja que la quietud sea suficiente por un instante. No necesitas convertirla en una meta perfecta.", discoverySlug: "encuentra-apoyo-en-ti" },
      { emotion: "Iluminación", value: "700-1000", guidance: "Esta escala es una brújula simbólica, no una medida científica. Vuelve a la presencia y a la humildad de un gesto concreto.", discoverySlug: "empieza-sin-luchar" },
    ],
  },
];

export const allCatalogItems = [...discoveries, ...depthPractices];

export function getCatalogItem(kind: string, slug: string) {
  const source = kind === "extra" ? depthPractices : discoveries;
  return source.find((item) => item.slug === slug);
}
