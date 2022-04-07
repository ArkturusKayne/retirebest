import * as yieldCurveAdjust from "backend/yield-curve-adjust.json";

const lifeType = "single";
    
function getTrendLine(value) {
    return (-0.0024 * (Math.pow(value,2))) + 
    (1.24 * value);
}

// Single Life

export function getLifeAllValues(age, gender, secondLifeAge, current) {
 let singleLifeRates = getLifeValues(age, gender, secondLifeAge, 0);
 let jointLifeRatesMaximum = getLifeValues(age, gender, secondLifeAge, 100);
 let jointLifeRatesCurrent = getLifeValues(age, gender, secondLifeAge, current);

 return {
    singleLifeRates: singleLifeRates,
    jointLifeRatesMaximum: jointLifeRatesMaximum,
    jointLifeRatesCurrent: jointLifeRatesCurrent
 }
}

export function getLifeValues (age, gender, secondLifeAge, replacementTrendlineRatio, rates) {
    // Rounding ages
    let ageRoundedUp = 5 * (Math.round((age + 2) / 5));
    let ageRoundedDown = 5 * Math.round((age - 2) / 5);
    let secondAgeRoundedUp = 5 * Math.round((secondLifeAge + 2) / 5);
    let secondAgeRoundedDown = 5 * Math.round((secondLifeAge - 2) / 5);
    console.log(`***************Interpolation***************`, 'font-weight: bold');
    console.log(`Interpolation : Ratio %c${(replacementTrendlineRatio * 100).toFixed(2)}%`, 'font-weight: bold');

    console.log(`Interpolation : First Life Age Rounded Up %c${ageRoundedUp}`, 'font-weight: bold');
    console.log(`Interpolation : First Life Age Rounded Down %c${ageRoundedDown}`, 'font-weight: bold');
    console.log(`Interpolation : Second Life Age Rounded Up %c${secondAgeRoundedUp}`, 'font-weight: bold');
    console.log(`Interpolation : Second Life Age Rounded Down %c${secondAgeRoundedDown}`, 'font-weight: bold');

    if (rates.defaultAnnuityRates) {
    // 0% Rate
    let zeroRateUp = rates.defaultAnnuityRates.find((rate) => {
        return (rate.age == ageRoundedUp && rate.gender == gender);
    }).rate;
    let zeroRateDown = rates.defaultAnnuityRates.find((rate) => {
        return (rate.age == ageRoundedDown && rate.gender == gender);
    }).rate;
    // 75% Rate
    let seventyFiveRateRoundUp = rates.secondLifeSeventyIncomeRates.find((rate) => {
        return (rate.age == ageRoundedUp && rate.gender == gender && rate.secondLifeAge == secondAgeRoundedUp)
    }).rate;
    let seventyFiveRateRoundDown = rates.secondLifeSeventyIncomeRates.find((rate) => {
        return (rate.age == ageRoundedDown && rate.gender == gender && rate.secondLifeAge == secondAgeRoundedDown)
    }).rate;
    
    console.log(`Interpolation : 0% Rate 1 %c${(zeroRateUp * 100).toFixed(2)}%`, 'font-weight: bold');
    console.log(`Interpolation : 0% Rate 2 %c${(zeroRateDown * 100).toFixed(2)}%`, 'font-weight: bold');
    console.log(`Interpolation : 75% Rate 1 %c${(seventyFiveRateRoundUp * 100).toFixed(2)}%`, 'font-weight: bold');
    console.log(`Interpolation : 75% Rate 2 %c${(seventyFiveRateRoundDown * 100).toFixed(2)}%`, 'font-weight: bold');

    // Replacement Ratio
    let replacementRatioUp = (zeroRateUp - (zeroRateUp - seventyFiveRateRoundUp) * getTrendLine(replacementTrendlineRatio) / getTrendLine(75));
    let replacementRatioDown = (zeroRateDown - (zeroRateDown - seventyFiveRateRoundDown) * getTrendLine(replacementTrendlineRatio) / getTrendLine(75));
    // Second Life ratio
    let secondLifeRateUp;
    let secondLifeRateDown;

    console.log(`Interpolation : Replacement Ratio 1 %c${(replacementRatioUp * 100).toFixed(2)}%`, 'font-weight: bold');
    console.log(`Interpolation : Replacement Ratio 2 %c${(replacementRatioDown * 100).toFixed(2)}%`, 'font-weight: bold');
    
    if(secondAgeRoundedUp === secondAgeRoundedDown) {
        secondLifeRateUp = replacementRatioUp;
        secondLifeRateDown = replacementRatioDown;
    } else {
        secondLifeRateUp = (replacementRatioDown + 
            (replacementRatioUp - replacementRatioDown) *
            (secondLifeAge - secondAgeRoundedDown) /
            (secondAgeRoundedUp - secondAgeRoundedDown)
            )
            secondLifeRateDown = secondLifeRateUp;
        }
        
    console.log(`Interpolation : Second Life Rate 1 %c${(secondLifeRateUp * 100).toFixed(2)}%`, 'font-weight: bold');
    console.log(`Interpolation : Second Life Rate 2 %c${(secondLifeRateDown * 100).toFixed(2)}%`, 'font-weight: bold');

    let firstLifeRate;

    if(ageRoundedUp === ageRoundedDown) {
        firstLifeRate = secondLifeRateUp;
    } else {
        firstLifeRate = (secondLifeRateDown + 
                        (secondLifeRateUp - secondLifeRateDown) *
                        (age - ageRoundedDown) /
                        (ageRoundedUp - ageRoundedDown));
    }

    console.log(`Interpolation : First Life Rate %c${(firstLifeRate * 100).toFixed(2)}%`, 'font-weight: bold');

    return {
        firstLifeRate: firstLifeRate,
        outputRate: firstLifeRate * yieldCurveAdjust.rate
    }
} else {
    return false
}
}