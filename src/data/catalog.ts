import type { CatalogItem, CompassZone } from "@/types/app";

export const discoveries: CatalogItem[] = [
  {
    id: "discovery-01",
    slug: "empieza-sin-luchar",
    index: 0,
    number: 1,
    kind: "discovery",
    title: "Empieza sin prisa",
    description: "Hoy puedes dedicarte un momento para reconocer cómo te sientes. Elige una emoción que te resulte familiar y observa qué necesitas.",
    focus: "La emoción que sientes ahora y lo que te dices cuando aparece.",
    whyItMatters: "Reconocer una emoción puede ayudarte a decidir qué hacer: descansar, hablar con alguien o seguir con tu actividad.",
    presence: "Apoya los pies en el suelo y la espalda en la silla. Acomódate como te resulte cómodo. Observa tres cosas a tu alrededor. Deja que el aire entre y salga naturalmente, sin esfuerzo.",
    insight: "Puedes sentir alegría, inquietud, tristeza u otra emoción. Para empezar, pregúntate: «¿Qué estoy sintiendo?». Si aún no encuentras una palabra, puedes decirte: «Todavía no sé cómo llamarlo».",
    perspectives: [
      "Puedes reconocer lo que sientes y decidir después qué hacer. Tienes tiempo para escucharte."
    ],
    prompts: [
      "¿Qué emoción o sensación noto hoy?",
      "¿Qué me digo a mí misma cuando aparece?",
      "¿Qué cambiaría si me diera unos segundos antes de responder?"
    ],
    action: "Elige una emoción que te resulte familiar. Puedes hacer el ejercicio en silencio.",
    actionSteps: [
      "Recuerda un momento de hoy, como un desayuno tranquilo o una llamada pendiente.",
      "Pregúntate: «¿Qué siento al recordar ese momento?». Elige tus propias palabras.",
      "Di en silencio el nombre de la emoción. Por ejemplo: «Hoy siento inquietud».",
      "Pregúntate qué necesitas ahora. Puede ser beber agua, moverte, descansar o conversar con alguien. Elige lo que te ayude."
    ],
    durationLabel: "Alrededor de 1 minuto",
    seed: "Puedo escuchar lo que siento.",
    mentorNote: "Gracias por tomarte este tiempo para ti. Puedes repetir esta pausa cuando la necesites.",
    closing: "Puede que hoy sigas sintiendo lo mismo. Te has dedicado un momento para escucharte.",
    integrationInvitation: {
      title: "Un momento para ti",
      text: "Cuando notes una emoción durante el día, detente unos segundos. Reconoce qué estás sintiendo. Si te ayuda, repite la frase de abajo en silencio.",
      reminder: "Puedo tomarme unos segundos para reconocer lo que siento."
    }
  },
  {
    id: "discovery-02",
    slug: "mira-donde-estas",
    index: 1,
    number: 2,
    kind: "discovery",
    title: "Observa cómo te sientes hoy",
    description: "Qué bueno que regresaste. Hoy vas a recordar una situación de tu día, reconocer qué necesitas y pensar quién o qué podría ayudarte.",
    focus: "Una situación que tengas en mente, cómo te sientes y qué necesitas ahora.",
    whyItMatters: "Saber cómo estás puede ayudarte a elegir qué atender primero y qué ayuda pedir.",
    presence: "Apoya la espalda en la silla o elige otra postura cómoda. Observa cómo está tu cuerpo. Termina esta frase con tus propias palabras: «Hoy me siento...». Puedes pensar la respuesta, decirla o escribirla.",
    insight: "Puedes sentir varias cosas a la vez. Por ejemplo: «Estoy cansada y me alegra haber hablado con una amiga». Observar cómo estás es reconocer lo que sientes en este momento.",
    perspectives: [
      "Lo que sientes hoy puede cambiar. Por ahora, basta con describir cómo estás."
    ],
    prompts: [
      "¿En qué situación de hoy estoy pensando?",
      "¿Qué necesito en este momento?",
      "¿Quién podría ayudarme o qué podría hacerme bien?"
    ],
    action: "Recuerda una parte de tu día, como el desayuno o una conversación. Termina estas tres frases como prefieras.",
    actionSteps: [
      "Termina: «Hoy pasó...». Por ejemplo: «Hoy tuve varias tareas pendientes».",
      "Termina: «Ahora necesito...». Por ejemplo: «Ahora necesito descansar unos minutos».",
      "Termina: «Podría ayudarme...». Puede ser una persona, hacer una pausa o pedir información.",
      "Piensa en tus tres respuestas y elige qué quieres atender primero. Si todavía no lo sabes, puedes terminar aquí."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo reconocer cómo estoy hoy.",
    mentorNote: "Puedes usar tus propias palabras. Una frase sencilla es suficiente para reconocer cómo estás.",
    closing: "Ahora puedes elegir si quieres descansar, seguir con tu día o pedir ayuda para algo.",
    integrationInvitation: {
      title: "Reconoce cómo estás",
      text: "Al terminar una actividad, pregúntate: «¿Cómo me siento ahora?». Puedes responder con una palabra, como «cansada», «tranquila» o la que tú elijas.",
      reminder: "Puedo observar cómo me siento."
    }
  },
  {
    id: "discovery-03",
    slug: "siente-mas-piensa-menos",
    index: 2,
    number: 3,
    kind: "discovery",
    title: "Reconoce lo que piensas y sientes",
    description: "Una idea puede repetirse y hacerte sentir tristeza, enojo o inquietud. Hoy vas a reconocer esa idea y hacer una pausa para respirar.",
    focus: "Lo que ocurrió, lo que piensas sobre eso y la emoción que sientes al recordarlo.",
    whyItMatters: "Distinguir lo que sabes de lo que imaginas puede ayudarte a decidir si quieres preguntar algo o esperar más información.",
    presence: "Siéntate con la espalda apoyada y los pies en el suelo. Puedes mantener los ojos abiertos o fijar la vista en un objeto. Nota cómo la silla sostiene tu espalda y cómo se sienten tus pies sobre el suelo.",
    insight: "Por ejemplo: enviaste un mensaje y aún no te respondieron. Eso es lo que sabes. Pensar «está molesta conmigo» es una posible explicación, pero todavía no sabes si es así. Esa idea puede hacerte sentir tristeza o enojo.",
    perspectives: [
      "Puedes reconocer esa emoción y preguntarte qué información te falta. También puedes notar una sensación del cuerpo, como calor en las manos o tensión en los hombros."
    ],
    prompts: [
      "¿Qué pasó y qué estoy pensando sobre eso?",
      "¿Qué emoción siento al pensar en esa situación?",
      "¿Qué información conozco y qué parte estoy imaginando?"
    ],
    action: "Prueba esta pausa. Lee los pasos antes de empezar; después puedes hacerlos a tu ritmo.",
    actionSteps: [
      "Reconoce la idea que se repite y la emoción que te produce. Por ejemplo: «Pienso que mi amiga está molesta y siento tristeza».",
      "Observa un objeto o cierra los ojos si te resulta cómodo. Nota la presión de tus pies sobre el suelo.",
      "Toma aire lentamente: eso es inhalar. Después suéltalo con suavidad, un poco más despacio: eso es exhalar. Repítelo cinco veces, a tu ritmo y sin esfuerzo.",
      "Durante unos 30 segundos, nota cómo se sienten tus pies o tus manos. Después termina la frase: «Ahora noto...». Puedes decir «mis manos están tibias», por ejemplo."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo distinguir lo que sé de lo que imagino.",
    mentorNote: "Puedes tomarte un momento antes de seguir pensando en esa situación. Puedes decidir después qué quieres preguntar.",
    closing: "Al terminar, observa cómo te sientes ahora. Puedes seguir con tu día o descansar un poco.",
    integrationInvitation: {
      title: "Haz una pausa para respirar",
      text: "Si notas que vuelves a pensar en lo mismo, detente unos segundos. Siente tus pies sobre el suelo. Toma aire y suéltalo naturalmente, sin esfuerzo.",
      reminder: "Puedo detenerme y respirar antes de seguir."
    }
  },
  {
    id: "discovery-04",
    slug: "cuestiona-tus-reglas",
    index: 3,
    number: 4,
    kind: "discovery",
    title: "Observa cómo te hablas",
    description: "Hoy vas a observar qué palabras te dices al hacer una tarea. Puedes probar otra frase y decidir si te ayuda.",
    focus: "Una frase que te dices a menudo y cómo te sientes al escucharla.",
    whyItMatters: "Cambiar una frase puede ayudarte a ver otra opción, como hacer una parte de la tarea o pedir ayuda.",
    presence: "Piensa en una tarea de hoy. Recuerda qué te dijiste al hacerla. Repite esa frase en silencio y observa cómo te sientes.",
    insight: "Las palabras que te dices en silencio forman tu diálogo interno. Una creencia es una idea que has aprendido y que sueles dar por cierta. Por ejemplo: «Si pido ayuda, es porque no puedo». Puedes observar si una frase así se parece a lo que tú piensas.",
    perspectives: [
      "También puedes probar: «Puedo hacer mi parte y pedir ayuda para lo demás». Tú eliges si esa frase tiene sentido para ti."
    ],
    prompts: [
      "¿Qué me digo cuando tengo una tarea pendiente?",
      "¿Cómo me siento al decirme eso?",
      "¿Qué otra frase podría ayudarme en esa situación?"
    ],
    action: "Elige una frase que te digas de verdad. Prueba otras palabras que te parezcan posibles y sinceras.",
    actionSteps: [
      "Recuerda una tarea pequeña, como ordenar una habitación o preparar una llamada.",
      "Reconoce la frase que te dices. Por ejemplo: «Tengo que terminar todo hoy». Si no te reconoces en el ejemplo, elige otra.",
      "Prueba una frase distinta. Por ejemplo: «Hoy puedo ordenar una parte y dejar el resto para mañana».",
      "Repite tu nueva frase y observa cómo te sientes. Puedes usarla, cambiarla o seguir pensando en otras palabras."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo elegir otras palabras para hablarme.",
    mentorNote: "La frase es tuya. Elige palabras que entiendas y que puedas creer hoy.",
    closing: "Puedes probar esa frase la próxima vez que hagas una tarea parecida y observar si te ayuda.",
    integrationInvitation: {
      title: "Prueba otras palabras",
      text: "Cuando hagas una tarea, observa qué te dices. Si quieres probar otra frase, empieza por «Hoy puedo...». Por ejemplo: «Hoy puedo hacer una parte y pedir ayuda».",
      reminder: "Puedo probar otra forma de hablarme."
    }
  },
  {
    id: "discovery-05",
    slug: "haz-espacio-a-la-resistencia",
    index: 4,
    number: 5,
    kind: "discovery",
    title: "Decide cómo seguir con una tarea",
    description: "Si has dejado una tarea para después, puedes preguntarte qué necesitas para hacerla. Tal vez sea descansar, pedir información o empezar por una parte.",
    focus: "Una tarea que tienes pendiente y lo que podría ayudarte a hacerla.",
    whyItMatters: "Saber qué te hace falta puede ayudarte a elegir una acción más sencilla o a pedir ayuda.",
    presence: "Piensa en una tarea pequeña, como responder un mensaje. Observa qué sientes al recordarla. Deja que el aire entre y salga naturalmente.",
    insight: "Una tarea puede quedar para después por distintos motivos. Quizá estés cansada o todavía no sepas cómo hacerla. Puedes preguntarte qué pasa hoy, en lugar de decidir de antemano por qué la has pospuesto.",
    perspectives: [
      "También puedes querer hacer algo y necesitar más tiempo. Puedes tener en cuenta ambas cosas al decidir."
    ],
    prompts: [
      "¿Qué tarea tengo pendiente?",
      "¿Qué necesito para hacerla?",
      "¿Qué parte podría hacer hoy?"
    ],
    action: "Elige una tarea y busca una forma sencilla de empezar o de pedir ayuda.",
    actionSteps: [
      "Nombra una sola tarea. Por ejemplo: «Pedir una cita».",
      "Pregúntate qué te falta. Puede ser el número de teléfono, saber el horario o tener unos minutos libres.",
      "Elige una acción: buscar el número, preguntar el horario o decidir cuándo llamar.",
      "Haz esa acción si te viene bien ahora. También puedes decidir cuándo retomarla o a quién pedir ayuda."
    ],
    durationLabel: "De 1 a 2 minutos para decidir",
    seed: "Puedo decidir qué necesito para seguir.",
    mentorNote: "Al completar este descubrimiento podrás coordinar tu charla con Clarissa y Scarlett. Puedes conversar con nosotras sobre lo que has probado o sobre una duda.",
    closing: "Puedes terminar con una acción elegida o con una pregunta que quieras hacer a alguien.",
    integrationInvitation: {
      title: "Piensa qué te hace falta",
      text: "Si dejas una tarea para después, pregúntate: «¿Qué necesito para hacerla?». Puedes elegir una parte pequeña, pedir información o descansar antes.",
      reminder: "Puedo empezar por una parte o pedir ayuda."
    }
  },
  {
    id: "discovery-06",
    slug: "haz-sitio-a-lo-bueno",
    index: 5,
    number: 6,
    kind: "discovery",
    title: "Reconoce algo agradable",
    description: "Hoy puedes observar algo de tu día que te resulte agradable. Puede ser una bebida, una conversación o sentarte a descansar.",
    focus: "Un momento agradable o cómodo que ya esté ocurriendo en tu día.",
    whyItMatters: "Observar esos momentos puede ayudarte a reconocer qué cosas sencillas disfrutas o te hacen bien.",
    presence: "Observa a tu alrededor. Elige algo que te guste o te resulte cómodo, como una planta o el respaldo de la silla. Quédate unos segundos observándolo.",
    insight: "Puedes tener una preocupación y disfrutar de una taza de té al mismo tiempo. Disfrutar ese momento no borra lo que te preocupa. Puedes reconocer las dos cosas.",
    perspectives: [
      "Si hoy no encuentras algo agradable, puedes elegir algo cómodo, como la temperatura del agua al lavarte las manos."
    ],
    prompts: [
      "¿Qué momento de hoy me resultó agradable?",
      "¿Qué detalle me gustó de ese momento?",
      "¿Me gustaría repetirlo otro día?"
    ],
    action: "Dedica unos segundos a observar algo que te resulte agradable o cómodo.",
    actionSteps: [
      "Elige algo que tengas cerca, como una taza, una planta o una tela suave.",
      "Observa un detalle: el color de la planta, la temperatura de la taza o cómo se siente la tela.",
      "Quédate entre diez y veinte segundos con ese detalle. Puedes respirar de forma natural.",
      "Di en silencio qué te resultó agradable. Después puedes seguir con tu actividad, aunque te sientas igual."
    ],
    durationLabel: "De 10 a 20 segundos de observación",
    seed: "Puedo disfrutar de un momento sencillo.",
    mentorNote: "Puedes observar qué cosas disfrutas, por pequeñas que sean. Tú eliges cuánto tiempo dedicarles.",
    closing: "Puedes recordar ese detalle más tarde o buscar otro que te guste durante el día.",
    integrationInvitation: {
      title: "Disfruta de un detalle",
      text: "Durante una actividad de tu día, observa algo que te guste: el sabor de una bebida, una canción o una conversación. Dedícale unos segundos.",
      reminder: "Puedo disfrutar de este momento."
    },
    hasGift: true
  },
  {
    id: "discovery-07",
    slug: "suelta-una-piedra-a-la-vez",
    index: 6,
    number: 7,
    kind: "discovery",
    title: "Atiende una cosa a la vez",
    description: "Si tienes varias cosas por hacer, puedes elegir una parte pequeña. Hoy vas a decidir qué puedes atender ahora y qué puede esperar.",
    focus: "Una situación que puedas dividir en tareas más pequeñas.",
    whyItMatters: "Elegir una sola tarea puede ayudarte a saber por dónde empezar y cuándo hacer una pausa.",
    presence: "Observa el lugar donde estás. Piensa en una tarea de hoy, como ordenar la casa o preparar una conversación. Elige solo una para este ejercicio.",
    insight: "«Ordenar la casa» reúne muchas tareas. Puedes separarlas: guardar la ropa, recoger la mesa o lavar unos platos. Así puedes elegir una parte que se ajuste al tiempo que tienes hoy.",
    perspectives: [
      "También puedes elegir pedir ayuda o descansar. Ten en cuenta cómo estás antes de decidir."
    ],
    prompts: [
      "¿Qué quiero atender hoy?",
      "¿En qué partes pequeñas puedo dividirlo?",
      "¿Cuál puedo hacer con el tiempo y la energía que tengo?"
    ],
    action: "Elige una parte de una tarea. Puedes pensarla o escribirla.",
    actionSteps: [
      "Nombra una tarea: «Organizar la casa», por ejemplo.",
      "Sepárala en dos o tres partes, como guardar la ropa, recoger la mesa y lavar los platos.",
      "Elige una acción de menos de diez minutos. Por ejemplo: «Voy a guardar tres prendas».",
      "Haz esa parte si puedes ahora. Al terminar, decide si quieres descansar o continuar con otra cosa."
    ],
    durationLabel: "1 minuto para elegir; hasta 10 para hacer la tarea",
    seed: "Puedo hacer una cosa a la vez.",
    mentorNote: "Puedes reconocer la parte que hiciste hoy y dejar las demás para cuando tengas tiempo.",
    closing: "Puedes terminar por hoy después de atender esa parte. Tú decides cómo continuar.",
    integrationInvitation: {
      title: "Elige una sola tarea",
      text: "Cuando se junten varias cosas por hacer, elige una parte pequeña. Por ejemplo: responder un mensaje o guardar un objeto. Después decide qué quieres hacer.",
      reminder: "Ahora puedo atender esta parte."
    }
  },
  {
    id: "discovery-08",
    slug: "mira-tus-pensamientos-con-distancia",
    index: 7,
    number: 8,
    kind: "discovery",
    title: "Separa lo que sabes de lo que imaginas",
    description: "A veces una idea parece segura aunque todavía nos falte información. Hoy vas a distinguir lo que sabes de lo que estás suponiendo.",
    focus: "Una idea que se repite y la información que tienes sobre esa situación.",
    whyItMatters: "Reconocer qué sabes y qué te falta puede ayudarte a hacer una pregunta o a esperar antes de decidir.",
    presence: "Piensa en una situación sencilla de hoy. Puedes escribir tu idea, decirla en voz baja o pensarla en silencio. Elige la forma que prefieras.",
    insight: "Si piensas «seguro que la cita saldrá mal», estás imaginando lo que puede pasar. Todavía no sabes cómo será. Puedes cambiar esa frase por «me preocupa cómo será la cita» y pensar qué información necesitas.",
    perspectives: [
      "Lo que imaginas puede hacerte sentir algo real. Puedes reconocer esa emoción y comprobar lo que aún no sabes."
    ],
    prompts: [
      "¿Qué estoy pensando sobre esta situación?",
      "¿Qué sé que ocurrió?",
      "¿Qué me gustaría preguntar o comprobar?"
    ],
    action: "Elige una idea y distingue qué sabes y qué todavía no sabes.",
    actionSteps: [
      "Di tu idea en silencio. Por ejemplo: «Mi amiga está molesta porque no respondió».",
      "Añade al principio: «Estoy pensando que...». Repite la frase completa.",
      "Nombra lo que sabes: «Le envié un mensaje y aún no respondió». Después di lo que no sabes: «No sé por qué».",
      "Elige si quieres preguntarle, esperar o seguir con otra actividad por ahora."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo preguntar antes de sacar una conclusión.",
    mentorNote: "Puedes darte tiempo para conocer más antes de decidir qué significa una situación para ti.",
    closing: "Puedes terminar reconociendo lo que sabes y la pregunta que todavía quieres hacer.",
    integrationInvitation: {
      title: "Comprueba lo que sabes",
      text: "Cuando pienses «seguro que...», pregúntate: «¿Lo sé o lo estoy imaginando?». Puedes buscar más información o darte tiempo para saberlo.",
      reminder: "Puedo comprobar lo que sé y preguntar lo que me falta."
    }
  },
  {
    id: "discovery-09",
    slug: "un-pequeno-si-puedo",
    index: 8,
    number: 9,
    kind: "discovery",
    title: "Haz algo que te ayude hoy",
    description: "Hay días en los que tienes menos energía. Hoy puedes elegir algo sencillo que te ayude, como beber agua, sentarte un rato o pedir compañía.",
    focus: "Lo que necesitas ahora y una acción que puedas hacer hoy.",
    whyItMatters: "Atender una necesidad sencilla puede ayudarte a cuidarte, aunque otras tareas queden para después.",
    presence: "Observa si tienes sed, hambre o ganas de descansar. Puedes empezar por una de esas señales. Deja que el aire entre y salga naturalmente.",
    insight: "Lo que puedes hacer cambia de un día a otro. Si hoy tienes menos energía, puedes elegir una tarea más pequeña o descansar. Por ejemplo, servirte agua puede ser lo que necesitas ahora.",
    perspectives: [
      "Pedir compañía también es una opción. Puedes decir: «¿Tienes un momento para hablar conmigo?»."
    ],
    prompts: [
      "¿Qué necesito ahora?",
      "¿Qué podría hacer en unos minutos para atenderlo?",
      "¿Me ayudaría pedir algo a alguien?"
    ],
    action: "Elige una acción sencilla para atender una necesidad de hoy.",
    actionSteps: [
      "Reconoce una necesidad: beber agua, comer, descansar o hablar con alguien.",
      "Elige una acción de menos de cinco minutos. Por ejemplo: «Voy a servirme un vaso de agua».",
      "Hazla si puedes ahora. Si necesitas ayuda, piensa a quién podrías pedírsela.",
      "Al terminar, observa cómo estás. Puedes reconocer lo que hiciste sin añadir otra tarea."
    ],
    durationLabel: "Menos de 5 minutos",
    seed: "Puedo atender una necesidad de hoy.",
    mentorNote: "Puedes ajustar lo que haces a cómo te sientes hoy. Descansar y pedir ayuda también son opciones.",
    closing: "Puedes terminar después de esa acción, aunque tu ánimo siga igual que al comenzar.",
    integrationInvitation: {
      title: "Atiende algo sencillo",
      text: "Durante el día, pregúntate: «¿Qué necesito ahora?». Puedes beber agua, cambiar de postura, descansar o pedir compañía. Elige una sola cosa.",
      reminder: "Puedo atender lo que necesito ahora."
    }
  },
  {
    id: "discovery-10",
    slug: "afloja-la-necesidad-de-ganar",
    index: 9,
    number: 10,
    kind: "discovery",
    title: "Prepara lo que quieres decir",
    description: "Antes de una conversación, puedes pensar qué quieres expresar. Hoy vas a preparar una frase que diga cómo estás y qué necesitas.",
    focus: "Lo que quieres que otra persona entienda y una forma clara de decirlo.",
    whyItMatters: "Preparar tus palabras puede ayudarte a expresar una necesidad, hacer una pregunta o pedir tiempo para responder.",
    presence: "Elige una conversación de todos los días. Vas a practicar a solas. Puedes decidir después si quieres hablar con esa persona.",
    insight: "Puedes decir «me preocupa este cambio de horario y quisiera que lo habláramos». La frase cuenta cómo estás y qué pides. También puedes decir «necesito un momento para pensar» si prefieres responder más tarde.",
    perspectives: [
      "Puedes expresar lo que necesitas y escuchar la respuesta de la otra persona. Si hablar no se siente seguro, puedes tomar distancia y pedir ayuda."
    ],
    prompts: [
      "¿Qué quiero que la otra persona comprenda?",
      "¿Cómo me siento al pensar en esa conversación?",
      "¿Qué quiero pedir o preguntar?"
    ],
    action: "Prueba una frase a solas. Puedes pensarla, decirla o escribirla.",
    actionSteps: [
      "Elige una situación sencilla, como un cambio de horario que quieras conversar.",
      "Di cómo te sientes: «Me preocupa que cambiemos la hora a último momento».",
      "Añade una petición: «¿Podemos avisarnos con más tiempo?».",
      "Repite la frase con tus propias palabras. Elige si quieres usarla después, cambiarla o pedir tiempo antes de hablar."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo decir cómo me siento y qué necesito.",
    mentorNote: "Puedes hablar con claridad y tomarte tiempo para responder. Tú decides cuándo conversar.",
    closing: "Puedes terminar con una frase preparada y elegir más adelante si quieres compartirla.",
    integrationInvitation: {
      title: "Piensa antes de responder",
      text: "Antes de responder en una conversación importante, deja entrar y salir el aire una vez. Pregúntate qué quieres decir. Puedes hablar, preguntar o pedir un momento.",
      reminder: "Puedo tomarme tiempo para responder."
    }
  },
  {
    id: "discovery-11",
    slug: "libera-el-peso-de-culpar",
    index: 10,
    number: 11,
    kind: "discovery",
    title: "Reconoce qué necesitas ahora",
    description: "Al recordar una situación que te afectó, puedes reconocer cómo te sientes hoy. Después puedes elegir qué ayuda o cuidado necesitas.",
    focus: "Lo que sientes al recordar una situación y lo que necesitas en este momento.",
    whyItMatters: "Reconocer una necesidad puede ayudarte a pedir compañía, descansar o decidir qué quieres conversar.",
    presence: "Elige una situación de todos los días que te resulte cómodo recordar. Puedes dejar otros recuerdos para un momento en que tengas compañía.",
    insight: "Por ejemplo, alguien cambió un acuerdo y eso te molestó. Puedes reconocer lo que pasó y decir: «Hoy necesito aclarar qué acordamos». También puedes necesitar descanso o tiempo antes de hablar.",
    perspectives: [
      "Tú eliges si quieres hablar, tomar distancia o pedir compañía. Puedes atender lo que necesitas ahora."
    ],
    prompts: [
      "¿Qué siento al recordar esa situación?",
      "¿Qué necesito hoy?",
      "¿Qué puedo pedir o hacer para atender esa necesidad?"
    ],
    action: "Piensa en una necesidad de hoy y elige cómo atenderla.",
    actionSteps: [
      "Recuerda una situación cotidiana que te resulte cómoda para este ejercicio.",
      "Termina esta frase: «Hoy necesito...». Por ejemplo: «Hoy necesito descansar antes de decidir».",
      "Elige una acción, como hacer una pausa, pedir compañía o preparar una pregunta.",
      "Vuelve a observar el lugar donde estás. Si recordar la situación te hace sentir peor, puedes parar y buscar compañía."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo atender lo que necesito hoy.",
    mentorNote: "Lo que viviste merece respeto. Puedes elegir qué contar, a quién y en qué momento.",
    closing: "Puedes terminar el ejercicio con una necesidad reconocida, aunque todavía no sepas cómo atenderla.",
    integrationInvitation: {
      title: "Pregunta qué necesitas",
      text: "Si vuelves a pensar en una situación que te afectó, pregúntate: «¿Qué necesito ahora?». Puede ser descanso, compañía, distancia o una conversación.",
      reminder: "Puedo elegir cómo cuidarme hoy."
    }
  },
  {
    id: "discovery-12",
    slug: "querer-sin-agarrar",
    index: 11,
    number: 12,
    kind: "discovery",
    title: "Cuida lo que quieres y cuida de ti",
    description: "Puedes querer a una persona o disfrutar de un proyecto y también dedicarte tiempo a ti. Hoy vas a pensar cómo atender ambas cosas.",
    focus: "Algo que valoras y una necesidad tuya que también quieras atender.",
    whyItMatters: "Reconocer ambas cosas puede ayudarte a decidir cuánto tiempo dedicar, qué pedir y qué quieres reservar para ti.",
    presence: "Piensa en una persona, una actividad o un proyecto que valores. Elige algo que te resulte cómodo recordar hoy.",
    insight: "Puedes disfrutar de conversar con alguien y necesitar descansar después. Puedes querer terminar un proyecto y pedir más tiempo. Decir lo que necesitas permite que la otra persona lo conozca.",
    perspectives: [
      "Puedes ofrecer algo y también preguntar si le viene bien a la otra persona. Cada una puede expresar lo que necesita."
    ],
    prompts: [
      "¿Qué valoro de esa persona, actividad o proyecto?",
      "¿Qué quiero ofrecer y cuánto tiempo tengo hoy?",
      "¿Qué necesito reservar para mí?"
    ],
    action: "Piensa en algo que quieras cuidar y en un cuidado para ti.",
    actionSteps: [
      "Elige una relación o actividad que valores. Puede ser conversar con una amiga o dedicarte a una afición.",
      "Nombra qué disfrutas de ella. Por ejemplo: «Me gusta compartir tiempo con mi amiga».",
      "Reconoce qué necesitas tú. Por ejemplo: «Hoy también necesito acostarme temprano».",
      "Elige cómo atender ambas cosas: proponer una llamada más corta, cambiar de horario o reservar tiempo para otro día."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo querer a alguien y atender mis necesidades.",
    mentorNote: "Puedes expresar cariño y decir cuánto tiempo tienes. Ambas cosas pueden formar parte de una relación.",
    closing: "Puedes terminar con una idea de qué quieres ofrecer y qué necesitas para ti hoy.",
    integrationInvitation: {
      title: "Ten en cuenta tus necesidades",
      text: "Al organizar tiempo con alguien o con un proyecto, pregúntate cuánto tiempo quieres dedicar y qué necesitas para ti. Puedes expresar ambas cosas.",
      reminder: "Mis necesidades también cuentan al hacer planes."
    }
  },
  {
    id: "discovery-13",
    slug: "dale-espacio-a-la-tristeza",
    index: 12,
    number: 13,
    kind: "discovery",
    title: "Acompáñate cuando sientas tristeza",
    description: "Si hoy sientes tristeza, puedes reconocerla durante un momento y elegir cómo cuidarte. Puedes hacerlo con compañía y parar cuando quieras.",
    focus: "Cómo te sientes y qué te ayudaría a estar acompañada o más cómoda ahora.",
    whyItMatters: "Reconocer la tristeza puede ayudarte a decir cómo estás y a pedir la compañía que necesitas.",
    presence: "Busca un lugar donde te sientas cómoda. Observa tres cosas a tu alrededor. Puedes tener cerca agua o el teléfono de alguien con quien quieras hablar.",
    insight: "La tristeza puede sentirse como ganas de llorar, cansancio o pocas ganas de hablar. Cada persona la vive de forma distinta. Puedes reconocer cómo te sientes y elegir cuánto tiempo dedicar a este ejercicio.",
    perspectives: [
      "Si la tristeza continúa y te cuesta hacer tus actividades de cada día, pedir atención profesional también es una forma de cuidarte."
    ],
    prompts: [
      "¿Cómo se siente hoy la tristeza en mí?",
      "¿Qué me haría estar más cómoda ahora?",
      "¿Con quién me gustaría conversar?"
    ],
    action: "Solo si te apetece, dedica unos segundos a reconocer cómo estás.",
    actionSteps: [
      "Siéntate o elige una postura cómoda. Puedes mantener los ojos abiertos.",
      "Di en silencio: «Hoy siento tristeza». Puedes añadir por qué, si quieres, o dejar la frase así.",
      "Quédate unos segundos, o hasta un minuto si te viene bien. Puedes mirar por la ventana o sostener una taza.",
      "Para terminar, observa tres objetos del lugar. Elige si quieres beber agua, descansar o hablar con alguien. Si te sientes peor, para y busca compañía."
    ],
    durationLabel: "Unos segundos o hasta 1 minuto",
    seed: "Puedo pedir compañía cuando la necesito.",
    mentorNote: "Puedes elegir qué contar y con quién hablar. No tienes que contar todo para recibir compañía.",
    closing: "Puedes terminar cuando lo necesites y buscar la ayuda que te venga bien hoy.",
    integrationInvitation: {
      title: "Elige cómo acompañarte",
      text: "Si notas tristeza durante el día, puedes preguntarte qué te ayudaría ahora. Tal vez sea sentarte, beber agua o hablar con alguien. Puedes pedir compañía.",
      reminder: "Puedo dejarme acompañar."
    }
  },
  {
    id: "discovery-14",
    slug: "encuentra-apoyo-en-ti",
    index: 13,
    number: 14,
    kind: "discovery",
    title: "Reconoce cómo puedes ayudarte",
    description: "Hoy vas a recordar algo que te haya ayudado antes. Después puedes elegir qué puedes hacer tú y qué ayuda quieres pedir a otra persona.",
    focus: "Una forma de ayudarte que ya conoces y alguien a quien puedas pedir compañía o información.",
    whyItMatters: "Recordar lo que te ha ayudado antes puede darte ideas para atender lo que necesitas hoy.",
    presence: "Recuerda un momento en que algo te ayudó. Puede haber sido descansar, preguntar, conversar o dedicarte a una actividad que disfrutas.",
    insight: "Ayudarte puede ser organizar una tarea, descansar o hablarte con amabilidad. También puedes necesitar lo que sabe otra persona o su compañía. Puedes combinar ambas formas de ayuda.",
    perspectives: [
      "Pedir ayuda puede ser una decisión concreta: reconoces qué necesitas y se lo dices a alguien."
    ],
    prompts: [
      "¿Qué me ha ayudado en otras ocasiones?",
      "¿Qué puedo hacer hoy para ayudarme?",
      "¿A quién podría pedir compañía o información?"
    ],
    action: "Piensa en una forma de ayudarte hoy y en una ayuda que podrías pedir.",
    actionSteps: [
      "Recuerda algo que te haya servido antes, como preparar una lista o descansar unos minutos.",
      "Termina: «Hoy puedo ayudarme con...». Elige algo que puedas hacer.",
      "Termina: «Podría pedir ayuda para...». Piensa a quién podrías pedírsela.",
      "Elige una de las dos opciones. Si decides pedir ayuda, prepara una frase como «¿Puedes escucharme unos minutos?»."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo ayudarme y pedir ayuda.",
    mentorNote: "Puedes hacer algunas cosas por ti misma y contar con otras personas para las demás.",
    closing: "Puedes terminar con una acción que quieras probar o con una petición que quieras hacer.",
    integrationInvitation: {
      title: "Recuerda una ayuda que conoces",
      text: "Cuando necesites ayuda, recuerda qué te sirvió antes. Puede ser descansar, organizarte o conversar. Elige algo que puedas hacer o pedir hoy.",
      reminder: "Puedo usar lo que he aprendido y pedir ayuda."
    }
  },
  {
    id: "discovery-15",
    slug: "mira-al-miedo-con-ternura",
    index: 14,
    number: 15,
    kind: "discovery",
    title: "Acompáñate cuando sientas miedo",
    description: "Si una decisión pequeña te da miedo, puedes pensar qué necesitas saber antes de elegir. Puede ayudarte preparar una pregunta, esperar o pedir compañía.",
    focus: "Una preocupación de hoy y la información o compañía que necesitas antes de decidir.",
    whyItMatters: "Saber qué te preocupa puede ayudarte a elegir una acción que te resulte segura y posible.",
    presence: "Observa el lugar donde estás y nota el apoyo de tus pies. Recuerda una decisión sencilla, como preguntar por una actividad nueva.",
    insight: "Puedes querer probar algo y sentir miedo al mismo tiempo. Por ejemplo, te interesa una clase, pero te preocupa no conocer a nadie. Puedes preguntar cómo es la clase o pedir a alguien que te acompañe.",
    perspectives: [
      "Si hay un peligro real, lo primero es buscar un lugar seguro y pedir ayuda. Este ejercicio se propone para decisiones cotidianas."
    ],
    prompts: [
      "¿Qué me preocupa de esta decisión?",
      "¿Qué información me gustaría tener?",
      "¿Qué me ayudaría a decidir con más calma?"
    ],
    action: "Elige una decisión pequeña. Puedes prepararte para ella sin tener que resolverla ahora.",
    actionSteps: [
      "Nombra la decisión. Por ejemplo: «Quiero preguntar por una clase nueva».",
      "Di qué te preocupa: «Me preocupa no conocer a nadie», por ejemplo.",
      "Elige qué te ayudaría: preguntar cómo es la clase, conocer el lugar o pedir compañía.",
      "Decide si quieres hacer eso hoy o darte más tiempo. Al completar este descubrimiento podrás volver a tus respuestas iniciales y conocer las doce prácticas."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo preguntar, pedir ayuda y decidir a mi ritmo.",
    mentorNote: "Gracias por dedicarte estos quince encuentros. Puedes volver a los ejercicios que te hayan servido y seguir practicando.",
    closing: "Puedes reconocer qué aprendiste, qué quieres repetir y qué ayuda te gustaría recibir ahora.",
    integrationInvitation: {
      title: "Prepara una decisión pequeña",
      text: "Ante algo nuevo, pregúntate qué necesitas saber y qué ayuda te vendría bien. Puedes hacer una pregunta, pedir compañía o darte más tiempo para decidir.",
      reminder: "Puedo elegir qué necesito antes de decidir."
    }
  }
];

export const depthPractices: CatalogItem[] = [
  {
    id: "extra-01",
    slug: "desear-sin-urgencia",
    index: 0,
    number: 1,
    kind: "extra",
    title: "Elige una acción para tu meta",
    description: "Piensa en algo que quieras hacer. Hoy vas a elegir una acción pequeña que dependa de ti.",
    presence: "Acomódate y piensa en una meta de todos los días, como retomar las caminatas o aprender una receta.",
    insight: "Para acercarte a una meta puedes elegir algo que puedas hacer hoy. Si quieres caminar mañana, por ejemplo, hoy puedes preparar el calzado. Hay otras cosas, como el clima, que conocerás después.",
    prompts: [
      "¿Qué me gustaría hacer?",
      "¿Qué puedo preparar o hacer hoy?"
    ],
    action: "Elige una acción de menos de cinco minutos.",
    actionSteps: [
      "Nombra una meta concreta: «Quiero volver a caminar por las tardes», por ejemplo.",
      "Piensa en algo que puedas hacer tú, como preparar el calzado o preguntar un horario.",
      "Elige una sola acción y hazla si tienes tiempo ahora.",
      "Al terminar, reconoce qué preparaste. Puedes decidir más adelante cuándo continuar."
    ],
    durationLabel: "Menos de 5 minutos",
    seed: "Puedo hacer una parte hoy.",
    mentorNote: "Puedes acercarte a lo que quieres con acciones pequeñas y ajustar tus planes cuando lo necesites."
  },
  {
    id: "extra-02",
    slug: "enfado-que-no-manda",
    index: 1,
    number: 2,
    kind: "extra",
    title: "Reconoce qué necesitas cuando te enojas",
    description: "Si sientes enojo, puedes tomarte un momento para pensar qué necesitas antes de responder.",
    presence: "Elige una molestia de todos los días que puedas recordar con comodidad. Vas a practicar a solas.",
    insight: "El enojo puede aparecer cuando algo te importa. Por ejemplo, si una llamada interrumpe tu descanso, quizá necesites acordar otro horario. Puedes reconocer lo que sientes y elegir cómo expresarlo.",
    prompts: [
      "¿Qué me molestó de esa situación?",
      "¿Qué me gustaría pedir o aclarar?"
    ],
    action: "Prepara una frase para decir cómo te sientes y qué necesitas.",
    actionSteps: [
      "Recuerda la situación con pocas palabras. Por ejemplo: «Me llamaron mientras descansaba».",
      "Deja que el aire entre y salga naturalmente una vez.",
      "Prueba una frase: «Me molestó la llamada a esa hora. ¿Podemos hablar más tarde?».",
      "Cambia las palabras para que se parezcan a las tuyas. Puedes usarlas después o pedir más tiempo antes de hablar."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo decir qué necesito antes de responder.",
    mentorNote: "Puedes sentir enojo y tomarte tiempo para elegir tus palabras. Si hablar no es seguro, puedes tomar distancia y pedir ayuda."
  },
  {
    id: "extra-03",
    slug: "aflojar-la-armadura",
    index: 2,
    number: 3,
    kind: "extra",
    title: "Date tiempo para aprender",
    description: "Elige algo que estés aprendiendo. Hoy puedes reconocer qué sabes hacer y preparar una pregunta sobre lo que te falta.",
    presence: "Piensa en una actividad sencilla, como usar una función del teléfono o preparar una receta.",
    insight: "Cuando aprendes algo, hay partes que ya conoces y otras que todavía necesitas practicar. Una pregunta concreta puede ayudarte a continuar. Por ejemplo: «¿Dónde encuentro la nota que escribí?».",
    prompts: [
      "¿Qué estoy aprendiendo?",
      "¿Qué me gustaría preguntar o practicar?"
    ],
    action: "Elige una duda y piensa cómo podrías encontrar una respuesta.",
    actionSteps: [
      "Termina esta frase: «Estoy aprendiendo a...».",
      "Reconoce una parte que ya sabes hacer, aunque sea pequeña.",
      "Prepara una pregunta sobre lo que aún quieres aprender. Intenta preguntar por una sola cosa.",
      "Decide si quieres preguntar a alguien, volver a leer una indicación o practicar otro día."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo aprender poco a poco y hacer preguntas.",
    mentorNote: "Puedes preguntar las veces que necesites y darte tiempo para practicar."
  },
  {
    id: "extra-04",
    slug: "un-paso-valiente",
    index: 3,
    number: 4,
    kind: "extra",
    title: "Prepara un paso que quieras dar",
    description: "Piensa en algo nuevo que quieras probar. Puedes preparar una parte pequeña y elegir si necesitas compañía.",
    presence: "Apoya los pies o la espalda donde te resulte cómodo. Piensa en una actividad que sea segura para ti.",
    insight: "Para probar algo nuevo puedes empezar por conocerlo mejor. Si te interesa una actividad, puedes preguntar el horario antes de decidir si irás. Prepararte también puede incluir pedir compañía.",
    prompts: [
      "¿Qué me gustaría probar?",
      "¿Qué información o compañía me ayudaría?"
    ],
    action: "Prepara una acción pequeña antes de tomar una decisión.",
    actionSteps: [
      "Elige algo cotidiano, como llamar para preguntar por una actividad.",
      "Piensa qué te ayudaría a hacerlo. Por ejemplo, escribir antes la pregunta.",
      "Prepara esa pregunta o pide a alguien que te acompañe.",
      "Elige si quieres llamar hoy o darte más tiempo. Puedes terminar con la pregunta preparada."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo prepararme antes de decidir.",
    mentorNote: "Puedes decidir qué quieres probar y cuándo hacerlo."
  },
  {
    id: "extra-05",
    slug: "aceptar-para-elegir",
    index: 4,
    number: 5,
    kind: "extra",
    title: "Elige qué puedes hacer ahora",
    description: "Cuando un plan cambia, puedes reconocer cómo te sientes y pensar qué opciones tienes ahora.",
    presence: "Observa tres cosas a tu alrededor. Recuerda un cambio de hoy, como una cita que pasó a otro horario.",
    insight: "Reconocer que algo ocurrió te ayuda a decidir qué hacer después. Si una cita cambió de horario, puedes expresar que te incomoda y preguntar por otra hora. Puedes reconocer el cambio y decir qué prefieres.",
    prompts: [
      "¿Qué ocurrió?",
      "¿Qué quiero preguntar, pedir o hacer ahora?"
    ],
    action: "Nombra lo ocurrido y elige una opción que tengas disponible.",
    actionSteps: [
      "Describe lo que pasó con pocas palabras: «La cita cambió de horario».",
      "Reconoce cómo te sientes. Por ejemplo: «Me incomoda porque ya había organizado mi día».",
      "Piensa en una opción: pedir otra hora, reorganizar una tarea o preguntar por otra fecha.",
      "Elige si quieres hacer eso ahora o decidir más tarde."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo reconocer lo que pasó y elegir qué hacer.",
    mentorNote: "Puedes decir lo que prefieres y preguntar qué otras opciones hay."
  },
  {
    id: "extra-06",
    slug: "amor-con-espacio",
    index: 5,
    number: 6,
    kind: "extra",
    title: "Expresa cariño y tus necesidades",
    description: "Puedes tener un gesto de cariño y también decir lo que necesitas. Hoy vas a pensar cómo hacer ambas cosas.",
    presence: "Elige una relación en la que te sientas cómoda. Si prefieres, piensa en una actividad que disfrutas.",
    insight: "Puedes querer acompañar a alguien y necesitar descansar. Por ejemplo: «Me gustaría escucharte. Hoy tengo diez minutos, ¿te viene bien?». Así la otra persona conoce lo que puedes ofrecer.",
    prompts: [
      "¿Qué gesto de cariño quiero tener?",
      "¿Qué necesito tener en cuenta para mí?"
    ],
    action: "Elige un gesto sencillo que quieras ofrecer.",
    actionSteps: [
      "Piensa en un gesto, como enviar un saludo o escuchar a alguien unos minutos.",
      "Observa cuánto tiempo tienes y cómo te sientes hoy.",
      "Prepara una frase que diga qué ofreces y cuándo puedes hacerlo.",
      "Elige si quieres compartirla ahora o en otro momento. La otra persona también puede decir qué necesita."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo expresar cariño y decir lo que necesito.",
    mentorNote: "Puedes ofrecer compañía de una forma que también te permita descansar y atender tus cosas."
  },
  {
    id: "extra-07",
    slug: "descansar-en-la-quietud",
    index: 6,
    number: 7,
    kind: "extra",
    title: "Haz una pausa de un minuto",
    description: "Dedica unos segundos a observar algo que tengas cerca. Puedes hacer esta pausa con los ojos abiertos.",
    presence: "Siéntate o elige una postura cómoda. Busca un objeto cercano, como una taza o una planta.",
    insight: "Para hacer esta pausa basta con observar un detalle: el color de una hoja o la forma de una taza. Los pensamientos pueden seguir apareciendo. Cuando lo notes, puedes volver a observar el objeto.",
    prompts: [
      "¿Qué detalle puedo observar ahora?",
      "¿Cómo me siento después de detenerme un momento?"
    ],
    action: "Observa un objeto durante unos segundos o hasta un minuto.",
    actionSteps: [
      "Elige un objeto que puedas observar desde donde estás.",
      "Observa su color y su forma. Después elige un solo detalle.",
      "Deja que el aire entre y salga naturalmente, sin esfuerzo. Si te distraes, vuelve a observar ese detalle.",
      "Cuando quieras terminar, observa el resto del lugar y mueve las manos con suavidad. Puedes seguir con tu día."
    ],
    durationLabel: "Unos segundos o hasta 1 minuto",
    seed: "Puedo detenerme un momento y observar.",
    mentorNote: "Puedes hacer la pausa durante el tiempo que te venga bien, aunque sigan apareciendo pensamientos."
  },
  {
    id: "extra-08",
    slug: "escuchar-al-cuerpo",
    index: 7,
    number: 8,
    kind: "extra",
    title: "Observa cómo está tu cuerpo",
    description: "Hoy puedes observar una sensación del cuerpo y elegir algo que te ayude a estar más cómoda.",
    presence: "Acomódate y apoya las manos sobre tus piernas. Puedes mantener los ojos abiertos durante todo el ejercicio.",
    insight: "Puedes notar calor en las manos, tensión en los hombros o ganas de cambiar de postura. Describe lo que sientes con tus propias palabras. Una sensación física puede tener distintas causas; este ejercicio no busca decirte cuál es.",
    prompts: [
      "¿Qué sensación noto ahora?",
      "¿Qué podría hacer para estar más cómoda?"
    ],
    action: "Observa una sola parte del cuerpo y elige un cuidado sencillo.",
    actionSteps: [
      "Elige las manos, los pies o la espalda. Si prefieres, puedes observar un objeto en lugar del cuerpo.",
      "Nombra lo que notas: calor, frescor, tensión o comodidad. También puedes decir «ahora no noto nada particular».",
      "Elige si quieres cambiar de postura, descansar o beber agua si tienes sed. Evita movimientos que te molesten.",
      "Para terminar, vuelve a observar el lugar donde estás. Si una molestia física persiste o te preocupa, consulta con un profesional de salud."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo reconocer una sensación y atender mi cuerpo.",
    mentorNote: "Puedes observar cómo estás y buscar atención de salud cuando la necesites."
  },
  {
    id: "extra-09",
    slug: "relaciones-con-aire",
    index: 8,
    number: 9,
    kind: "extra",
    title: "Practica cómo pedir algo",
    description: "Prepara una petición con palabras claras. Puedes decir cómo te sientes y preguntar por algo concreto.",
    presence: "Piensa en una petición de todos los días. Vas a practicar a solas y decidir después si quieres compartirla.",
    insight: "Una petición es más fácil de entender si dices qué te gustaría. Por ejemplo: «Cuando cambiamos el horario al final, me cuesta organizarme. ¿Podemos avisarnos el día anterior?». La otra persona puede responder y proponer otra opción.",
    prompts: [
      "¿Qué me gustaría pedir?",
      "¿Qué palabras ayudarían a entender mi petición?"
    ],
    action: "Prepara una frase que cuente lo que pasa y lo que quieres pedir.",
    actionSteps: [
      "Describe la situación: «Cuando cambiamos la hora a último momento...».",
      "Añade cómo te afecta: «...me cuesta organizarme».",
      "Haz una petición: «¿Podemos avisarnos el día anterior?».",
      "Repite la frase con tus propias palabras. Puedes decidir después cuándo hablar. Si hablar no es seguro, puedes buscar compañía o ayuda."
    ],
    durationLabel: "De 2 a 3 minutos",
    seed: "Puedo pedir lo que necesito con palabras claras.",
    mentorNote: "Puedes preparar tus palabras, escuchar la respuesta y decidir si quieres seguir conversando."
  },
  {
    id: "extra-10",
    slug: "trabajar-sin-castigarte",
    index: 9,
    number: 10,
    kind: "extra",
    title: "Organiza una tarea y un descanso",
    description: "Elige una parte pequeña de una tarea y decide cuándo descansar. Puedes trabajar teniendo en cuenta cómo estás hoy.",
    presence: "Ajusta tu postura para estar cómoda. Piensa en una tarea de trabajo, de casa o de algo que quieras aprender.",
    insight: "Puedes empezar por una parte de la tarea y detenerte después. Por ejemplo, escribir un párrafo y descansar unos minutos. Al volver, puedes decidir si tienes tiempo y energía para continuar.",
    prompts: [
      "¿Qué parte de la tarea puedo atender hoy?",
      "¿Cuándo me vendría bien descansar?"
    ],
    action: "Elige una acción de unos cinco minutos y una pausa para después.",
    actionSteps: [
      "Nombra una parte pequeña: escribir un párrafo, revisar un mensaje u ordenar un cajón.",
      "Decide cuándo parar. Puedes elegir unos cinco minutos o terminar esa parte de la tarea.",
      "Haz lo que elegiste si tienes tiempo ahora. Si surge una duda, puedes anotarla o preguntar.",
      "Al llegar al momento elegido, haz una pausa. Después decide si quieres continuar o retomar otro día."
    ],
    durationLabel: "Unos 5 minutos y la pausa que elijas",
    seed: "Puedo avanzar y hacer pausas para descansar.",
    mentorNote: "Puedes ajustar tus tareas a cómo te sientes y pedir ayuda cuando la necesites."
  },
  {
    id: "extra-11",
    slug: "mas-amplia-que-mi-historia",
    index: 10,
    number: 11,
    kind: "extra",
    title: "Describe cómo estás hoy",
    description: "Una frase sobre ti puede sonar como si fuera cierta todos los días. Hoy puedes probar una descripción de lo que te pasa ahora.",
    presence: "Recuerda una frase que uses para hablar de ti. Elige una que te resulte cómodo observar hoy.",
    insight: "En lugar de «soy indecisa», puedes decir «hoy me cuesta elegir entre estas dos opciones». La segunda frase describe una situación. También te permite pensar qué necesitas para decidir.",
    prompts: [
      "¿Qué frase uso para describirme?",
      "¿Cómo puedo contar lo que me pasa hoy?"
    ],
    action: "Prueba una frase que diga qué te pasa y en qué situación.",
    actionSteps: [
      "Elige una frase que te digas. Por ejemplo: «Soy indecisa».",
      "Describe el momento: «Hoy me cuesta decidir entre estas dos opciones».",
      "Añade algo que puedas hacer: «Puedo pedir información o darme más tiempo».",
      "Repite la frase y elige las palabras que tengan sentido para ti. Puedes conservarla o cambiarla."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo describir lo que me pasa hoy.",
    mentorNote: "Puedes reconocer cómo estás ahora y dejar abierta la posibilidad de sentirte de otra manera otro día."
  },
  {
    id: "extra-12",
    slug: "gratitud-que-se-vuelve-vida",
    index: 11,
    number: 12,
    kind: "extra",
    title: "Recuerda algo que agradeces",
    description: "Piensa en algo de hoy que te haya hecho bien. Puedes agradecerlo en silencio o elegir un gesto para expresarlo.",
    presence: "Recuerda un momento sencillo, como una conversación, una comida o un descanso. Si hoy no te apetece, puedes elegir otra práctica.",
    insight: "Puedes agradecer que alguien te escuchó y seguir preocupada por otras cosas. Agradecer es reconocer algo que valoras de ese momento. Tú eliges si quieres decirlo o quedarte con ese recuerdo.",
    prompts: [
      "¿Qué agradezco de hoy?",
      "¿Quiero expresarlo de alguna forma?"
    ],
    action: "Reconoce un momento que valores. Después decide si quieres hacer algo más.",
    actionSteps: [
      "Nombra algo de hoy que te haya hecho bien: «Me escucharon unos minutos», por ejemplo.",
      "Piensa qué agradeces de ese momento, como la compañía o la atención que recibiste.",
      "Si lo deseas, elige un gesto sencillo: decir gracias, enviar un mensaje o dedicarte otro descanso.",
      "Hazlo si te viene bien. También puedes terminar reconociendo en silencio lo que agradeces."
    ],
    durationLabel: "De 1 a 2 minutos",
    seed: "Puedo agradecer algo sencillo de hoy.",
    mentorNote: "Gracias por dedicarte este momento. Puedes volver a las prácticas que te hayan servido."
  }
];

export const compassZones: CompassZone[] = [
  {
    id: "oruga",
    stage: "Oruga",
    leadership: "Liderazgos Egocéntricos (-200)",
    calibration: "Fuerza / Baja Calibración",
    title: "Estados de supervivencia, reacción y desconexión",
    detail: "Elige una palabra que se parezca a cómo te sientes. Debajo encontrarás una idea para acompañarte hoy.",
    frequencies: [
      {
        emotion: "Vergüenza",
        value: "20",
        guidance: "Si esta palabra se parece a lo que sientes, puedes preguntarte qué te ayudaría ahora. Tal vez quieras hablar con alguien de confianza o tomarte un momento a solas.",
        discoverySlug: "mira-donde-estas"
      },
      {
        emotion: "Culpa",
        value: "30",
        guidance: "Puedes preguntarte si hay algo que quieras aclarar o reparar. Si todavía no lo sabes, puedes tomarte tiempo y conversar con alguien de confianza.",
        discoverySlug: "libera-el-peso-de-culpar"
      },
      {
        emotion: "Apatía",
        value: "50",
        guidance: "Si tienes pocas ganas o poca energía, puedes empezar por algo sencillo, como beber agua, descansar o pedir compañía.",
        discoverySlug: "un-pequeno-si-puedo"
      },
      {
        emotion: "Sufrimiento",
        value: "75",
        guidance: "Puedes elegir qué necesitas ahora y pedir ayuda para atenderlo. Si lo que sientes es muy intenso o continúa, busca compañía y atención profesional.",
        discoverySlug: "dale-espacio-a-la-tristeza"
      },
      {
        emotion: "Temor",
        value: "100",
        guidance: "Puedes nombrar qué te preocupa y pensar qué información o compañía necesitas. Tú decides cuándo dar un paso o esperar.",
        discoverySlug: "mira-al-miedo-con-ternura"
      },
      {
        emotion: "Deseo",
        value: "125",
        guidance: "Piensa en algo que quieras y elige una acción pequeña que puedas hacer hoy. Puedes decidir el resto cuando tengas más información.",
        discoverySlug: "querer-sin-agarrar"
      },
      {
        emotion: "Ira",
        value: "150",
        guidance: "Si sientes enojo, puedes detenerte antes de responder. Pregúntate qué te molestó y qué quieres pedir o aclarar.",
        discoverySlug: "libera-el-peso-de-culpar"
      },
      {
        emotion: "Orgullo",
        value: "175",
        guidance: "Puedes reconocer algo que hiciste bien. También puedes escuchar otra idea o preguntar algo que quieras comprender.",
        discoverySlug: "afloja-la-necesidad-de-ganar"
      }
    ]
  },
  {
    id: "crisalida",
    stage: "Crisálida",
    leadership: "Liderazgos Transformadores (+200)",
    calibration: "El Puente",
    title: "Estados de aprendizaje y toma de conciencia",
    detail: "Elige una palabra y lee la idea que aparece debajo. Puedes usarla para pensar qué quieres hacer hoy.",
    frequencies: [
      {
        emotion: "Coraje",
        value: "200",
        guidance: "Elige algo pequeño que quieras probar. Puedes prepararlo, pedir compañía o decidir cuándo te viene bien hacerlo.",
        discoverySlug: "un-pequeno-si-puedo"
      },
      {
        emotion: "Neutralidad",
        value: "250",
        guidance: "Puedes observar una situación y darte tiempo antes de decidir. Pregúntate si necesitas saber algo más.",
        discoverySlug: "mira-tus-pensamientos-con-distancia"
      },
      {
        emotion: "Voluntad",
        value: "310",
        guidance: "Si tienes ganas de hacer algo, elige una tarea pequeña y un momento para hacerla. Puedes ajustar el plan después.",
        discoverySlug: "suelta-una-piedra-a-la-vez"
      },
      {
        emotion: "Aceptación",
        value: "350",
        guidance: "Puedes reconocer lo que está ocurriendo y decir cómo te sientes. Después elige qué quieres preguntar, pedir o hacer.",
        discoverySlug: "haz-espacio-a-la-resistencia"
      },
      {
        emotion: "Razonamiento",
        value: "400",
        guidance: "Piensa qué información tienes y qué te falta para decidir. También puedes tener en cuenta cómo te sientes y qué necesitas.",
        discoverySlug: "siente-mas-piensa-menos"
      }
    ]
  },
  {
    id: "mariposa",
    stage: "Mariposa",
    leadership: "Liderazgos Auténticos (+500)",
    calibration: "Poder / Alta Calibración",
    title: "Estados de expansión, conexión, claridad y creación consciente",
    detail: "Puedes reconocer un momento de cariño, alegría o tranquilidad. Elige una palabra para leer una idea sobre ese momento.",
    frequencies: [
      {
        emotion: "Amor",
        value: "500",
        guidance: "Puedes expresar cariño y atender tus necesidades. Piensa qué te gustaría ofrecer y qué necesitas reservar para ti hoy.",
        discoverySlug: "querer-sin-agarrar"
      },
      {
        emotion: "Alegría",
        value: "540",
        guidance: "Puedes dedicar unos segundos a disfrutar de lo que te alegra. Observa qué te gusta de este momento.",
        discoverySlug: "haz-sitio-a-lo-bueno"
      },
      {
        emotion: "Paz",
        value: "600",
        guidance: "Si hoy te sientes tranquila, puedes dedicar un momento a reconocerlo. Observa qué actividad o compañía te está haciendo bien.",
        discoverySlug: "encuentra-apoyo-en-ti"
      },
      {
        emotion: "Iluminación",
        value: "700-1000",
        guidance: "En este mapa, esta palabra habla de sentirte conectada contigo y con lo que te rodea. Puedes observar cómo vives eso hoy, por ejemplo al escuchar a alguien o disfrutar de un lugar.",
        discoverySlug: "empieza-sin-luchar"
      }
    ]
  }
];

export const allCatalogItems = [...discoveries, ...depthPractices];

export function getCatalogItem(kind: string, slug: string) {
  const source = kind === "extra" ? depthPractices : discoveries;
  return source.find((item) => item.slug === slug);
}
