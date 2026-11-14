# Lot climate profile
Objective: per-lot climate profile from NASA data, altitude-corrected, to feed crop and pest checks.
Branch: feature/lot-climate-profile (from feature/terrain-elevation). Delivery: ask-on-risk. Tests: vitest (unit + e2e).

## Specs
- S1: "vamos con eso" — climate profile of a lot: elevation of the lot from NASADEM over the polygon (mean, min, max).
- S2: monthly climate from NASA POWER (temperature mean/min/max, relative humidity, rain, solar radiation) with the NASA grid elevation.
- S3: "y tomas encunta la altura" — temperatures corrected to the lot elevation with -6.5 C per 1000 m; humidity and rain are not corrected (stated as limitation).
- S4: frost probability per month from daily NASA POWER minimum temperature, corrected by altitude (estimated risk).
- S5: web shows the profile for each lot after marking it.

## Tasks
- T1 [S1-S3] API endpoint POST /lots/climate-profile — route: inline — status: done (unit 16, e2e 6; real lot Tierra Blanca 2176 m mean, correction -7.2 C)
- T2 [S4] frost probability from daily data — route: inline — status: pending
- T3 [S5] web lot climate card — route: inline — status: pending

## Log
- L1 (2026-11-14): "ok vamos con eso aprendamos guarda en emgram" after agreeing on three axes (nutrient rotation, climate factors, pests), altitude-corrected temperature, and recommending actions such as irrigation when a crop's needs are not met.
- L2 (2026-11-14): NASA POWER community AG returns ALLSKY_SFC_SW_DWN in MJ/m2/day; converted to kWh/m2/day (divide by 3.6). Real Tierra Blanca lot: radiation 3.7-5.3 kWh/m2/day, mean temperature 11.9-14.0 C, minimum 5.1-8.1 C.
