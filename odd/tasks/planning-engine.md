# Planning engine and calendar
Objective: per-lot plan (harvest date, next crops, monthly status and alerts) from the three axes, shown in a redesigned calendar.
Branches: api feature/planning-engine (from feature/catalog-focus-crops); web feature/calendar (from feature/crops-step-ui). Delivery: local commits only. Tests: vitest.

## Specs
- S1: "quiero que temrine el prototipo en local" — complete local flow up to the calendar.
- S2: three axes "rotacion de nutrientes, factores climaticos y plagas": rotation (no same family consecutively, no same dominant nutrient, high demand followed by lower demand), climate (crop ranges vs lot climate corrected to lot elevation), pests (months where climate falls in the pest ranges for the crop family).
- S3: "si por ejemplo toca sembrar un prducto pero ese producnto no va a cumplir cosas entonces recomendar riego o asi" — water deficit -> irrigation recommendation; frost -> risk; out of range -> other crop.
- S4: cycle from catalog: harvest estimate from planting month + cycle length; farmer judgment remains (estimates).
- S5: "el calendarios dle prototipo esta muy feo hay que mejorarlo" — redesigned calendar keeping: "se pindtaba por dias con rojo, verde o amarillo", "ve ren el mismo calendario los N lotes", scalable "15 o 20", "alarmas por orden de prieorida", "que se vea las fechas apra ver los demas meses".
- S6: "el tema de intereses lo descartemos" — no plan types or priorities.

- S7: "necesito mejorar botones tambien en toda la app, ya esta super bien pero alguno son un texto muy basico como Volver a marcar la finca, etc" — text-only buttons become real buttons with icon and shape; destructive actions styled as such.
- S8: "iugla el tema de dividir funciona super bien pero se podria mejorar"

## Tasks
- T1 [S2-S4] API domain rules: harvest month, monthly status/alerts, recommendation scoring with reasons — route: inline — status: in progress
- T2 [S1-S4] API POST /plans using catalog + lot climate profiles — route: inline — status: pending
- T3 [S5, S6] Web calendar step (day grid colored by status, lots rows, alarms by priority, month navigation) — route: inline — status: pending
- T4 [S7] Button system across the web app — route: inline — status: pending
- T6 [S8] Better split: strips aligned to the farm's long axis and a grid option — route: inline — status: pending
- T5 [S1] ArcGIS geocoding search, READMEs, final browser pass — route: inline — status: pending

## Log
- L1 (2026-11-14): "ok te cuento voy a dormir pero quiero que temrine el prototipo en local, peudes?" / "si el calendarios dle prototipo esta muy feo hay que mejorarlo , de igual forma necesito que ya el tema de intereses lo descartemos"
- L2 (2026-11-14): "para que usa no se o en descanso ?" — explained: current fallow = lot free now, recommend what to sow; previous fallow = no rotation conflict; previous unknown = skip previous-crop rules and warn.
- L3 (2026-11-14): "necesito mejorar botones tambien en toda la app, ya esta super bien pero alguno son un texto muy basico como Volver a marcar la finca, etc"
- L4 (2026-11-14): "iugla el tema de dividir funciona super bien pero se podria mejorar" — planned: strips aligned to the farm's long axis, grid option.
- L5 (2026-11-14): "la estetica mas intuible en mobile y destop" — covered in the final pass (T5) screen by screen at both sizes.
