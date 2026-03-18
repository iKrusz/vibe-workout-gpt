"use client";

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import {
  buildWorkoutForProgress,
  formatDuration,
  formatShortDate,
  type BuiltWorkout,
  type MotionType,
} from "@/app/workout-plan";

type ActiveRun = {
  workout: BuiltWorkout;
  stepIndex: number;
  phase: "work" | "rest";
  secondsLeft: number;
  stepDuration: number;
  paused: boolean;
  startedAt: string;
};

type PersistedState = {
  completedSessions: number;
  completedWorkoutKeys: string[];
  lastCompletedAt: string | null;
  activeRun: ActiveRun | null;
};

type ScreenState = "welcome" | "plan" | "session";

type AnimatedMotionProps = {
  motion: MotionType;
  phase: "work" | "rest";
  exerciseId?: string;
};

const STORAGE_KEY = "vibe-workout-progress-v1";

const defaultState: PersistedState = {
  completedSessions: 0,
  completedWorkoutKeys: [],
  lastCompletedAt: null,
  activeRun: null,
};

const motionTitles: Record<MotionType, string> = {
  mobility: "Ruch przygotowawczy",
  pushup: "Wzorzec pompki",
  pike: "Praca barków",
  plank: "Stabilizacja podporu",
  dip: "Akcent na triceps",
  climber: "Dynamiczny brzuch",
  core: "Kontrola korpusu",
  squat: "Praca nóg",
  bridge: "Aktywacja pośladków",
  row: "Plecy i łopatki",
  burpee: "Finisher metaboliczny",
  sideplank: "Brzuch boczny",
};

function getInitialRun(workout: BuiltWorkout): ActiveRun {
  const firstStep = workout.timeline[0];

  return {
    workout,
    stepIndex: 0,
    phase: "work",
    secondsLeft: firstStep.workSeconds,
    stepDuration: firstStep.workSeconds,
    paused: false,
    startedAt: new Date().toISOString(),
  };
}

function getCurrentStep(run: ActiveRun | null) {
  if (!run) {
    return null;
  }

  return run.workout.timeline[run.stepIndex] ?? null;
}

function getExerciseCountLabel(workout: BuiltWorkout) {
  const unique = new Set(workout.timeline.map((step) => step.exerciseId));
  return `${unique.size} wariantów`;
}

function getProgressPercent(run: ActiveRun) {
  if (run.stepDuration === 0) {
    return 100;
  }

  return ((run.stepDuration - run.secondsLeft) / run.stepDuration) * 100;
}

function persistState(state: PersistedState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(): PersistedState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultState;
  }

  try {
    return { ...defaultState, ...JSON.parse(raw) } as PersistedState;
  } catch {
    return defaultState;
  }
}

const STICK_INK = "#14120d";
const STICK_FILL = "#f6f1e8";
const STICK_PROP = "#f1c96e";

function Bone({
  x1,
  y1,
  x2,
  y2,
  width = 5,
  children,
}: Readonly<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  children?: React.ReactNode;
}>) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={STICK_INK}
      strokeWidth={width}
      strokeLinecap="round"
    >
      {children}
    </line>
  );
}

function Joint({
  cx,
  cy,
  size = 3,
  children,
}: Readonly<{
  cx: number;
  cy: number;
  size?: number;
  children?: React.ReactNode;
}>) {
  return (
    <circle cx={cx} cy={cy} r={size} fill={STICK_INK}>
      {children}
    </circle>
  );
}

function Head({
  cx,
  cy,
  children,
}: Readonly<{
  cx: number;
  cy: number;
  children?: React.ReactNode;
}>) {
  return (
    <circle cx={cx} cy={cy} r="9" fill={STICK_FILL} stroke={STICK_INK} strokeWidth="3">
      {children}
    </circle>
  );
}

function Floor({ y = 102 }: Readonly<{ y?: number }>) {
  return <line x1="20" y1={y} x2="140" y2={y} stroke="rgba(20,18,13,0.12)" strokeWidth="4" strokeLinecap="round" />;
}

function FigureCanvas({
  motion,
  children,
}: Readonly<{
  motion: MotionType;
  children: React.ReactNode;
}>) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(247,238,225,0.96))] px-4 py-3 shadow-[0_18px_50px_rgba(20,18,13,0.08)]">
      <div className="pointer-events-none absolute inset-x-6 top-5 h-16 rounded-full" />
      <svg viewBox="0 0 160 120" className="mx-auto h-34 w-full max-w-44 overflow-visible">
        {children}
      </svg>
      <div className="mt-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--muted)">
        {motionTitles[motion]}
      </div>
    </div>
  );
}

function MobilityFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={103} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;22;24;22;24" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={34} x2={80} y2={70}>
        <animate attributeName="y1" values="34;32;34;32;34" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={64} y2={56} width={4}>
        <animate attributeName="x2" values="64;56;64;90;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;34;56;34;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={64} y1={56} x2={54} y2={42} width={4}>
        <animate attributeName="x1" values="64;56;64;90;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="56;34;56;34;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="54;42;54;106;54" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="42;20;42;20;42" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={96} y2={56} width={4}>
        <animate attributeName="x2" values="96;104;96;70;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;34;56;34;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={96} y1={56} x2={106} y2={42} width={4}>
        <animate attributeName="x1" values="96;104;96;70;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="56;34;56;34;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="106;118;106;58;106" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="42;20;42;20;42" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={70} y2={86} width={4}>
        <animate attributeName="x2" values="70;76;70;64;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;82;86;84;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={70} y1={86} x2={64} y2={102} width={4}>
        <animate attributeName="x1" values="70;76;70;64;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;82;86;84;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={90} y2={86} width={4}>
        <animate attributeName="x2" values="90;84;90;96;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;84;86;82;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={90} y1={86} x2={96} y2={102} width={4}>
        <animate attributeName="x1" values="90;84;90;96;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;84;86;82;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={80} cy={44} />
      <Joint cx={64} cy={56}>
        <animate attributeName="cx" values="64;56;64;90;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="56;34;56;34;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={96} cy={56}>
        <animate attributeName="cx" values="96;104;96;70;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="56;34;56;34;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={80} cy={70} />
      <Joint cx={70} cy={86}>
        <animate attributeName="cx" values="70;76;70;64;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="86;82;86;84;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={90} cy={86}>
        <animate attributeName="cx" values="90;84;90;96;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="86;84;86;82;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function SquatFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;34;24" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={34} x2={80} y2={70}>
        <animate attributeName="y1" values="34;44;34" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="70;80;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={46} x2={64} y2={58} width={4}>
        <animate attributeName="y1" values="46;56;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="64;58;64" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={64} y1={58} x2={52} y2={54} width={4}>
        <animate attributeName="x1" values="64;58;64" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="52;46;52" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;62;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={46} x2={96} y2={58} width={4}>
        <animate attributeName="y1" values="46;56;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="96;102;96" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={96} y1={58} x2={108} y2={54} width={4}>
        <animate attributeName="x1" values="96;102;96" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="108;114;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;62;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={68} y2={84} width={4}>
        <animate attributeName="y1" values="70;80;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="68;60;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={68} y1={84} x2={58} y2={104} width={4}>
        <animate attributeName="x1" values="68;60;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={92} y2={84} width={4}>
        <animate attributeName="y1" values="70;80;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="92;100;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={92} y1={84} x2={102} y2={104} width={4}>
        <animate attributeName="x1" values="92;100;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={80} cy={46}>
        <animate attributeName="cy" values="46;56;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={64} cy={58}>
        <animate attributeName="cx" values="64;58;64" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={96} cy={58}>
        <animate attributeName="cx" values="96;102;96" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={80} cy={70}>
        <animate attributeName="cy" values="70;80;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={68} cy={84}>
        <animate attributeName="cx" values="68;60;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={92} cy={84}>
        <animate attributeName="cx" values="92;100;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function PushupFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={92} />
      <Head cx={42} cy={50}>
        <animate attributeName="cy" values="50;60;50" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={54} y1={56} x2={102} y2={62}>
        <animate attributeName="y1" values="56;66;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="62;70;62" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={54} y1={56} x2={48} y2={70} width={4}>
        <animate attributeName="y1" values="56;66;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="48;54;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="70;78;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={48} y1={70} x2={42} y2={92} width={4}>
        <animate attributeName="x1" values="48;54;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="70;78;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="42;46;42" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={102} y1={62} x2={116} y2={76} width={4}>
        <animate attributeName="y1" values="62;70;62" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="116;120;116" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="76;82;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={116} y1={76} x2={130} y2={92} width={4}>
        <animate attributeName="x1" values="116;120;116" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="76;82;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={54} cy={56} size={3.2}>
        <animate attributeName="cy" values="56;66;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={48} cy={70} size={3.2}>
        <animate attributeName="cx" values="48;54;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="70;78;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={102} cy={62} size={3.2}>
        <animate attributeName="cy" values="62;70;62" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={116} cy={76} size={3.2}>
        <animate attributeName="cx" values="116;120;116" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="76;82;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function PikeFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={94} />
      <Head cx={52} cy={50}>
        <animate attributeName="cy" values="50;46;50" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={60} y1={54} x2={76} y2={46}>
        <animate attributeName="y2" values="46;34;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={60} y1={54} x2={50} y2={74} width={4}>
        <animate attributeName="y1" values="54;50;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="50;46;50" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="74;84;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={50} y1={74} x2={46} y2={94} width={4}>
        <animate attributeName="x1" values="50;46;50" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="74;84;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={76} y1={46} x2={100} y2={66} width={4}>
        <animate attributeName="y1" values="46;34;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="100;110;100" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="66;60;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={100} y1={66} x2={114} y2={94} width={4}>
        <animate attributeName="x1" values="100;110;100" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="66;60;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="114;120;114" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={60} cy={54}>
        <animate attributeName="cy" values="54;50;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={50} cy={74}>
        <animate attributeName="cx" values="50;46;50" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="74;84;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={76} cy={46}>
        <animate attributeName="cy" values="46;34;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={100} cy={66}>
        <animate attributeName="cx" values="100;110;100" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="66;60;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function PlankFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={94} />
      <Head cx={48} cy={48} />
      <Bone x1={58} y1={54} x2={108} y2={58}>
        <animate attributeName="y1" values="54;52;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;56;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={58} y1={54} x2={54} y2={72} width={4}>
        <animate attributeName="y1" values="54;52;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="54;48;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="72;68;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={54} y1={72} x2={46} y2={94} width={4}>
        <animate attributeName="x1" values="54;48;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="72;68;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="46;40;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={108} y1={58} x2={110} y2={74} width={4}>
        <animate attributeName="y1" values="58;56;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="110;114;110" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={110} y1={74} x2={126} y2={94} width={4}>
        <animate attributeName="x1" values="110;114;110" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="74;72;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={58} cy={54}>
        <animate attributeName="cy" values="54;52;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={54} cy={72}>
        <animate attributeName="cx" values="54;48;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="72;68;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={108} cy={58}>
        <animate attributeName="cy" values="58;56;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={110} cy={74}>
        <animate attributeName="cx" values="110;114;110" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="74;72;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function ClimberFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={94} />
      <Head cx={48} cy={48} />
      <Bone x1={58} y1={54} x2={104} y2={58}>
        <animate attributeName="y1" values="54;52;54;52;54" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;56;58;56;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={58} y1={54} x2={46} y2={94} width={4}>
        <animate attributeName="y1" values="54;52;54;52;54" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={58} x2={114} y2={74} width={4}>
        <animate attributeName="y1" values="58;56;58;56;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="114;86;114;126;114" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="74;66;74;82;74" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={114} y1={74} x2={126} y2={94} width={4}>
        <animate attributeName="x1" values="114;86;114;126;114" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="74;66;74;82;74" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="126;108;126;118;126" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="94;94;94;94;94" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={58} x2={108} y2={76} width={4}>
        <animate attributeName="y1" values="58;56;58;56;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="108;126;108;88;108" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="76;84;76;66;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={108} y1={76} x2={118} y2={94} width={4}>
        <animate attributeName="x1" values="108;126;108;88;108" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="76;84;76;66;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="118;128;118;100;118" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={58} cy={54} size={3.2}>
        <animate attributeName="cy" values="54;52;54;52;54" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={104} cy={58} size={3.2}>
        <animate attributeName="cy" values="58;56;58;56;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={114} cy={74} size={3.2}>
        <animate attributeName="cx" values="114;86;114;126;114" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="74;66;74;82;74" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={108} cy={76} size={3.2}>
        <animate attributeName="cx" values="108;126;108;88;108" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="76;84;76;66;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function DipFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <line x1="34" y1="56" x2="72" y2="56" stroke={STICK_PROP} strokeWidth="5" strokeLinecap="round" />
      <line x1="34" y1="56" x2="34" y2="94" stroke={STICK_PROP} strokeWidth="4" strokeLinecap="round" />
      <line x1="72" y1="56" x2="72" y2="94" stroke={STICK_PROP} strokeWidth="4" strokeLinecap="round" />
      <Head cx={88} cy={26}>
        <animate attributeName="cy" values="26;38;26" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={84} y1={36} x2={86} y2={68}>
        <animate attributeName="y1" values="36;48;36" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="68;80;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={84} y1={48} x2={74} y2={58} width={4}>
        <animate attributeName="y1" values="48;60;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="74;70;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;68;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={74} y1={58} x2={72} y2={56} width={4}>
        <animate attributeName="x1" values="74;70;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="58;68;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={86} y1={68} x2={106} y2={84} width={4}>
        <animate attributeName="y1" values="68;80;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="106;104;106" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={106} y1={84} x2={118} y2={98} width={4}>
        <animate attributeName="x1" values="106;104;106" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={86} y1={68} x2={96} y2={98} width={4}>
        <animate attributeName="y1" values="68;80;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={84} cy={48} size={3.2}>
        <animate attributeName="cy" values="48;60;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={74} cy={58} size={3.2}>
        <animate attributeName="cx" values="74;70;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="58;68;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={86} cy={68} size={3.2}>
        <animate attributeName="cy" values="68;80;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={106} cy={84} size={3.2}>
        <animate attributeName="cx" values="106;104;106" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="84;90;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function CoreFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={98} />
      <Head cx={48} cy={74}>
        <animate attributeName="cy" values="74;66;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={58} y1={74} x2={92} y2={82}>
        <animate attributeName="y1" values="74;66;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="82;74;82" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={58} y1={74} x2={52} y2={88} width={4}>
        <animate attributeName="y1" values="74;66;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="52;46;52" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="88;82;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={52} y1={88} x2={44} y2={98} width={4}>
        <animate attributeName="x1" values="52;46;52" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="88;82;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={92} y1={82} x2={108} y2={86} width={4}>
        <animate attributeName="x2" values="108;98;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;76;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={108} y1={86} x2={124} y2={92} width={4}>
        <animate attributeName="x1" values="108;98;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;76;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="124;112;124" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="92;84;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={58} cy={74} size={3.2}>
        <animate attributeName="cy" values="74;66;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={52} cy={88}>
        <animate attributeName="cx" values="52;46;52" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="88;82;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={92} cy={82}>
        <animate attributeName="cy" values="82;74;82" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={108} cy={86}>
        <animate attributeName="cx" values="108;98;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="86;76;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function BicycleCrunchFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={42} cy={70}>
        <animate attributeName="cx" values="42;58;42;24;42" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="70;60;70;61;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={52} y1={72} x2={84} y2={78}>
        <animate attributeName="x1" values="52;62;52;40;52" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="72;63;72;65;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="84;88;84;80;84" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="78;82;78;81;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={52} y1={72} x2={64} y2={58} width={4}>
        <animate attributeName="x1" values="52;62;52;40;52" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="72;63;72;65;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="64;82;64;20;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;56;58;60;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={64} y1={58} x2={76} y2={76} width={4}>
        <animate attributeName="x1" values="64;82;64;20;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="58;56;58;60;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="76;92;76;34;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="76;82;76;83;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={84} y1={78} x2={104} y2={70} width={4}>
        <animate attributeName="x1" values="84;88;84;80;84" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="78;82;78;81;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="104;88;104;128;104" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="70;88;70;90;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={70} x2={120} y2={54} width={4}>
        <animate attributeName="x1" values="104;88;104;128;104" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="70;88;70;90;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="120;108;120;136;120" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;100;54;96;54" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={84} y1={78} x2={100} y2={88} width={4}>
        <animate attributeName="x1" values="84;88;84;80;84" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="78;82;78;81;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="100;124;100;70;100" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="88;66;88;74;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={100} y1={88} x2={118} y2={98} width={4}>
        <animate attributeName="x1" values="100;124;100;70;100" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="88;66;88;74;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="118;134;118;86;118" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="98;98;98;98;98" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={52} cy={72} size={3.2}>
        <animate attributeName="cx" values="52;62;52;40;52" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="72;63;72;65;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={64} cy={58} size={3.2}>
        <animate attributeName="cx" values="64;82;64;20;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="58;56;58;60;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={84} cy={78} size={3.2}>
        <animate attributeName="cx" values="84;88;84;80;84" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="78;82;78;81;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={104} cy={70} size={3.2}>
        <animate attributeName="cx" values="104;88;104;128;104" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="70;88;70;90;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={100} cy={88} size={3.2}>
        <animate attributeName="cx" values="100;124;100;70;100" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="88;66;88;74;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function MarchReachFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;22;24;22;24" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={34} x2={80} y2={70} />
      <Bone x1={80} y1={44} x2={64} y2={58} width={4}>
        <animate attributeName="x2" values="64;58;64;104;64" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;28;58;28;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={96} y2={58} width={4}>
        <animate attributeName="x2" values="96;102;96;56;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;28;58;28;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={70} y2={86} width={4}>
        <animate attributeName="x2" values="70;82;70;58;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;74;86;74;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={70} y1={86} x2={64} y2={104} width={4}>
        <animate attributeName="x1" values="70;82;70;58;70" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;74;86;74;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={90} y2={86} width={4}>
        <animate attributeName="x2" values="90;78;90;102;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;74;86;74;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={90} y1={86} x2={96} y2={104} width={4}>
        <animate attributeName="x1" values="90;78;90;102;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;74;86;74;86" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function ArmSweepSquatFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;32;24" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={34} x2={80} y2={70}>
        <animate attributeName="y1" values="34;42;34" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="70;80;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={48} y2={54} width={4}>
        <animate attributeName="x2" values="48;40;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;36;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={112} y2={54} width={4}>
        <animate attributeName="x2" values="112;120;112" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;36;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={68} y2={86} width={4}>
        <animate attributeName="y2" values="86;92;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={68} y1={86} x2={60} y2={104} width={4}>
        <animate attributeName="y1" values="86;92;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={70} x2={92} y2={86} width={4}>
        <animate attributeName="y2" values="86;92;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={92} y1={86} x2={100} y2={104} width={4}>
        <animate attributeName="y1" values="86;92;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function WalkoutPlankFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={92} cy={26}>
        <animate attributeName="cx" values="92;70;48;92" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="26;38;50;26" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={88} y1={36} x2={84} y2={72}>
        <animate attributeName="x1" values="88;76;58;88" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="36;48;58;36" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="84;92;104;84" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={88} y1={46} x2={74} y2={72} width={4}>
        <animate attributeName="x1" values="88;76;58;88" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="46;56;60;46" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="74;58;36;74" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="72;92;94;72" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={84} y1={72} x2={72} y2={104} width={4}>
        <animate attributeName="x1" values="84;92;104;84" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={84} y1={72} x2={102} y2={104} width={4}>
        <animate attributeName="x1" values="84;92;104;84" keyTimes="0;0.4;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function ThoracicReachFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={54} cy={54} />
      <Bone x1={64} y1={60} x2={88} y2={64} />
      <Bone x1={64} y1={60} x2={42} y2={84} width={4} />
      <Bone x1={88} y1={64} x2={108} y2={86} width={4} />
      <Bone x1={70} y1={62} x2={50} y2={82} width={4} />
      <Bone x1={70} y1={62} x2={96} y2={48} width={4}>
        <animate attributeName="x2" values="76;108;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="70;24;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function ForearmPlankReachFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={94} />
      <Head cx={44} cy={50} />
      <Bone x1={54} y1={56} x2={106} y2={58} />
      <Bone x1={58} y1={58} x2={46} y2={94} width={4} />
      <Bone x1={104} y1={58} x2={124} y2={94} width={4} />
      <Bone x1={62} y1={58} x2={52} y2={80} width={4} />
      <Bone x1={66} y1={56} x2={96} y2={44} width={4}>
        <animate attributeName="x2" values="66;102;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;34;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function BearPlankTapFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={98} />
      <Head cx={56} cy={44} />
      <Bone x1={66} y1={50} x2={96} y2={56} />
      <Bone x1={70} y1={52} x2={56} y2={78} width={4}>
        <animate attributeName="x2" values="56;76;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="78;50;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={96} y1={56} x2={106} y2={78} width={4} />
      <Bone x1={78} y1={56} x2={72} y2={98} width={4} />
      <Bone x1={96} y1={56} x2={108} y2={98} width={4} />
    </>
  );
}

function DeadBugFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={40} cy={78} />
      <Bone x1={50} y1={78} x2={82} y2={80} />
      <Bone x1={58} y1={76} x2={30} y2={50} width={4}>
        <animate attributeName="x2" values="30;18;30;74;30" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="50;36;50;42;50" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={58} y1={76} x2={78} y2={56} width={4}>
        <animate attributeName="x2" values="78;66;78;112;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;48;56;44;56" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={80} x2={96} y2={66} width={4}>
        <animate attributeName="x2" values="96;124;96;88;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="66;54;66;54;66" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={96} y1={66} x2={108} y2={98} width={4}>
        <animate attributeName="x1" values="96;124;96;88;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={80} x2={96} y2={94} width={4}>
        <animate attributeName="x2" values="96;86;96;124;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="94;66;94;66;94" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={96} y1={94} x2={116} y2={98} width={4}>
        <animate attributeName="x1" values="96;86;96;124;96" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="116;82;116;136;116" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function HollowHoldFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={38} cy={72}>
        <animate attributeName="cy" values="72;68;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={48} y1={72} x2={86} y2={76}>
        <animate attributeName="y1" values="72;68;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="76;72;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={54} y1={70} x2={24} y2={48} width={4} />
      <Bone x1={54} y1={70} x2={84} y2={48} width={4} />
      <Bone x1={86} y1={76} x2={110} y2={64} width={4}>
        <animate attributeName="y2" values="64;58;64" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={110} y1={64} x2={132} y2={54} width={4}>
        <animate attributeName="y1" values="64;58;64" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;48;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function ReverseCrunchFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={38} cy={84} />
      <Bone x1={48} y1={84} x2={82} y2={86} />
      <Bone x1={82} y1={86} x2={98} y2={78} width={4}>
        <animate attributeName="x2" values="98;86;98" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="78;62;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={98} y1={78} x2={112} y2={56} width={4}>
        <animate attributeName="x1" values="98;86;98" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="78;62;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="112;94;112" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;36;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={86} x2={98} y2={96} width={4} />
    </>
  );
}

function SeatedKneeTuckFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={56} cy={56} />
      <Bone x1={64} y1={62} x2={88} y2={72}>
        <animate attributeName="y2" values="72;64;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={64} y1={64} x2={46} y2={96} width={4} />
      <Bone x1={88} y1={72} x2={104} y2={82} width={4}>
        <animate attributeName="x2" values="104;92;104" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="82;66;82" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={82} x2={122} y2={94} width={4}>
        <animate attributeName="x1" values="104;92;104" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="82;66;82" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="122;108;122" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="94;74;94" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function FastFeetFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={24} />
      <Bone x1={80} y1={34} x2={80} y2={68}>
        <animate attributeName="y2" values="68;66;68;66;68" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={68} y2={56} width={4}>
        <animate attributeName="x2" values="68;74;68;86;68" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={92} y2={56} width={4}>
        <animate attributeName="x2" values="92;86;92;74;92" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={68} x2={72} y2={88} width={4}>
        <animate attributeName="x2" values="72;82;72;64;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={72} y1={88} x2={64} y2={104} width={4}>
        <animate attributeName="x1" values="72;82;72;64;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={68} x2={88} y2={88} width={4}>
        <animate attributeName="x2" values="88;78;88;96;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={88} y1={88} x2={96} y2={104} width={4}>
        <animate attributeName="x1" values="88;78;88;96;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function SkaterStepFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={72} cy={24}>
        <animate attributeName="cx" values="72;92;72;52;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={72} y1={34} x2={84} y2={70}>
        <animate attributeName="x1" values="72;92;72;52;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="84;96;84;72;84" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={76} y1={44} x2={58} y2={58} width={4} />
      <Bone x1={76} y1={44} x2={100} y2={56} width={4} />
      <Bone x1={84} y1={70} x2={66} y2={88} width={4}>
        <animate attributeName="x2" values="66;90;66;52;66" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={88} x2={48} y2={104} width={4}>
        <animate attributeName="x1" values="66;90;66;52;66" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="48;118;48;34;48" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={84} y1={70} x2={98} y2={92} width={4}>
        <animate attributeName="x2" values="98;84;98;112;98" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={98} y1={92} x2={114} y2={104} width={4}>
        <animate attributeName="x1" values="98;84;98;112;98" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function StepJackFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={24} />
      <Bone x1={80} y1={34} x2={80} y2={68} />
      <Bone x1={80} y1={44} x2={60} y2={56} width={4}>
        <animate attributeName="x2" values="60;42;60" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;24;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={100} y2={56} width={4}>
        <animate attributeName="x2" values="100;118;100" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;24;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={68} x2={72} y2={88} width={4}>
        <animate attributeName="x2" values="72;58;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={72} y1={88} x2={66} y2={104} width={4}>
        <animate attributeName="x1" values="72;58;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="66;48;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={68} x2={88} y2={88} width={4}>
        <animate attributeName="x2" values="88;102;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={88} y1={88} x2={94} y2={104} width={4}>
        <animate attributeName="x1" values="88;102;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="94;112;94" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function HighKneesFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;22;24;22;24" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={34} x2={80} y2={68} />
      <Bone x1={80} y1={44} x2={68} y2={58} width={4}>
        <animate attributeName="x2" values="68;76;68;92;68" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;50;58;50;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={44} x2={92} y2={58} width={4}>
        <animate attributeName="x2" values="92;84;92;68;92" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="58;50;58;50;58" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={68} x2={72} y2={82} width={4}>
        <animate attributeName="x2" values="72;86;72;60;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="82;58;82;58;82" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={72} y1={82} x2={66} y2={104} width={4}>
        <animate attributeName="x1" values="72;86;72;60;72" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="82;58;82;58;82" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="66;80;66;54;66" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={68} x2={88} y2={82} width={4}>
        <animate attributeName="x2" values="88;74;88;100;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="82;58;82;58;82" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={88} y1={82} x2={94} y2={104} width={4}>
        <animate attributeName="x1" values="88;74;88;100;88" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="82;58;82;58;82" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="94;80;94;106;94" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function ReverseLungeDriveFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={82} cy={24} />
      <Bone x1={82} y1={34} x2={82} y2={70} />
      <Bone x1={82} y1={44} x2={64} y2={58} width={4} />
      <Bone x1={82} y1={44} x2={100} y2={58} width={4} />
      <Bone x1={82} y1={70} x2={70} y2={88} width={4}>
        <animate attributeName="x2" values="70;60;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="88;96;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={70} y1={88} x2={60} y2={104} width={4}>
        <animate attributeName="x1" values="70;60;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={70} x2={94} y2={86} width={4}>
        <animate attributeName="x2" values="94;86;94" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;60;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={94} y1={86} x2={98} y2={104} width={4}>
        <animate attributeName="x1" values="94;86;94" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;60;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function SplitSquatFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={78} cy={24}>
        <animate attributeName="cy" values="24;30;24" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={78} y1={34} x2={78} y2={72}>
        <animate attributeName="y1" values="34;40;34" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="72;78;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={78} y1={70} x2={66} y2={86} width={4} />
      <Bone x1={66} y1={86} x2={58} y2={104} width={4} />
      <Bone x1={78} y1={70} x2={94} y2={88} width={4} />
      <Bone x1={94} y1={88} x2={108} y2={104} width={4} />
    </>
  );
}

function SquatPulseFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={104} />
      <Head cx={80} cy={30}>
        <animate attributeName="cy" values="30;34;30;34;30" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={40} x2={80} y2={78}>
        <animate attributeName="y1" values="40;44;40;44;40" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="78;82;78;82;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={50} x2={62} y2={62} width={4}>
        <animate attributeName="y1" values="50;54;50;54;50" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="62;66;62;66;62" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={50} x2={98} y2={62} width={4}>
        <animate attributeName="y1" values="50;54;50;54;50" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="62;66;62;66;62" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={78} x2={66} y2={90} width={4}>
        <animate attributeName="y1" values="78;82;78;82;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="90;94;90;94;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={90} x2={58} y2={104} width={4}>
        <animate attributeName="y1" values="90;94;90;94;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={78} x2={94} y2={90} width={4}>
        <animate attributeName="y1" values="78;82;78;82;78" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="90;94;90;94;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={94} y1={90} x2={102} y2={104} width={4}>
        <animate attributeName="y1" values="90;94;90;94;90" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function SquatToKneeDriveFigure({ dur }: Readonly<{ dur: string }>) {
  return <ReverseLungeDriveFigure dur={dur} />;
}

function SingleLegBridgeFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={98} />
      <Head cx={42} cy={84} />
      <Bone x1={52} y1={84} x2={82} y2={76}>
        <animate attributeName="y2" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={76} x2={104} y2={72}>
        <animate attributeName="y1" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="72;62;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={72} x2={126} y2={44} width={4}>
        <animate attributeName="y1" values="72;62;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="44;34;44" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={76} x2={68} y2={86} width={4}>
        <animate attributeName="y1" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="68;62;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="86;80;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={68} y1={86} x2={52} y2={98} width={4}>
        <animate attributeName="x1" values="68;62;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="86;80;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={82} cy={76} size={3.2}>
        <animate attributeName="cy" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={104} cy={72} size={3.2}>
        <animate attributeName="cy" values="72;62;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={68} cy={86} size={3.2}>
        <animate attributeName="cx" values="68;62;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="86;80;86" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function GluteBridgeHoldFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={98} />
      <Head cx={42} cy={84} />
      <Bone x1={52} y1={84} x2={82} y2={76}>
        <animate attributeName="y2" values="76;56;56;76" keyTimes="0;0.25;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={76} x2={112} y2={82}>
        <animate attributeName="y1" values="76;56;56;76" keyTimes="0;0.25;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="82;74;74;82" keyTimes="0;0.25;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={112} y1={82} x2={126} y2={98} width={4}>
        <animate attributeName="y1" values="82;74;74;82" keyTimes="0;0.25;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={52} y1={84} x2={44} y2={98} width={4} />
      <Joint cx={82} cy={76} size={3.2}>
        <animate attributeName="cy" values="76;56;56;76" keyTimes="0;0.25;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={112} cy={82} size={3.2}>
        <animate attributeName="cy" values="82;74;74;82" keyTimes="0;0.25;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function BurpeeStepBackFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={102} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;34;50;56;24" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={36} x2={80} y2={72}>
        <animate attributeName="y1" values="36;44;56;64;36" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="72;78;82;84;72" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={48} x2={66} y2={64} width={4}>
        <animate attributeName="y1" values="48;54;72;80;48" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="66;58;46;40;66" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="64;80;96;100;64" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={64} x2={54} y2={100} width={4}>
        <animate attributeName="x1" values="66;58;46;40;66" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="64;80;96;100;64" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="54;50;42;38;54" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={48} x2={94} y2={64} width={4}>
        <animate attributeName="y1" values="48;54;72;80;48" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="94;100;92;108;94" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="64;80;78;100;64" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={94} y1={64} x2={106} y2={100} width={4}>
        <animate attributeName="x1" values="94;100;92;108;94" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="64;80;78;100;64" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="106;112;106;122;106" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={72} x2={70} y2={88} width={4}>
        <animate attributeName="y1" values="72;78;80;82;72" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="70;66;80;90;70" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="88;94;100;92;88" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={70} y1={88} x2={62} y2={102} width={4}>
        <animate attributeName="x1" values="70;66;80;90;70" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="88;94;100;92;88" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="62;58;84;100;62" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={72} x2={92} y2={88} width={4}>
        <animate attributeName="y1" values="72;78;80;82;72" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="92;88;78;70;92" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="88;94;100;92;88" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={92} y1={88} x2={98} y2={102} width={4}>
        <animate attributeName="x1" values="92;88;78;70;92" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="88;94;100;92;88" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="98;94;74;66;98" keyTimes="0;0.2;0.45;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function PikePushupHoldFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={94} />
      <Head cx={54} cy={58}>
        <animate attributeName="cy" values="58;72;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={62} y1={60} x2={82} y2={42}>
        <animate attributeName="y1" values="60;72;60" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="42;34;42" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={62} y1={60} x2={44} y2={94} width={4} />
      <Bone x1={82} y1={42} x2={112} y2={94} width={4} />
    </>
  );
}

function SidePlankReachFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={96} />
      <Head cx={42} cy={54} />
      <Bone x1={50} y1={58} x2={98} y2={64} />
      <Bone x1={50} y1={58} x2={46} y2={96} width={4} />
      <Bone x1={98} y1={64} x2={126} y2={76} width={4} />
      <Bone x1={78} y1={62} x2={98} y2={54} width={4}>
        <animate attributeName="x2" values="98;56;98" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;78;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function CrossClimberFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={94} />
      <Head cx={48} cy={48} />
      <Bone x1={58} y1={54} x2={104} y2={58} />
      <Bone x1={58} y1={54} x2={46} y2={94} width={4} />
      <Bone x1={104} y1={58} x2={98} y2={76} width={4}>
        <animate attributeName="x2" values="98;76;98;122;98" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="76;70;76;70;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={98} y1={76} x2={84} y2={94} width={4}>
        <animate attributeName="x1" values="98;76;98;122;98" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="84;66;84;130;84" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={58} x2={114} y2={76} width={4}>
        <animate attributeName="x2" values="114;128;114;88;114" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="76;84;76;66;76" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={114} y1={76} x2={124} y2={94} width={4}>
        <animate attributeName="x1" values="114;128;114;88;114" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="124;132;124;100;124" keyTimes="0;0.25;0.5;0.75;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function CobraReachFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={42} cy={74}>
        <animate attributeName="cy" values="74;64;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={52} y1={76} x2={86} y2={78}>
        <animate attributeName="y1" values="76;64;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="78;70;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={58} y1={76} x2={40} y2={94} width={4} />
      <Bone x1={58} y1={76} x2={96} y2={48} width={4}>
        <animate attributeName="x2" values="74;106;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="68;34;68" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
    </>
  );
}

function ChildPoseShiftFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={100} />
      <Head cx={66} cy={76}>
        <animate attributeName="cx" values="66;54;78;66" keyTimes="0;0.33;0.66;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={74} y1={78} x2={92} y2={84}>
        <animate attributeName="x2" values="92;84;100;92" keyTimes="0;0.33;0.66;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={92} y1={84} x2={118} y2={66} width={4}>
        <animate attributeName="x1" values="92;84;100;92" keyTimes="0;0.33;0.66;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="118;102;134;118" keyTimes="0;0.33;0.66;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={92} y1={84} x2={112} y2={100} width={4}>
        <animate attributeName="x1" values="92;84;100;92" keyTimes="0;0.33;0.66;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={84} x2={64} y2={100} width={4} />
    </>
  );
}

function ChestOpenerWallFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <line x1="118" y1="20" x2="118" y2="104" stroke={STICK_PROP} strokeWidth="6" strokeLinecap="round" />
      <Floor y={104} />
      <Head cx={66} cy={24}>
        <animate attributeName="cx" values="66;74;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={66} y1={34} x2={70} y2={72}>
        <animate attributeName="x1" values="66;74;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="70;78;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={46} x2={50} y2={56} width={4} />
      <Bone x1={66} y1={46} x2={118} y2={46} width={4}>
        <animate attributeName="x1" values="66;74;66" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={70} y1={72} x2={62} y2={104} width={4} />
      <Bone x1={70} y1={72} x2={84} y2={104} width={4} />
    </>
  );
}

function BridgeFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={98} />
      <Head cx={42} cy={84} />
      <Bone x1={52} y1={84} x2={82} y2={76}>
        <animate attributeName="y2" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={76} x2={108} y2={70}>
        <animate attributeName="y1" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="108;114;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="70;66;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={108} y1={70} x2={126} y2={98} width={4}>
        <animate attributeName="x1" values="108;114;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="70;66;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={52} y1={84} x2={50} y2={92} width={4}>
        <animate attributeName="y2" values="92;88;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={50} y1={92} x2={44} y2={98} width={4}>
        <animate attributeName="y1" values="92;88;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={52} cy={84} size={3.2} />
      <Joint cx={82} cy={76}>
        <animate attributeName="cy" values="76;56;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={108} cy={70}>
        <animate attributeName="cx" values="108;114;108" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="70;66;70" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={50} cy={92}>
        <animate attributeName="cy" values="92;88;92" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function RowFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <line x1="28" y1="44" x2="126" y2="44" stroke={STICK_PROP} strokeWidth="6" strokeLinecap="round" />
      <line x1="34" y1="44" x2="34" y2="98" stroke={STICK_PROP} strokeWidth="4" strokeLinecap="round" />
      <line x1="120" y1="44" x2="120" y2="98" stroke={STICK_PROP} strokeWidth="4" strokeLinecap="round" />
      <Head cx={54} cy={76}>
        <animate attributeName="cy" values="76;62;76" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={64} y1={78} x2={98} y2={84}>
        <animate attributeName="y1" values="78;64;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="84;70;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={64} y1={78} x2={74} y2={56} width={4}>
        <animate attributeName="y1" values="78;64;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="56;50;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={74} y1={56} x2={72} y2={44} width={4}>
        <animate attributeName="x1" values="74;76;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="56;50;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={98} y1={84} x2={112} y2={88} width={4}>
        <animate attributeName="x1" values="98;102;98" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="84;70;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="112;126;112" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={112} y1={88} x2={126} y2={92} width={4}>
        <animate attributeName="x1" values="112;126;112" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="88;80;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={64} cy={78} size={3.2}>
        <animate attributeName="cy" values="78;64;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={74} cy={56}>
        <animate attributeName="cx" values="74;76;74" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="56;50;56" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={98} cy={84} size={3.2}>
        <animate attributeName="cx" values="98;102;98" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="84;70;84" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={112} cy={88}>
        <animate attributeName="cx" values="112;126;112" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="88;80;88" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function SidePlankFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={96} />
      <Head cx={52} cy={46}>
        <animate attributeName="cy" values="46;54;46" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={60} y1={58} x2={106} y2={62}>
        <animate attributeName="y1" values="58;66;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="62;74;62" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={60} y1={58} x2={48} y2={78} width={4}>
        <animate attributeName="y1" values="58;66;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={48} y1={78} x2={64} y2={96} width={4}>
        <animate attributeName="x1" values="48;48;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="78;78;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={58} x2={82} y2={54} width={4}>
        <animate attributeName="y1" values="58;66;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="54;62;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={82} y1={54} x2={96} y2={64} width={4}>
        <animate attributeName="y1" values="54;62;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="64;72;64" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={106} y1={62} x2={120} y2={80} width={4}>
        <animate attributeName="y1" values="62;74;62" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={120} y1={80} x2={132} y2={96} width={4}>
        <animate attributeName="x1" values="120;120;120" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="80;80;80" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={104} y1={58} x2={120} y2={72} width={4}>
        <animate attributeName="y1" values="58;70;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={120} y1={72} x2={132} y2={90} width={4}>
        <animate attributeName="x1" values="120;120;120" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="72;72;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={60} cy={58} size={3.2}>
        <animate attributeName="cy" values="58;66;58" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={48} cy={78} size={3.2}>
        <animate attributeName="cx" values="48;48;48" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="78;78;78" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={82} cy={54} size={3.2}>
        <animate attributeName="cy" values="54;62;54" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={106} cy={62} size={3.2}>
        <animate attributeName="cy" values="62;74;62" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={120} cy={80} size={3.2}>
        <animate attributeName="cx" values="120;120;120" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="80;80;80" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={120} cy={72} size={3.2}>
        <animate attributeName="cx" values="120;120;120" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="72;72;72" keyTimes="0;0.5;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function BurpeeFigure({ dur }: Readonly<{ dur: string }>) {
  return (
    <>
      <Floor y={102} />
      <Head cx={80} cy={24}>
        <animate attributeName="cy" values="24;44;58;24" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Head>
      <Bone x1={80} y1={36} x2={80} y2={72}>
        <animate attributeName="y1" values="36;52;66;36" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="72;82;84;72" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={48} x2={66} y2={64} width={4}>
        <animate attributeName="y1" values="48;64;78;48" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="66;60;52;66" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="64;78;92;64" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={64} x2={54} y2={100} width={4}>
        <animate attributeName="x1" values="66;60;52;66" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="64;78;92;64" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="54;48;40;54" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="100;102;102;100" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={48} x2={94} y2={64} width={4}>
        <animate attributeName="y1" values="48;64;78;48" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="94;100;108;94" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="64;78;92;64" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={94} y1={64} x2={106} y2={100} width={4}>
        <animate attributeName="x1" values="94;100;108;94" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="64;78;92;64" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="106;112;120;106" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="100;102;102;100" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={72} x2={66} y2={84} width={4}>
        <animate attributeName="y1" values="72;82;84;72" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="66;74;84;66" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="84;92;102;84" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={66} y1={84} x2={62} y2={102} width={4}>
        <animate attributeName="x1" values="66;74;84;66" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="84;92;102;84" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="62;70;90;62" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={80} y1={72} x2={94} y2={84} width={4}>
        <animate attributeName="y1" values="72;82;84;72" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="94;86;76;94" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y2" values="84;92;102;84" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Bone x1={94} y1={84} x2={98} y2={102} width={4}>
        <animate attributeName="x1" values="94;86;76;94" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="y1" values="84;92;102;84" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="x2" values="98;90;70;98" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Bone>
      <Joint cx={80} cy={48} size={3.2}>
        <animate attributeName="cy" values="48;64;78;48" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={80} cy={72} size={3.2}>
        <animate attributeName="cy" values="72;82;84;72" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={66} cy={64} size={3.2}>
        <animate attributeName="cx" values="66;60;52;66" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="64;78;92;64" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={94} cy={64} size={3.2}>
        <animate attributeName="cx" values="94;100;108;94" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="64;78;92;64" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={66} cy={84} size={3.2}>
        <animate attributeName="cx" values="66;74;84;66" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="84;92;102;84" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
      <Joint cx={94} cy={84} size={3.2}>
        <animate attributeName="cx" values="94;86;76;94" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
        <animate attributeName="cy" values="84;92;102;84" keyTimes="0;0.35;0.7;1" dur={dur} repeatCount="indefinite" />
      </Joint>
    </>
  );
}

function AnimatedMotion({ motion, phase, exerciseId }: Readonly<AnimatedMotionProps>) {
  const dur = phase === "rest" ? "3.4s" : "2.1s";

  let figure: React.ReactNode;

  switch (exerciseId) {
    case "march-reach":
      figure = <MarchReachFigure dur={dur} />;
      break;
    case "arm-sweep-squat":
      figure = <ArmSweepSquatFigure dur={dur} />;
      break;
    case "walkout-plank":
      figure = <WalkoutPlankFigure dur={dur} />;
      break;
    case "thoracic-reach":
      figure = <ThoracicReachFigure dur={dur} />;
      break;
    case "tempo-pushup":
    case "incline-pushup":
    case "close-grip-pushup":
    case "wide-pushup":
      figure = <PushupFigure dur={dur} />;
      break;
    case "pike-shoulder-tap":
      figure = <PikeFigure dur={dur} />;
      break;
    case "forearm-plank-reach":
      figure = <ForearmPlankReachFigure dur={dur} />;
      break;
    case "chair-dip":
      figure = <DipFigure dur={dur} />;
      break;
    case "dead-bug-press":
      figure = <DeadBugFigure dur={dur} />;
      break;
    case "mountain-climber":
      figure = <ClimberFigure dur={dur} />;
      break;
    case "hollow-hold":
      figure = <HollowHoldFigure dur={dur} />;
      break;
    case "squat-thrust":
      figure = <BurpeeFigure dur={dur} />;
      break;
    case "burpee-step-back":
      figure = <BurpeeStepBackFigure dur={dur} />;
      break;
    case "bicycle-crunch":
      figure = <BicycleCrunchFigure dur={dur} />;
      break;
    case "fast-feet":
      figure = <FastFeetFigure dur={dur} />;
      break;
    case "reverse-lunge-drive":
      figure = <ReverseLungeDriveFigure dur={dur} />;
      break;
    case "split-squat":
      figure = <SplitSquatFigure dur={dur} />;
      break;
    case "single-leg-bridge":
      figure = <SingleLegBridgeFigure dur={dur} />;
      break;
    case "table-row":
      figure = <RowFigure dur={dur} />;
      break;
    case "side-plank-hip-lift":
      figure = <SidePlankFigure dur={dur} />;
      break;
    case "squat-pulse":
      figure = <SquatPulseFigure dur={dur} />;
      break;
    case "bear-plank-tap":
      figure = <BearPlankTapFigure dur={dur} />;
      break;
    case "reverse-crunch":
      figure = <ReverseCrunchFigure dur={dur} />;
      break;
    case "skater-step":
      figure = <SkaterStepFigure dur={dur} />;
      break;
    case "glute-bridge-hold":
      figure = <GluteBridgeHoldFigure dur={dur} />;
      break;
    case "step-jack":
      figure = <StepJackFigure dur={dur} />;
      break;
    case "high-knees-march":
      figure = <HighKneesFigure dur={dur} />;
      break;
    case "pike-pushup-hold":
      figure = <PikePushupHoldFigure dur={dur} />;
      break;
    case "side-plank-reach":
      figure = <SidePlankReachFigure dur={dur} />;
      break;
    case "cross-climber":
      figure = <CrossClimberFigure dur={dur} />;
      break;
    case "squat-to-knee-drive":
      figure = <SquatToKneeDriveFigure dur={dur} />;
      break;
    case "seated-knee-tuck":
      figure = <SeatedKneeTuckFigure dur={dur} />;
      break;
    case "cobra-reach":
      figure = <CobraReachFigure dur={dur} />;
      break;
    case "child-pose-shift":
      figure = <ChildPoseShiftFigure dur={dur} />;
      break;
    case "chest-opener-wall":
      figure = <ChestOpenerWallFigure dur={dur} />;
      break;
    default:
      figure = null;
      break;
  }

  if (figure) {
    return <FigureCanvas motion={motion}>{figure}</FigureCanvas>;
  }

  switch (motion) {
    case "mobility":
      figure = <MobilityFigure dur={dur} />;
      break;
    case "pushup":
      figure = <PushupFigure dur={dur} />;
      break;
    case "pike":
      figure = <PikeFigure dur={dur} />;
      break;
    case "plank":
      figure = <PlankFigure dur={dur} />;
      break;
    case "dip":
      figure = <DipFigure dur={dur} />;
      break;
    case "climber":
      figure = <ClimberFigure dur={dur} />;
      break;
    case "core":
      figure = <CoreFigure dur={dur} />;
      break;
    case "squat":
      figure = <SquatFigure dur={dur} />;
      break;
    case "bridge":
      figure = <BridgeFigure dur={dur} />;
      break;
    case "row":
      figure = <RowFigure dur={dur} />;
      break;
    case "burpee":
      figure = <BurpeeFigure dur={dur} />;
      break;
    case "sideplank":
      figure = <SidePlankFigure dur={dur} />;
      break;
    default:
      figure = <MobilityFigure dur={dur} />;
      break;
  }

  return <FigureCanvas motion={motion}>{figure}</FigureCanvas>;
}

function SectionCard({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-[28px] border border-black/10 bg-[rgba(255,248,239,0.84)] p-3 shadow-[0_20px_60px_rgba(24,17,10,0.12)] backdrop-blur-sm">
      <h2 className="text-[0.72rem] font-semibold text-center uppercase tracking-[0.24em] text-(--muted)">
        {title}
      </h2>
      <div className="mt-4 text-center">{children}</div>
    </section>
  );
}

function Badge({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="whitespace-nowrap rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-(--ink) shadow-[0_8px_20px_rgba(20,18,13,0.06)]">
      {children}
    </span>
  );
}

function TimerRing({
  progress,
  children,
  size = 9.8,
  innerTone = "bg-[rgba(252,247,239,0.96)]",
}: Readonly<{
  progress: number;
  children: React.ReactNode;
  size?: number;
  innerTone?: string;
}>) {
  const innerSize = Math.round(size * 0.875 * 1000) / 1000;

  return (
    <div
      className="timer-ring flex items-center justify-center rounded-full"
      style={{
        ["--progress" as string]: `${progress}`,
        width: `${size}rem`,
        height: `${size}rem`,
      }}
    >
      <div
        className={`flex flex-col items-center justify-center rounded-full ${innerTone} shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]`}
        style={{
          width: `${innerSize}rem`,
          height: `${innerSize}rem`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function WorkoutApp() {
  const [state, setState] = useState<PersistedState | null>(null);
  const [screen, setScreen] = useState<ScreenState>("welcome");
  const [justCompleted, setJustCompleted] = useState<BuiltWorkout | null>(null);
  const finishedWorkoutRef = useRef<BuiltWorkout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const lastCueRef = useRef<string | null>(null);
  const pendingFinishCueRef = useRef<ActiveRun["phase"] | null>(null);

  const unlockAudio = async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch {
        return null;
      }
    }

    audioUnlockedRef.current = audioContextRef.current.state === "running";

    return audioContextRef.current;
  };

  const ensureAudio = () => {
    const context = audioContextRef.current;

    if (!context || !audioUnlockedRef.current || context.state !== "running") {
      return null;
    }

    return context;
  };

  useEffect(() => {
    queueMicrotask(() => {
      const initial = loadState();
      setState(initial);
      setScreen(initial.activeRun ? "session" : "welcome");
    });
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }

    persistState(state);
  }, [state]);

  useEffect(() => {
    if (!state?.activeRun && finishedWorkoutRef.current) {
      const finished = finishedWorkoutRef.current;
      finishedWorkoutRef.current = null;
      setJustCompleted(finished);
      startTransition(() => {
        setScreen("plan");
      });
    }
  }, [state]);

  const playCue = useEffectEvent(async (frequency: number, duration: number) => {
    try {
      const context = ensureAudio();

      if (!context) {
        return;
      }

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch {
      return;
    }
  });

  const playFinishCue = useEffectEvent(async (phase: ActiveRun["phase"]) => {
    try {
      const context = ensureAudio();

      if (!context) {
        return;
      }

      const now = context.currentTime;
      const primary = context.createOscillator();
      const secondary = context.createOscillator();
      const gain = context.createGain();

      primary.type = "sine";
      secondary.type = "triangle";

      if (phase === "work") {
        primary.frequency.setValueAtTime(660, now);
        primary.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        secondary.frequency.setValueAtTime(990, now);
      } else {
        primary.frequency.setValueAtTime(520, now);
        primary.frequency.exponentialRampToValueAtTime(690, now + 0.16);
        secondary.frequency.setValueAtTime(780, now);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      primary.connect(gain);
      secondary.connect(gain);
      gain.connect(context.destination);

      primary.start(now);
      secondary.start(now);
      primary.stop(now + 0.26);
      secondary.stop(now + 0.22);
    } catch {
      return;
    }
  });

  const tick = useEffectEvent(() => {
    setState((current) => {
      if (!current?.activeRun || current.activeRun.paused) {
        return current;
      }

      const run = current.activeRun;

      if (run.secondsLeft > 1) {
        return {
          ...current,
          activeRun: {
            ...run,
            secondsLeft: run.secondsLeft - 1,
          },
        };
      }

      const step = run.workout.timeline[run.stepIndex];
      pendingFinishCueRef.current = run.phase;

      if (run.phase === "work" && step.restSeconds > 0) {
        return {
          ...current,
          activeRun: {
            ...run,
            phase: "rest",
            secondsLeft: step.restSeconds,
            stepDuration: step.restSeconds,
          },
        };
      }

      const nextIndex = run.stepIndex + 1;

      if (nextIndex >= run.workout.timeline.length) {
        finishedWorkoutRef.current = run.workout;

        return {
          ...current,
          completedSessions: current.completedSessions + 1,
          completedWorkoutKeys: [...current.completedWorkoutKeys, run.workout.key],
          lastCompletedAt: new Date().toISOString(),
          activeRun: null,
        };
      }

      const nextStep = run.workout.timeline[nextIndex];

      return {
        ...current,
        activeRun: {
          ...run,
          stepIndex: nextIndex,
          phase: "work",
          secondsLeft: nextStep.workSeconds,
          stepDuration: nextStep.workSeconds,
        },
      };
    });
  });

  useEffect(() => {
    if (!state?.activeRun) {
      lastCueRef.current = null;
      return;
    }

    const timer = window.setInterval(() => {
      tick();
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [state?.activeRun]);

  useEffect(() => {
    if (!state?.activeRun) {
      lastCueRef.current = null;
      return;
    }

    const run = state.activeRun;
    const cueKey = `${run.stepIndex}-${run.phase}-${run.secondsLeft}`;

    if (lastCueRef.current === cueKey) {
      return;
    }

    if (run.secondsLeft <= 3) {
      lastCueRef.current = cueKey;
      void playCue(run.phase === "rest" ? 620 : 540, run.secondsLeft === 1 ? 0.2 : 0.12);
    }
  }, [state?.activeRun]);

  useEffect(() => {
    const pendingPhase = pendingFinishCueRef.current;

    if (!pendingPhase) {
      return;
    }

    pendingFinishCueRef.current = null;
    void playFinishCue(pendingPhase);
  }, [state]);

  if (!state) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-97.5 items-center justify-center px-6 py-10">
        <div className="rounded-[28px] border border-black/10 bg-white/70 px-6 py-8 text-center shadow-[0_20px_60px_rgba(24,17,10,0.12)] backdrop-blur-sm">
          Ładuję plan treningowy...
        </div>
      </main>
    );
  }

  const plannedWorkout = buildWorkoutForProgress(state.completedSessions);
  const activeRun = state.activeRun;
  const currentStep = getCurrentStep(activeRun);
  const nextStep = activeRun
    ? activeRun.workout.timeline[activeRun.stepIndex + 1] ?? null
    : null;
  const currentTrainingDay = Math.min(state.completedSessions + 1, 36);
  const isRest = activeRun?.phase === "rest";
  const displayStep = isRest ? nextStep ?? currentStep : currentStep;
  const displayCoaching = displayStep?.coaching ?? currentStep?.coaching ?? [];

  const openPlan = () => {
    void unlockAudio();
    setJustCompleted(null);
    startTransition(() => {
      setScreen("plan");
    });
  };

  const startWorkout = () => {
    setJustCompleted(null);
    void unlockAudio();
    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        activeRun: getInitialRun(plannedWorkout),
      };
    });
    startTransition(() => {
      setScreen("session");
    });
  };

  const togglePause = () => {
    void unlockAudio();
    setState((current) => {
      if (!current?.activeRun) {
        return current;
      }

      return {
        ...current,
        activeRun: {
          ...current.activeRun,
          paused: !current.activeRun.paused,
        },
      };
    });
  };

  const abandonSession = () => {
    if (!window.confirm("Przerwać obecną sesję? Postęp dzisiejszego treningu nie zostanie zaliczony.")) {
      return;
    }

    setState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        activeRun: null,
      };
    });
    startTransition(() => {
      setScreen("plan");
    });
  };

  const resetProgress = () => {
    if (!window.confirm("Zresetować cały 12-tygodniowy progres zapisany w telefonie?")) {
      return;
    }

    setJustCompleted(null);
    setState(defaultState);
    startTransition(() => {
      setScreen("welcome");
    });
  };

  const skipRest = () => {
    void unlockAudio();
    setState((current) => {
      if (!current?.activeRun || current.activeRun.phase !== "rest") {
        return current;
      }

      const run = current.activeRun;
      const nextIndex = run.stepIndex + 1;

      if (nextIndex >= run.workout.timeline.length) {
        finishedWorkoutRef.current = run.workout;

        return {
          ...current,
          completedSessions: current.completedSessions + 1,
          completedWorkoutKeys: [...current.completedWorkoutKeys, run.workout.key],
          lastCompletedAt: new Date().toISOString(),
          activeRun: null,
        };
      }

      const nextStep = run.workout.timeline[nextIndex];

      return {
        ...current,
        activeRun: {
          ...run,
          stepIndex: nextIndex,
          phase: "work",
          secondsLeft: nextStep.workSeconds,
          stepDuration: nextStep.workSeconds,
          paused: false,
        },
      };
    });
  };

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-97.5 flex-col px-4 py-5"
      onPointerDownCapture={() => {
        void unlockAudio();
      }}
      onKeyDownCapture={() => {
        void unlockAudio();
      }}
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-52 bg-[radial-gradient(circle_at_top,rgba(232,166,68,0.35),transparent_58%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-[radial-gradient(circle_at_bottom,rgba(47,111,99,0.18),transparent_60%)]" />

      {screen === "welcome" ? (
        <div className="flex min-h-screen flex-col gap-5 pb-8 ">
          <section className="relative overflow-hidden rounded-[38px] border border-black/10 bg-[linear-gradient(155deg,rgba(255,252,247,0.96),rgba(244,228,206,0.84))] p-4 shadow-[0_30px_90px_rgba(24,17,10,0.16)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-8 top-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(201,92,45,0.18),transparent_68%)]" />
            <div className="pointer-events-none absolute -left-10 bottom-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(47,111,99,0.18),transparent_70%)]" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-(--muted) shadow-[0_8px_22px_rgba(20,18,13,0.06)]">
                  Dzień: {currentTrainingDay}
                </div>
                <h1 className="mt-5 text-center text-[2.7rem] font-semibold leading-[0.9] tracking-[-0.06em] text-(--ink)">
                  Domowy plan na mocniejszą sylwetkę.
                </h1>
              </div>
              
            </div>

            <div className="relative mt-6 rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,247,236,0.72))] p-5 shadow-[0_18px_50px_rgba(20,18,13,0.08)]">
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex rounded-full bg-[rgba(20,18,13,0.06)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                    Dzisiejsza sesja: ~{plannedWorkout.estimatedMinutes} min
                  </div>
                  <p className="mt-3 wrap-break-word text-[1.9rem] font-semibold leading-[0.95] tracking-[-0.05em] text-(--ink)">
                    {plannedWorkout.title}
                  </p>
                  <p className="mt-3 wrap-break-word text-sm leading-6 text-(--muted)">{plannedWorkout.subtitle}</p>
                </div>
                
              </div>
              <div className="mt-4 h-px bg-[linear-gradient(90deg,rgba(20,18,13,0.08),rgba(20,18,13,0.02))]" />
              <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                <span>{plannedWorkout.dayLabel}</span>
                <span>{plannedWorkout.phaseLabel}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={openPlan}
              className="mt-6 w-full rounded-full bg-(--accent) px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(201,92,45,0.36)] transition-transform active:scale-[0.98]"
            >
              Rozpocznij ćwiczenia
            </button>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm">
              <div className="min-w-0 rounded-[26px] border border-black/8 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_14px_36px_rgba(20,18,13,0.06)]">
                <div className="text-[0.7rem] uppercase tracking-[0.18em] text-(--muted)">Ukończone</div>
                <div className="mt-2 wrap-break-word text-lg font-semibold tracking-[-0.05em] text-(--ink)">{state.completedSessions}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-(--muted)">sesji z 36</div>
              </div>
              <div className="min-w-0 rounded-[26px] border border-black/8 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_14px_36px_rgba(20,18,13,0.06)]">
                <div className="text-[0.7rem] uppercase tracking-[0.18em] text-(--muted)">Ostatnia sesja</div>
                <div className="mt-2 wrap-break-word text-lg font-semibold leading-6 text-(--ink)">{formatShortDate(state.lastCompletedAt)}</div>
                <div className="mt-2 wrap-break-word text-xs uppercase tracking-[0.14em] text-(--muted)">następna: {plannedWorkout.dayLabel}</div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {screen === "plan" ? (
        <div className="flex flex-col gap-5 pb-8 pt-2">
          <section className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,243,0.94),rgba(250,239,219,0.82))] p-4 shadow-[0_30px_90px_rgba(24,17,10,0.16)] backdrop-blur-sm">
            <div className="flex flex-col items-center  gap-3">
             
                <div className="flex items-center justify-between w-full">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-(--muted)">
                      {plannedWorkout.displayWeek} • {plannedWorkout.dayLabel}
                    </div>
                  <Badge>{plannedWorkout.phaseLabel}</Badge>
                </div>
                <h1 className="my-4 text-[2rem] font-semibold leading-[0.95] tracking-[-0.05em] text-(--ink)">
                  {plannedWorkout.title}
                </h1>
             
            </div>
            <p className="mt-4 text-sm leading-6 text-center text-(--muted)">{plannedWorkout.overview}</p>

            

            <div className="mt-5 grid grid-cols-1 gap-3">
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.7)] p-3">
                <div className="text-[0.65rem] text-center uppercase tracking-[0.18em] text-(--muted)">Szacowany czas</div>
                <div className="mt-1 text-xl text-center font-semibold text-(--ink)">~{plannedWorkout.estimatedMinutes} min</div>
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.7)] p-3">
                <div className="text-[0.65rem] text-center uppercase tracking-[0.18em] text-(--muted)">Bloki</div>
                <div className="mt-1 text-xl text-center font-semibold text-(--ink)">{plannedWorkout.blocks.length}</div>
              </div>
              <div className="rounded-[22px] bg-[rgba(255,255,255,0.7)] p-3">
                <div className="text-[0.65rem] text-center uppercase tracking-[0.18em] text-(--muted)">Różnorodność</div>
                <div className="mt-1 text-xl text-center font-semibold text-(--ink)">{getExerciseCountLabel(plannedWorkout)}</div>
              </div>
            </div>
          </section>

          {justCompleted ? (
            <SectionCard title="Ukończone przed chwilą">
              <p className="text-lg font-semibold text-(--ink)">Sesja zaliczona: {justCompleted.title}</p>
              <p className="mt-2 text-sm leading-6 text-(--muted)">
                Progres został zapisany w telefonie. Kolejne wejście pokaże następny dzień planu.
              </p>
            </SectionCard>
          ) : null}

          <SectionCard title="Założenia dnia">
            <div className="space-y-3 text-sm leading-6 text-center text-(--muted)">
              {plannedWorkout.summaryPoints.map((item) => (
                <p key={item}>{item}</p>
              ))}
              <p>{plannedWorkout.phaseGoal}</p>
            </div>
          </SectionCard>

          <SectionCard title="Układ treningu">
            <div className="space-y-3">
              {plannedWorkout.blocks.map((block) => (
                <div key={block.title} className="rounded-3xl border border-black/10 bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    
                      <p className="text-base font-semibold text-(--ink)">{block.title}</p>
                    
                    <Badge>{block.rounds} rundy</Badge>
                  </div>
                      <p className="mb-3 mt-1 text-sm leading-3 text-(--muted)">{block.note}</p>
                  <p className="mt-3 text-sm text-(--ink)">{block.exerciseNames.join(" • ")}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => startTransition(() => setScreen("welcome"))}
              className="rounded-full border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-(--ink)"
            >
              Wróć
            </button>
            <button
              type="button"
              onClick={startWorkout}
              className="rounded-full bg-(--accent) px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(201,92,45,0.36)] transition-transform active:scale-[0.98]"
            >
              Start!
            </button>
          </div>
        </div>
      ) : null}

      {screen === "session" && activeRun && currentStep ? (
        <div className="flex flex-col gap-5 pb-8 pt-2">
          <section
            className={
              isRest
                ? "rounded-[34px] border border-emerald-950/10 bg-[linear-gradient(180deg,rgba(238,250,247,0.98),rgba(204,232,226,0.92))] p-4 shadow-[0_30px_90px_rgba(15,63,58,0.16)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 ease-out"
                : "rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(248,233,206,0.9))] p-4 shadow-[0_30px_90px_rgba(24,17,10,0.16)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 ease-out"
            }
          >
            <div className="flex items-center justify-between text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-(--muted)">
              <span>Dzień {currentTrainingDay} / 36</span>
              <span>
                Krok {activeRun.stepIndex + 1} / {activeRun.workout.timeline.length}
              </span>
            </div>

            <div key={`${activeRun.phase}-${activeRun.stepIndex}`} className="session-phase-panel">
              {isRest ? (
                <>
                <div className="mt-5 flex flex-col items-center gap-4 rounded-[30px] border border-emerald-950/8 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <div className="shrink-0">
                    <TimerRing progress={getProgressPercent(activeRun)} size={7.4} innerTone="bg-[rgba(245,255,252,0.94)]">
                      <div className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-emerald-900/60">Przerwa</div>
                      <div className="mt-1 text-4xl font-semibold tracking-[-0.08em] text-emerald-950">{activeRun.secondsLeft}</div>
                      <div className="mt-1 text-[0.68rem] text-emerald-900/60">{formatDuration(activeRun.stepDuration)}</div>
                    </TimerRing>
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-[0.72rem] font-semibold uppercase text-center tracking-[0.22em] text-emerald-900/60">Za chwilę</p>
                    <h1 className="mt-2 text-[2rem] text-center font-semibold leading-[0.92] tracking-[-0.05em] text-emerald-950 transition-transform duration-300 ease-out">
                      {displayStep?.name}
                    </h1>
                    {displayStep ? <p className="mt-3 text-[0.98rem] leading-6 text-center text-emerald-950/76">{displayStep.details}</p> : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  <div className="rounded-[30px] border border-emerald-950/10 bg-[rgba(245,255,252,0.78)] p-4">
                    <h2 className="text-[0.72rem] text-center font-semibold uppercase tracking-[0.22em] text-emerald-900/60">Wskazówki na start</h2>
                    <div className="mt-3 space-y-2 text-center text-[0.96rem] leading-6 text-emerald-950/78">
                      {displayCoaching.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div className=" w-full  rounded-[28px] border border-emerald-950/10 bg-white/50 p-3">
                    <AnimatedMotion
                      motion={displayStep?.motion ?? currentStep.motion}
                      phase={activeRun.phase}
                      exerciseId={displayStep?.exerciseId ?? currentStep.exerciseId}
                    />
                  </div>
                </div>
                </>
              ) : (
                <>
                <div className="mt-5 flex justify-center">
                  <TimerRing progress={getProgressPercent(activeRun)} size={11.4}>
                    <div className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-(--muted)">Praca</div>
                    <div className="mt-1 text-6xl font-semibold tracking-[-0.09em] text-(--ink)">{activeRun.secondsLeft}</div>
                    <div className="mt-1 text-xs text-(--muted)">{formatDuration(activeRun.stepDuration)}</div>
                  </TimerRing>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-(--muted)">Teraz</p>
                  <h1 className="mt-2 text-[1.75rem] font-semibold leading-[0.95] tracking-[-0.05em] text-(--ink)">{currentStep.name}</h1>
                  <p className="mx-auto mt-3 max-w-[18rem] text-[0.9rem] leading-5 text-(--muted)">{currentStep.details}</p>
                </div>

                <div className="mx-auto mt-5 w-full max-w-60 rounded-[28px] border border-black/8 bg-white/42 p-3">
                  <AnimatedMotion motion={currentStep.motion} phase={activeRun.phase} exerciseId={currentStep.exerciseId} />
                </div>
                </>
              )}
            </div>
          </section>

          {!isRest ? (
            <SectionCard title="Instrukcja ruchu">
              <div className="space-y-2 text-sm leading-6 text-(--muted)">
                {displayCoaching.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={activeRun.phase === "rest" ? skipRest : togglePause}
              className={
                activeRun.phase === "rest"
                  ? "rounded-full border border-emerald-950/10 bg-[rgba(245,255,252,0.9)] px-4 py-3 text-sm font-semibold text-emerald-950 transition-colors duration-300 ease-out"
                  : "rounded-full border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-(--ink) transition-colors duration-300 ease-out"
              }
            >
              {activeRun.phase === "rest" ? "Pomiń przerwę" : activeRun.paused ? "Wznów" : "Pauza"}
            </button>
            <button
              type="button"
              onClick={abandonSession}
              className="rounded-full bg-(--accent-dark) px-4 py-3 text-sm font-semibold text-white"
            >
              Zakończ bez zapisu
            </button>
          </div>
        </div>
      ) : null}

      <footer className="mt-auto px-1 pb-3 pt-2 text-center text-[0.72rem] uppercase tracking-[0.18em] text-(--muted)">
        {state.completedSessions} / 36 dni treningowych ukończone • progres zapisany lokalnie
        <button type="button" onClick={resetProgress} className="ml-2 underline underline-offset-4">
          reset
        </button>
      </footer>
    </main>
  );
}