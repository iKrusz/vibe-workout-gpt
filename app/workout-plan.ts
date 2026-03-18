export type MotionType =
  | "mobility"
  | "pushup"
  | "pike"
  | "plank"
  | "dip"
  | "climber"
  | "core"
  | "squat"
  | "bridge"
  | "row"
  | "burpee"
  | "sideplank";

export type ExercisePosition =
  | "standing"
  | "floor"
  | "plank"
  | "chair"
  | "table";

export type ExerciseEquipment = "bodyweight" | "mat" | "chair" | "table";

export type ExerciseIntensity = "low" | "medium" | "high";

export type PhaseIndex = 0 | 1 | 2;

export type ExerciseTemplate = {
  id: string;
  name: string;
  details: string;
  focus: string;
  motion: MotionType;
  position: ExercisePosition;
  equipment: ExerciseEquipment;
  intensity: ExerciseIntensity;
  coaching: [string, string, string];
  workSeconds: [number, number, number];
  baseRestSeconds: [number, number, number];
};

export type ExerciseBlueprint = {
  key: keyof typeof EXERCISES;
  workOffset?: number;
  restOffset?: number;
};

export type BlockBlueprint = {
  title: string;
  note: string;
  rounds: [number, number, number];
  exercises: ExerciseBlueprint[];
};

export type WorkoutStep = {
  stepId: string;
  exerciseId: string;
  name: string;
  details: string;
  focus: string;
  motion: MotionType;
  position: ExercisePosition;
  equipment: ExerciseEquipment;
  intensity: ExerciseIntensity;
  coaching: [string, string, string];
  workSeconds: number;
  restSeconds: number;
  blockTitle: string;
  blockNote: string;
  round: number;
};

export type WorkoutBlockSummary = {
  title: string;
  note: string;
  rounds: number;
  exerciseNames: string[];
};

export type BuiltWorkout = {
  key: string;
  week: number;
  displayWeek: string;
  phaseIndex: PhaseIndex;
  phaseLabel: string;
  phaseGoal: string;
  dayIndex: number;
  dayLabel: string;
  title: string;
  subtitle: string;
  emphasis: string;
  heroMotion: MotionType;
  overview: string;
  summaryPoints: string[];
  blocks: WorkoutBlockSummary[];
  timeline: WorkoutStep[];
  estimatedMinutes: number;
};

const EXERCISES = {
  marchReach: {
    id: "march-reach",
    name: "Marsz z wysokim unoszeniem kolan",
    details: "Rozgrzej biodra i barki, unosząc naprzemiennie kolano oraz przeciwległą rękę.",
    focus: "Mobilizacja całego ciała",
    motion: "mobility",
    position: "standing",
    equipment: "bodyweight",
    intensity: "low",
    coaching: [
      "Napinaj brzuch przy każdym uniesieniu kolana.",
      "Ramiona prowadź wysoko, bez garbienia barków.",
      "Oddychaj miarowo przez cały czas.",
    ],
    workSeconds: [40, 45, 45],
    baseRestSeconds: [15, 15, 15],
  },
  armSweepSquat: {
    id: "arm-sweep-squat",
    name: "Półprzysiad z szerokim otwarciem ramion",
    details: "Delikatny półprzysiad połącz z otwarciem klatki piersiowej i aktywacją łopatek.",
    focus: "Rozgrzanie nóg i barków",
    motion: "squat",
    position: "standing",
    equipment: "bodyweight",
    intensity: "low",
    coaching: [
      "Schodź tylko tak nisko, jak utrzymasz prosty tułów.",
      "Rozszerz ramiona szeroko, jakbyś chciał otworzyć klatkę.",
      "Stopy trzymaj stabilnie na całej powierzchni.",
    ],
    workSeconds: [40, 45, 45],
    baseRestSeconds: [15, 15, 15],
  },
  walkoutPlank: {
    id: "walkout-plank",
    name: "Przejście rękami do deski",
    details: "Z pozycji stojącej zejdź rękami do podporu i wróć do stania bez pośpiechu.",
    focus: "Aktywacja korpusu i barków",
    motion: "plank",
    position: "plank",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Nie zapadaj lędźwi w podporze.",
      "Uginaj kolana tylko tyle, ile potrzebujesz.",
      "Wróć do stania, wypychając podłogę stopami.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  thoracicReach: {
    id: "thoracic-reach",
    name: "Rotacja klatki w podporze",
    details: "Z pozycji klęku podpartego otwieraj górną rękę i skręcaj klatkę piersiową.",
    focus: "Mobilizacja odcinka piersiowego",
    motion: "mobility",
    position: "floor",
    equipment: "mat",
    intensity: "low",
    coaching: [
      "Biodra utrzymuj spokojnie, bez kołysania.",
      "Ruch prowadź z klatki, nie z samej dłoni.",
      "Zatrzymaj otwarcie na ułamek sekundy.",
    ],
    workSeconds: [35, 35, 40],
    baseRestSeconds: [15, 15, 15],
  },
  tempoPushup: {
    id: "tempo-pushup",
    name: "Pompki z wolnym zejściem",
    details: "Schodź przez około 3 sekundy, wracaj dynamicznie, utrzymując napięty brzuch.",
    focus: "Klatka piersiowa i tricepsy",
    motion: "pushup",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Łokcie kieruj pod kątem około 45 stopni do tułowia.",
      "Utrzymuj linię od barków do pięt.",
      "Wydech rób w górze, gdy wypychasz podłogę.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [35, 35, 30],
  },
  inclinePushup: {
    id: "incline-pushup",
    name: "Pompki przy stole",
    details: "Oprzyj dłonie o stabilny stół, by utrzymać wyższą jakość ruchu i większą objętość.",
    focus: "Klatka piersiowa i tricepsy",
    motion: "pushup",
    position: "table",
    equipment: "table",
    intensity: "medium",
    coaching: [
      "Stół musi być całkowicie stabilny.",
      "Napnij pośladki i brzuch, by nie wyginać pleców.",
      "Staraj się dotknąć klatką krawędzi stołu bez załamania sylwetki.",
    ],
    workSeconds: [40, 45, 50],
    baseRestSeconds: [30, 30, 25],
  },
  closeGripPushup: {
    id: "close-grip-pushup",
    name: "Wąskie pompki",
    details: "Dłonie ustaw nieco węziej niż barki, aby mocniej zaangażować tricepsy.",
    focus: "Tricepsy i środek klatki",
    motion: "pushup",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Łokcie prowadź blisko żeber.",
      "Nie skracaj zakresu tylko dlatego, że wariant jest trudniejszy.",
      "Jeśli trzeba, zwolnij tempo zamiast tracić technikę.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [35, 35, 30],
  },
  widePushup: {
    id: "wide-pushup",
    name: "Szerokie pompki",
    details: "Szerzej ustawione dłonie zwiększają akcent na klatkę piersiową.",
    focus: "Klatka piersiowa",
    motion: "pushup",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Nie unoś barków do uszu.",
      "Schodź kontrolowanie do poziomu, który utrzymasz bez bólu barków.",
      "Wypychaj podłogę całą dłonią.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [35, 35, 30],
  },
  pikeShoulderTap: {
    id: "pike-shoulder-tap",
    name: "Pike z dotknięciem barku",
    details: "Ustaw biodra wysoko, naprzemiennie odrywaj dłoń i dotykaj przeciwnego barku.",
    focus: "Barki i stabilizacja",
    motion: "pike",
    position: "plank",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Biodra trzymaj wysoko przez cały czas.",
      "Ruch ma być krótki i spokojny, bez kołysania.",
      "Napnij brzuch zanim oderwiesz dłoń.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [25, 25, 20],
  },
  forearmPlankReach: {
    id: "forearm-plank-reach",
    name: "Deska z sięgnięciem do przodu",
    details: "Z podporu na przedramionach wyciągaj jedną rękę do przodu, nie skręcając bioder.",
    focus: "Brzuch i głęboka stabilizacja",
    motion: "plank",
    position: "plank",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Miednicę trzymaj nieruchomo.",
      "Wyciągaj rękę nisko, bez unoszenia barku.",
      "Utrzymuj żebra schowane i brzuch napięty.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [25, 25, 20],
  },
  chairDip: {
    id: "chair-dip",
    name: "Dipy na krześle",
    details: "Oprzyj dłonie o stabilne krzesło i opuszczaj ciało pionowo, pracując tricepsem.",
    focus: "Tricepsy i przedni bark",
    motion: "dip",
    position: "chair",
    equipment: "chair",
    intensity: "high",
    coaching: [
      "Krzesło nie może się przesuwać.",
      "Schodź tylko do zakresu bez dyskomfortu barków.",
      "W górze aktywnie prostuj łokcie.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [35, 35, 30],
  },
  deadBugPress: {
    id: "dead-bug-press",
    name: "Dead bug z mocnym dociskiem",
    details: "Leżąc na plecach, naprzemiennie prostuj nogę i rękę, nie odrywając lędźwi od podłogi.",
    focus: "Głęboki brzuch",
    motion: "core",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Dociskaj odcinek lędźwiowy do maty.",
      "Rękę i nogę wydłużaj, a nie wyrzucaj.",
      "Pracuj wolno i precyzyjnie.",
    ],
    workSeconds: [40, 45, 50],
    baseRestSeconds: [20, 20, 20],
  },
  mountainClimber: {
    id: "mountain-climber",
    name: "Mountain climbers",
    details: "Dynamicznie przyciągaj kolana do klatki z pozycji podporu, utrzymując barki nad dłońmi.",
    focus: "Spalanie i brzuch",
    motion: "climber",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Nie unoś bioder zbyt wysoko.",
      "Kolana prowadź aktywnie pod brzuch.",
      "Utrzymuj równy rytm, nie szarp tempa.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [30, 25, 20],
  },
  hollowHold: {
    id: "hollow-hold",
    name: "Hollow hold",
    details: "Leżąc na plecach, lekko unieś barki i nogi, utrzymując długi brzuch.",
    focus: "Przód brzucha",
    motion: "core",
    position: "floor",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Dociskaj lędźwie do podłogi.",
      "Nie unoś nóg wyżej, jeśli tracisz napięcie.",
      "Wyciągaj ręce daleko za głowę albo wzdłuż tułowia według możliwości.",
    ],
    workSeconds: [25, 30, 35],
    baseRestSeconds: [30, 25, 20],
  },
  squatThrust: {
    id: "squat-thrust",
    name: "Squat thrust",
    details: "Wejdź do podporu i wróć do stania bez wyskoku, utrzymując dobrą kontrolę tułowia.",
    focus: "Kondycja i spalanie",
    motion: "burpee",
    position: "standing",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Miękko odkładaj stopy do podporu.",
      "Wstawaj aktywnie z pięt i pośladków.",
      "Nie śpiesz się kosztem techniki przy zejściu.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [35, 30, 25],
  },
  bicycleCrunch: {
    id: "bicycle-crunch",
    name: "Rowerki",
    details: "Prowadź łokieć do przeciwnego kolana, pilnując skrętu z klatki, nie z szyi.",
    focus: "Skośne mięśnie brzucha",
    motion: "core",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Nie ciągnij głowy rękami.",
      "Wydłużaj prostowaną nogę.",
      "Zatrzymuj skręt na ułamek sekundy.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  fastFeet: {
    id: "fast-feet",
    name: "Szybkie stopy",
    details: "Krótki, dynamiczny bieg w miejscu na śródstopiu dla podniesienia tętna.",
    focus: "Kondycja",
    motion: "mobility",
    position: "standing",
    equipment: "bodyweight",
    intensity: "high",
    coaching: [
      "Pozostań lekki na stopach.",
      "Lekko pochyl tułów do przodu.",
      "Oddychaj rytmicznie, nie wstrzymuj powietrza.",
    ],
    workSeconds: [25, 30, 35],
    baseRestSeconds: [20, 20, 20],
  },
  reverseLungeDrive: {
    id: "reverse-lunge-drive",
    name: "Zakrok z wejściem kolana",
    details: "Zrób kontrolowany zakrok, a wracając unieś kolano do przodu dla pracy nóg i brzucha.",
    focus: "Pośladki i równowaga",
    motion: "squat",
    position: "standing",
    equipment: "bodyweight",
    intensity: "medium",
    coaching: [
      "Kolano wykrocznej nogi prowadź nad środkiem stopy.",
      "Tułów trzymaj wysoki.",
      "Na górze dopnij pośladek nogi podporowej.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [25, 25, 20],
  },
  splitSquat: {
    id: "split-squat",
    name: "Split squat",
    details: "Stań w wykroku i wykonuj pionowe zejścia, utrzymując napięty korpus.",
    focus: "Uda i pośladki",
    motion: "squat",
    position: "standing",
    equipment: "bodyweight",
    intensity: "high",
    coaching: [
      "Tylna pięta może być oderwana, ale miednica pozostaje stabilna.",
      "Nie wypychaj kolana do środka.",
      "Schodź pionowo, nie uciekaj tułowiem do przodu.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [35, 35, 30],
  },
  singleLegBridge: {
    id: "single-leg-bridge",
    name: "Most biodrowy na jednej nodze",
    details: "Leżąc na plecach unieś biodra, opierając ciężar głównie na jednej nodze.",
    focus: "Pośladki i tylna taśma",
    motion: "bridge",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Wypychaj biodra wysoko, nie lędźwie.",
      "Piętę dociśnij do podłoża.",
      "Biodra utrzymuj równo po obu stronach.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [25, 25, 20],
  },
  tableRow: {
    id: "table-row",
    name: "Wiosłowanie pod stołem",
    details: "Chwyć stabilny blat od spodu i podciągaj klatkę w kierunku krawędzi stołu.",
    focus: "Plecy i tylne barki",
    motion: "row",
    position: "table",
    equipment: "table",
    intensity: "high",
    coaching: [
      "Wykonuj tylko przy całkowicie stabilnym stole.",
      "Prowadź łokcie w dół i do tyłu.",
      "Nie zadzieraj brody do blatu.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [35, 35, 30],
  },
  sidePlankHipLift: {
    id: "side-plank-hip-lift",
    name: "Deska bokiem z unoszeniem bioder",
    details: "W podporze bokiem opuść lekko biodro i wróć do linii prostej.",
    focus: "Skośne mięśnie brzucha",
    motion: "sideplank",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Ramię podporowe ustaw dokładnie pod barkiem.",
      "Nie skręcaj klatki do podłogi.",
      "Napinaj pośladki przez cały czas.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [25, 25, 20],
  },
  squatPulse: {
    id: "squat-pulse",
    name: "Pulsujące przysiady",
    details: "Zatrzymaj się w połowie przysiadu i wykonuj krótkie ruchy góra-dół.",
    focus: "Nogi i wytrzymałość",
    motion: "squat",
    position: "standing",
    equipment: "bodyweight",
    intensity: "high",
    coaching: [
      "Kolana prowadź w linii z palcami.",
      "Nie odrywaj pięt od podłogi.",
      "Tułów trzymaj długi, bez zaokrągleń.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [30, 30, 25],
  },
  bearPlankTap: {
    id: "bear-plank-tap",
    name: "Bear plank z tapnięciem barku",
    details: "Kolana utrzymuj tuż nad podłogą i naprzemiennie dotykaj barków.",
    focus: "Brzuch i barki",
    motion: "plank",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Kolana trzymaj nisko, ale nie opieraj ich.",
      "Biodra nie powinny kołysać się na boki.",
      "Wciskaj mocno dłonie w podłogę.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [30, 25, 20],
  },
  plankUpDown: {
    id: "plank-up-down",
    name: "Przejście z deski niskiej do wysokiej",
    details: "Zmieniaj podporę z przedramion na dłonie, pilnując stabilnego tułowia i bioder.",
    focus: "Barki, tricepsy i brzuch",
    motion: "plank",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Nie kołysz biodrami przy zmianie podpory.",
      "Wciskaj mocno całą dłoń w podłogę.",
      "Utrzymuj szyję w przedłużeniu kręgosłupa.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [30, 25, 20],
  },
  reverseCrunch: {
    id: "reverse-crunch",
    name: "Reverse crunch",
    details: "Przyciągnij kolana do klatki i lekko zawiń miednicę, pracując dolnym brzuchem.",
    focus: "Dolny brzuch",
    motion: "core",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Ruch zaczyna się od miednicy, nie od wymachu nóg.",
      "Nie odrywaj głowy od podłogi.",
      "Wracaj wolniej niż podnosisz nogi.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  lateralLungeReach: {
    id: "lateral-lunge-reach",
    name: "Wykrok boczny z sięgnięciem",
    details: "Przenoś ciężar w bok do głębszej pracy pośladka i przywodzicieli, sięgając rękami przed siebie.",
    focus: "Nogi, pośladki i mobilność bioder",
    motion: "squat",
    position: "standing",
    equipment: "bodyweight",
    intensity: "medium",
    coaching: [
      "Biodra prowadź do tyłu, nie tylko w dół.",
      "Noga wyprostowana pozostaje aktywna.",
      "Odbijaj się mocno z całej stopy nogi pracującej.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  skaterStep: {
    id: "skater-step",
    name: "Skater step",
    details: "Przenoś ciężar z nogi na nogę w szerokim kroku bocznym, z lekkim pochyleniem tułowia.",
    focus: "Kondycja i pośladki",
    motion: "mobility",
    position: "standing",
    equipment: "bodyweight",
    intensity: "medium",
    coaching: [
      "Ląduj miękko i stabilnie.",
      "Pracuj rękami, by utrzymać rytm.",
      "Nie zapadaj kolana do środka.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  gluteBridgeMarch: {
    id: "glute-bridge-march",
    name: "Most biodrowy z marszem",
    details: "Utrzymuj biodra wysoko i naprzemiennie odrywaj stopę, nie tracąc napięcia pośladków.",
    focus: "Pośladki, tył uda i stabilizacja miednicy",
    motion: "bridge",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Biodra trzymaj równo, bez przechylania na boki.",
      "Unosząc stopę, dociśnij mocniej nogę podporową.",
      "Ruch ma być spokojny i kontrolowany.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  burpeeStepBack: {
    id: "burpee-step-back",
    name: "Burpee krok po kroku",
    details: "Zejdź do podporu krokiem, wróć do stania i unieś ręce nad głowę bez skoku.",
    focus: "Spalanie całego ciała",
    motion: "burpee",
    position: "standing",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Schodź do podporu kontrolowanym tempem.",
      "Na górze wyprostuj ciało i nabierz powietrza.",
      "Trzymaj barki aktywne w podporze.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [35, 30, 25],
  },
  gluteBridgeHold: {
    id: "glute-bridge-hold",
    name: "Most biodrowy z zatrzymaniem",
    details: "W górze zatrzymuj napięcie pośladków przez krótką chwilę przy każdym powtórzeniu.",
    focus: "Pośladki",
    motion: "bridge",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Żebra utrzymuj schowane, żeby nie przeprostować pleców.",
      "Pięty trzymaj blisko pośladków.",
      "Ruch kończ dopięciem pośladków, nie lędźwi.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  stepJack: {
    id: "step-jack",
    name: "Step jack",
    details: "Wersja pajacyka bez skoku, z dynamiczną pracą rąk i nóg.",
    focus: "Podniesienie tętna",
    motion: "mobility",
    position: "standing",
    equipment: "bodyweight",
    intensity: "medium",
    coaching: [
      "Poruszaj rękami szeroko i wysoko.",
      "Stopy odstawiaj energicznie, ale miękko.",
      "Utrzymuj napięty środek ciała.",
    ],
    workSeconds: [40, 45, 45],
    baseRestSeconds: [15, 15, 15],
  },
  highKneesMarch: {
    id: "high-knees-march",
    name: "Szybki marsz kolanami w górę",
    details: "Wysokie unoszenie kolan w szybkim rytmie bez biegania.",
    focus: "Rozgrzanie bioder i tętna",
    motion: "mobility",
    position: "standing",
    equipment: "bodyweight",
    intensity: "medium",
    coaching: [
      "Nie odchylaj tułowia do tyłu.",
      "Unosząc kolano, dopnij brzuch.",
      "Zachowaj sprężysty rytm.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [15, 15, 15],
  },
  pikePushupHold: {
    id: "pike-pushup-hold",
    name: "Pike push-up z zatrzymaniem",
    details: "Z pozycji pike uginaj ręce i zatrzymuj dolną pozycję na krótki moment.",
    focus: "Barki i górna klatka",
    motion: "pike",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Głowę prowadź między dłońmi, nie przed nie.",
      "Biodra trzymaj wysoko.",
      "Wypychaj podłogę mocno przy powrocie.",
    ],
    workSeconds: [25, 30, 35],
    baseRestSeconds: [35, 30, 25],
  },
  sidePlankReach: {
    id: "side-plank-reach",
    name: "Deska bokiem z sięgnięciem pod tułów",
    details: "W podporze bokiem sięgaj wolną ręką pod klatkę i wracaj do otwarcia.",
    focus: "Skośne mięśnie brzucha i bark",
    motion: "sideplank",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Biodra utrzymuj wysoko.",
      "Ruch skrętny prowadź z klatki, nie z samej ręki.",
      "Noga podporowa pozostaje aktywna i mocna.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [25, 25, 20],
  },
  crossClimber: {
    id: "cross-climber",
    name: "Mountain climber do przeciwnego łokcia",
    details: "Przyciągaj kolano po skosie, aby mocniej obciążyć skośne mięśnie brzucha.",
    focus: "Brzuch i spalanie",
    motion: "climber",
    position: "plank",
    equipment: "mat",
    intensity: "high",
    coaching: [
      "Nie skracaj ruchu biodrem.",
      "Barki utrzymuj nad dłońmi.",
      "Prowadź kolano po skosie, nie tylko do przodu.",
    ],
    workSeconds: [30, 35, 40],
    baseRestSeconds: [30, 25, 20],
  },
  squatToKneeDrive: {
    id: "squat-to-knee-drive",
    name: "Przysiad z wejściem kolana",
    details: "Po każdym wyjściu z przysiadu dołóż dynamiczne uniesienie kolana.",
    focus: "Nogi i tętno",
    motion: "squat",
    position: "standing",
    equipment: "bodyweight",
    intensity: "medium",
    coaching: [
      "W przysiadzie prowadź biodra do tyłu.",
      "Kolano unoś z napiętym brzuchem.",
      "Utrzymuj spokojny oddech mimo tempa.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [25, 25, 20],
  },
  seatedKneeTuck: {
    id: "seated-knee-tuck",
    name: "Przyciąganie kolan w siadzie",
    details: "Oprzyj się za sobą i przyciągaj kolana do klatki, wydłużając nogi przy powrocie.",
    focus: "Dolny brzuch i zginacze bioder",
    motion: "core",
    position: "floor",
    equipment: "mat",
    intensity: "medium",
    coaching: [
      "Klatkę trzymaj otwartą, nie zapadaj barków.",
      "Przyciągaj kolana aktywnie do środka.",
      "Nie rzucaj nogami przy prostowaniu.",
    ],
    workSeconds: [35, 40, 45],
    baseRestSeconds: [20, 20, 20],
  },
  cobraReach: {
    id: "cobra-reach",
    name: "Otwarcie klatki w leżeniu",
    details: "Delikatne wyprosty i sięgnięcia wydłużające przód tułowia po intensywnej pracy.",
    focus: "Rozluźnienie klatki i brzucha",
    motion: "mobility",
    position: "floor",
    equipment: "mat",
    intensity: "low",
    coaching: [
      "Nie wchodź w ból lędźwi.",
      "Wyciągaj mostek do przodu.",
      "Oddychaj spokojnie i głęboko.",
    ],
    workSeconds: [35, 40, 40],
    baseRestSeconds: [15, 15, 15],
  },
  childPoseShift: {
    id: "child-pose-shift",
    name: "Pozycja dziecka z przesunięciem bocznym",
    details: "Usiądź na piętach i przesuwaj dłonie na boki, rozciągając grzbiet i barki.",
    focus: "Wyhamowanie i oddech",
    motion: "mobility",
    position: "floor",
    equipment: "mat",
    intensity: "low",
    coaching: [
      "Pozwól barkom opaść nisko.",
      "Wydłużaj boki tułowia na zmianę.",
      "Wydłuż wydech, żeby szybciej obniżyć tętno.",
    ],
    workSeconds: [35, 40, 40],
    baseRestSeconds: [15, 15, 15],
  },
  chestOpenerWall: {
    id: "chest-opener-wall",
    name: "Otwarcie klatki przy ścianie",
    details: "Ustaw przedramię przy ścianie lub framudze i delikatnie rotuj tułów.",
    focus: "Rozciągnięcie klatki i barków",
    motion: "mobility",
    position: "standing",
    equipment: "bodyweight",
    intensity: "low",
    coaching: [
      "Nie wciskaj barku na siłę.",
      "Rotację prowadź łagodnie.",
      "Oddychaj spokojnie przez nos.",
    ],
    workSeconds: [35, 40, 40],
    baseRestSeconds: [15, 15, 15],
  },
} satisfies Record<string, ExerciseTemplate>;

const phaseMeta = [
  {
    label: "Faza 1: baza",
    goal: "Technika, objętość bazowa i przygotowanie stawów do większej gęstości pracy.",
  },
  {
    label: "Faza 2: rozbudowa",
    goal: "Większa objętość i mocniejszy nacisk na klatkę, ramiona oraz brzuch.",
  },
  {
    label: "Faza 3: definicja",
    goal: "Wyższa gęstość, krótsze przerwy i mocniejszy akcent na spalanie tłuszczu.",
  },
] as const;

function getPhaseIndex(week: number): PhaseIndex {
  if (week <= 4) {
    return 0;
  }

  if (week <= 8) {
    return 1;
  }

  return 2;
}

function buildExercise(
  blueprint: ExerciseBlueprint,
  phaseIndex: PhaseIndex,
) {
  const exercise = EXERCISES[blueprint.key];

  return {
    ...exercise,
    workSeconds: exercise.workSeconds[phaseIndex] + (blueprint.workOffset ?? 0),
    baseRestSeconds:
      exercise.baseRestSeconds[phaseIndex] + (blueprint.restOffset ?? 0),
  };
}

function getTransitionRest(
  current: ReturnType<typeof buildExercise>,
  next: ReturnType<typeof buildExercise> | undefined,
) {
  if (!next) {
    return 0;
  }

  let rest = current.baseRestSeconds;

  const currentGround = current.position === "plank" ? "floor" : current.position;
  const nextGround = next.position === "plank" ? "floor" : next.position;

  if (currentGround !== nextGround) {
    rest += 5;
  }

  if (
    (currentGround === "floor" && nextGround === "standing") ||
    (currentGround === "standing" && nextGround === "floor")
  ) {
    rest += 4;
  }

  if (current.equipment !== next.equipment) {
    rest += 4;
  }

  if (current.intensity === "high") {
    rest += 2;
  }

  return Math.min(rest, 60);
}

function createWorkout(
  week: number,
  dayIndex: number,
  dayLabel: string,
  title: string,
  subtitle: string,
  emphasis: string,
  heroMotion: MotionType,
  overview: string,
  summaryPoints: string[],
  blocks: BlockBlueprint[],
) {
  const phaseIndex = getPhaseIndex(week);
  const timeline: WorkoutStep[] = [];
  const blockSummaries: WorkoutBlockSummary[] = [];

  for (const block of blocks) {
    const rounds = block.rounds[phaseIndex];
    const builtExercises = block.exercises.map((item) => buildExercise(item, phaseIndex));

    blockSummaries.push({
      title: block.title,
      note: block.note,
      rounds,
      exerciseNames: builtExercises.map((exercise) => exercise.name),
    });

    for (let round = 1; round <= rounds; round += 1) {
      for (let index = 0; index < builtExercises.length; index += 1) {
        const current = builtExercises[index];
        const next = builtExercises[index + 1] ?? undefined;

        timeline.push({
          stepId: `${week}-${dayIndex}-${block.title}-${round}-${current.id}`,
          exerciseId: current.id,
          name: current.name,
          details: current.details,
          focus: current.focus,
          motion: current.motion,
          position: current.position,
          equipment: current.equipment,
          intensity: current.intensity,
          coaching: current.coaching,
          workSeconds: current.workSeconds,
          restSeconds: getTransitionRest(current, next),
          blockTitle: block.title,
          blockNote: block.note,
          round,
        });
      }
    }
  }

  const totalSeconds = timeline.reduce(
    (sum, step) => sum + step.workSeconds + step.restSeconds,
    0,
  );

  return {
    key: `week-${Math.min(week, 12)}-day-${dayIndex + 1}`,
    week,
    displayWeek: week <= 12 ? `Tydzień ${week}` : "Tydzień 12+",
    phaseIndex,
    phaseLabel: phaseMeta[phaseIndex].label,
    phaseGoal: phaseMeta[phaseIndex].goal,
    dayIndex,
    dayLabel,
    title,
    subtitle,
    emphasis,
    heroMotion,
    overview,
    summaryPoints,
    blocks: blockSummaries,
    timeline,
    estimatedMinutes: Math.round(totalSeconds / 60),
  } satisfies BuiltWorkout;
}

function buildDayA(week: number) {
  const rotateVariant = week % 2 === 0;

  return createWorkout(
    week,
    0,
    "Dzień A",
    "Klatka, barki i brzuch",
    "Najmocniejszy dzień pchania z dużą objętością dla klatki oraz tricepsów.",
    "Wysoka objętość klatki i ramion z mocnym środkiem ciała",
    "pushup",
    "Dzisiaj priorytetem są pompki i warianty barkowe. Przerwy wydłużą się automatycznie tam, gdzie zmieniasz pozycję z podporu na krzesło lub stół.",
    [
      "Cel sylwetkowy: klatka, tricepsy i widoczniejszy brzuch.",
      "Tempo pracy rośnie co 4 tygodnie, ale jakość ruchu pozostaje ważniejsza niż liczba powtórzeń.",
      "Jeżeli technika zacznie siadać, zwolnij ruch zamiast skracać zakres.",
    ],
    [
      {
        title: "Rozgrzewka",
        note: "Otwórz barki i przygotuj korpus do podporów.",
        rounds: [1, 1, 1],
        exercises: [
          { key: "marchReach" },
          { key: "armSweepSquat" },
          { key: "walkoutPlank" },
          { key: "thoracicReach" },
        ],
      },
      {
        title: "Blok siłowy",
        note: "Najważniejsza część sesji, skup się na jakości pompek.",
        rounds: [4, 4, 4],
        exercises: [
          { key: week <= 4 ? "inclinePushup" : "tempoPushup", workOffset: 5 },
          { key: week <= 8 ? "pikeShoulderTap" : "pikePushupHold" },
          { key: "tableRow", restOffset: 4 },
          { key: rotateVariant ? "plankUpDown" : "forearmPlankReach" },
        ],
      },
      {
        title: "Blok akcesoryjny",
        note: "Domknij pracę ramion i brzucha bez utraty tempa.",
        rounds: [3, 4, 4],
        exercises: [
          { key: "chairDip" },
          { key: "deadBugPress" },
          { key: week <= 4 ? "mountainClimber" : "crossClimber" },
          { key: "hollowHold" },
        ],
      },
      {
        title: "Blok gęstości",
        note: "Krótsze przerwy, więcej ciągłej pracy i rotacja bodźców dla brzucha oraz barków.",
        rounds: [2, 2, 3],
        exercises: [
          { key: rotateVariant ? "forearmPlankReach" : "plankUpDown" },
          { key: "reverseCrunch" },
          { key: "squatToKneeDrive" },
          { key: "fastFeet" },
        ],
      },
      {
        title: "Finisher",
        note: "Krótki finisz pod spalanie tłuszczu i utrwalenie napięcia korpusu.",
        rounds: [2, 3, 3],
        exercises: [
          { key: "squatThrust" },
          { key: "bicycleCrunch" },
          { key: "fastFeet" },
        ],
      },
      {
        title: "Schłodzenie",
        note: "Spokojnie obniż tętno i rozluźnij przód ciała.",
        rounds: [1, 1, 1],
        exercises: [
          { key: "cobraReach" },
          { key: "childPoseShift" },
          { key: "chestOpenerWall" },
        ],
      },
    ],
  );
}

function buildDayB(week: number) {
  const rotateVariant = week % 2 === 0;

  return createWorkout(
    week,
    1,
    "Dzień B",
    "Nogi, plecy i spalanie",
    "Dzień równoważący sylwetkę: nogi i plecy pracują mocno, a tętno pozostaje wysoko.",
    "Silne nogi i plecy dla lepszego wyglądu całej sylwetki oraz większego wydatku energetycznego",
    "squat",
    "Ten dzień pomaga spalać tłuszcz bez przeciążania klatki. Plecy pod stołem poprawią proporcje sylwetki i jakość postawy.",
    [
      "Cel sylwetkowy: wysmuklenie tułowia przez lepszą postawę i wyższy wydatek energetyczny.",
      "Nogi pracują na czas, więc pilnuj rytmu i oddechu.",
      "Jeżeli stół choć trochę się rusza, pomiń wiosłowanie i wydłuż side plank o 10 sekund.",
    ],
    [
      {
        title: "Rozgrzewka",
        note: "Rozruszaj biodra, kolana i oddech.",
        rounds: [1, 1, 1],
        exercises: [
          { key: "stepJack" },
          { key: "highKneesMarch" },
          { key: "reverseLungeDrive" },
          { key: "gluteBridgeHold" },
        ],
      },
      {
        title: "Blok nogi i plecy",
        note: "Najpierw wzorce siłowe, potem stabilizacja.",
        rounds: [4, 4, 4],
        exercises: [
          { key: "splitSquat" },
          { key: "singleLegBridge" },
          { key: "tableRow", restOffset: 4 },
          { key: "sidePlankHipLift" },
          { key: rotateVariant ? "lateralLungeReach" : "squatToKneeDrive" },
        ],
      },
      {
        title: "Blok kondycyjny",
        note: "Gęsta praca na uda, barki i brzuch.",
        rounds: [3, 3, 4],
        exercises: [
          { key: "squatPulse" },
          { key: "bearPlankTap" },
          { key: "reverseCrunch" },
          { key: "skaterStep" },
        ],
      },
      {
        title: "Blok stabilizacji",
        note: "Dodatkowa objętość na pośladki i korpus bez rozwlekania sesji.",
        rounds: [2, 2, 2],
        exercises: [
          { key: rotateVariant ? "gluteBridgeMarch" : "gluteBridgeHold" },
          { key: "lateralLungeReach" },
          { key: "sidePlankHipLift" },
          { key: "fastFeet" },
        ],
      },
      {
        title: "Finisher",
        note: "Kontrolowany wysiłek całego ciała bez skoków wymagających dużo miejsca.",
        rounds: [2, 2, 3],
        exercises: [
          { key: "burpeeStepBack" },
          { key: "mountainClimber" },
          { key: "fastFeet" },
        ],
      },
      {
        title: "Schłodzenie",
        note: "Rozluźnij biodra, klatkę i barki.",
        rounds: [1, 1, 1],
        exercises: [
          { key: "childPoseShift" },
          { key: "cobraReach" },
          { key: "chestOpenerWall" },
        ],
      },
    ],
  );
}

function buildDayC(week: number) {
  const rotateVariant = week % 2 === 0;

  return createWorkout(
    week,
    2,
    "Dzień C",
    "Góra ciała i definicja",
    "Trzeci trening tygodnia dokłada dodatkowy akcent na ramiona, klatkę i brzuch przy wyższej gęstości pracy.",
    "Duża gęstość pracy dla górnej części ciała i brzucha",
    "dip",
    "Sesja kończąca tydzień łączy warianty pompek, stabilizację boczną oraz dynamiczny finisz, żeby utrzymać progres bez monotonii.",
    [
      "Cel sylwetkowy: lepsza definicja ramion i klatki przy zachowaniu niskiej monotonii.",
      "To najbardziej gęsta sesja tygodnia, więc oddech ma prowadzić tempo.",
      "Jeżeli czujesz zmęczenie barków po Dniu A, wydłuż własną przerwę o 10 sekund przed dipami.",
    ],
    [
      {
        title: "Rozgrzewka",
        note: "Przygotuj barki i biodra do szybkich zmian pozycji.",
        rounds: [1, 1, 1],
        exercises: [
          { key: "marchReach" },
          { key: "stepJack" },
          { key: "walkoutPlank" },
          { key: "thoracicReach" },
        ],
      },
      {
        title: "Blok górnej części ciała",
        note: "Pracuj blisko upadku technicznego, ale bez tracenia ustawienia tułowia.",
        rounds: [4, 4, 4],
        exercises: [
          { key: "closeGripPushup" },
          { key: "widePushup" },
          { key: "tableRow", restOffset: 4 },
          { key: "sidePlankReach" },
          { key: rotateVariant ? "plankUpDown" : "forearmPlankReach" },
        ],
      },
      {
        title: "Blok brzuch i ramiona",
        note: "Dużo napięcia lokalnego i krótsze przejścia między ćwiczeniami.",
        rounds: [3, 3, 4],
        exercises: [
          { key: "chairDip" },
          { key: "crossClimber" },
          { key: "seatedKneeTuck" },
          { key: "squatToKneeDrive" },
        ],
      },
      {
        title: "Blok gęstości",
        note: "Dodatkowy obwód na definicję: barki, brzuch i tempo pracy bez długich przestojów.",
        rounds: [2, 2, 2],
        exercises: [
          { key: rotateVariant ? "deadBugPress" : "reverseCrunch" },
          { key: "plankUpDown" },
          { key: "stepJack" },
          { key: "bicycleCrunch" },
        ],
      },
      {
        title: "Finisher",
        note: "Krótki finisz metaboliczny przed wyhamowaniem.",
        rounds: [2, 2, 3],
        exercises: [
          { key: "squatThrust" },
          { key: "bearPlankTap" },
          { key: "bicycleCrunch" },
        ],
      },
      {
        title: "Schłodzenie",
        note: "Przywróć spokojny oddech i długość w przedniej taśmie.",
        rounds: [1, 1, 1],
        exercises: [
          { key: "cobraReach" },
          { key: "childPoseShift" },
          { key: "chestOpenerWall" },
        ],
      },
    ],
  );
}

export function buildWorkoutForProgress(completedSessions: number) {
  const week = Math.min(Math.floor(completedSessions / 3) + 1, 12);
  const dayIndex = completedSessions % 3;

  if (dayIndex === 0) {
    return buildDayA(week);
  }

  if (dayIndex === 1) {
    return buildDayB(week);
  }

  return buildDayC(week);
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatShortDate(dateIso: string | null) {
  if (!dateIso) {
    return "Jeszcze brak ukończonej sesji";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
  }).format(new Date(dateIso));
}

export function getProgramPhaseSummary() {
  return [
    "Tygodnie 1-4: budowanie bazy, techniki i tolerancji na objętość.",
    "Tygodnie 5-8: większa gęstość dla klatki, ramion i brzucha.",
    "Tygodnie 9-12: najmocniejszy akcent na definicję i spalanie tłuszczu.",
  ];
}