# Planning rules

`POST /plans/evaluate` checks each month of each lot against the lot's typical climate and the crop's ranges from the [catalog](catalog.md).

## Climate of a lot

- Monthly climatology from NASA POWER (temperature, minimum and maximum temperature, humidity, rain and sunlight).
- NASA POWER cells are about 50 km wide, so the temperature is adjusted to the real lot elevation (NASADEM) with a lapse rate of 6.5 °C per 1,000 m.
- This is the typical climate of past years, not a forecast.

## Alarms

| Alarm | Level | When |
|---|---|---|
| Frost | Risk | The month's typical minimum temperature is below 2 °C. |
| Temperature | Risk | The month's mean temperature is outside the crop's temperature range. |
| Drought | Risk | The lot has no irrigation and the month's rain is below the crop's minimum water need. |
| Irrigation | Watch | The lot has irrigation and the month's rain is below the crop's minimum water need. |
| Excess water | Watch | The month's rain is above the crop's maximum water need. |
| Pests and diseases | Watch | The month's mean temperature or humidity is outside the crop's range. One alarm per pest of the crop's family. |

Water need is given per crop cycle and spread evenly over the days of the cycle. A missing range limit means no limit.

A month is `risk` when it has a risk alarm, `watch` when it has any other alarm and `ok` otherwise.

## Rotation warnings

| Warning | When |
|---|---|
| `sameFamilyInARow` | Two crops of the same family follow each other. |
| `shorterThanReference` | A crop block is shorter than the crop's reference cycle. |
| `altitudeOutOfRange` | The lot elevation is outside the crop's altitude range. |

## Recommended rotation

For each block, the recommendation scores every crop and picks the best one:

1. Crops that grow at the lot's elevation come first.
2. Among them, the highest score wins.
3. If waiting up to 3 months improves the climate fit, the sowing is delayed.

| Factor | Points |
|---|---|
| Different family from the previous crop | +3 |
| Same family as the previous crop | −5 |
| Different main nutrient | +1 |
| Same main nutrient | −2 |
| Rest after a demanding crop | +1 |
| Demanding crop after another demanding crop | −1 |
| Climate fit | up to +4, in proportion to the months without risk |
| Each month with pest alarms | −0.5 |
