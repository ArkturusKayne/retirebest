import {
    getBuildUpTableNowUntilRetirement,
    getBuildUpTableFromRetirementOnwards,
    getBuildUpTableFromRetirementOnwardsGoalSeek,
    getBuildUpTableProvidentFundNowUntilRetirement,
  } from "public/build-up-tables.js";
  import * as WithProfitRateValues from "public/with-profit-rates.js";
  import * as longTermRealReturnOfNett from "backend/long-term-real-return-of-nett.json";
  import * as yieldCurveAdjust from "backend/yield-curve-adjust.json";
  
  export async function dataCalculation({
    rates,
    initialFormValues,
    cashPayoutRetirement,
    monthlyIncome,
    cashPayoutDeath,
    lovedOneIncome,
    annuityIncomeSwitch,
    annuityType,
    annuityIncomeUntilAge,
    totalSavingsNow,
    totalAnnualContributionsNow,
    providentSavingsNow,
    providentAnnualContributionsNow,
    providentSavingsAtRetirementAge,
    maximumCashLumpSum,
    minimumMonthlyIncome,
    maximumMonthlyIncome,
    lovedOneAgeAtRetirement,
    lumpSumCashPaymentSliderValue,
    monthlyRetirementIncomeSliderValue,
    lovedOneMonthlyIncomeValue,
    annuityIncomeUntilAgeElement,
    chartElementBlock,
    yearsToRetirement = 0,
    lovedOneIncomeCheck = true,
    drawdownArray = [
      0.025, 0.026, 0.027, 0.028, 0.029, 0.03, 0.031, 0.032, 0.033, 0.034,
      0.035,
    ],
    assumptionPercentage = 0.035,
    livingAnnuityDrawdownHybrid = 0,
    livingAnnuityDrawdown = 0.35,
    savingsAtRetirement = 0,
    cashAtRetirement = 0,
    totalSavingsToBeAnnuitised = 0,
    maximumLovedOnePercentage = 0,
    maximumLovedOneIncome = 0,
    lovedOneMonthlyIncomeAfterDeath = 0,
    livingAnnuityMaximum = 0,
    livingAnnuityMinimum = 0,
    livingAnnuityInvestment = 0,
    withProfitAnnuityInvestment = 0,
    spouseAnnualIncome = 0,
    replacementRatio = 0,
    monthlyWithProfitIncome = 0
  }, updateText = true) {
      totalSavingsNow =
        (isNaN(parseInt(initialFormValues.annuitySavings)) ? 0 : parseInt(initialFormValues.annuitySavings)) +
        (isNaN(parseInt(initialFormValues.pensionSavings)) ? 0 : parseInt(initialFormValues.pensionSavings)) +
        (isNaN(parseInt(initialFormValues.providentFundSavings)) ? 0 : parseInt(initialFormValues.providentFundSavings));
      totalAnnualContributionsNow =
        ((isNaN(parseInt(initialFormValues.retirementAnnuityContribution)) ? 0 : parseInt(initialFormValues.retirementAnnuityContribution)) +
          (isNaN(parseInt(initialFormValues.pensionContribution)) ? 0 : parseInt(initialFormValues.pensionContribution)) +
          (isNaN(parseInt(initialFormValues.providentFundContribution)) ? 0 : parseInt(initialFormValues.providentFundContribution))) *
        12;
      isNaN(providentSavingsNow = parseInt(initialFormValues.providentFundSavings)) ? 0 : parseInt(initialFormValues.providentFundSavings);
      providentAnnualContributionsNow =
        isNaN(parseInt(initialFormValues.providentFundContribution)) ? 0 : parseInt(initialFormValues.providentFundContribution) * 12;
  
      const providentFundBuildUpUntil =
        getBuildUpTableProvidentFundNowUntilRetirement(
          initialFormValues.annuityAge,
          providentSavingsNow,
          providentSavingsNow * longTermRealReturnOfNett.rate,
          longTermRealReturnOfNett.rate,
          providentAnnualContributionsNow
        );
  
      providentSavingsAtRetirementAge = providentFundBuildUpUntil.find(
        (entry) => entry.age == parseInt(initialFormValues.annuityCashPayoutAge)
      );
  
      if (!initialFormValues.annuityCashPayoutAge) {
        initialFormValues.annuityCashPayoutAge = "65";
      }
  
      yearsToRetirement =
        parseInt(initialFormValues.annuityCashPayoutAge) -
        parseInt(initialFormValues.annuityAge);
  
      lovedOneIncomeCheck = true;
      if (
        initialFormValues.annuityPartnerPayout != "will be" ||
        !annuityIncomeSwitch
      ) {
        lovedOneIncomeCheck = false;
      }
  
      lovedOneIncome = lovedOneIncomeCheck ? lovedOneIncome : 0;
  
      livingAnnuityDrawdownHybrid =
        0.035 - Math.max(0, cashPayoutDeath - 100) * 0.001;
  
      console.log("Cash Payout at Retirement %", cashPayoutRetirement);
      console.log("Monthly Income %", monthlyIncome);
      console.log("Cash Payout at Death %", cashPayoutDeath);
      console.log("Loved ones monthly income %", lovedOneIncome);
  
      if (!annuityIncomeSwitch) {
        livingAnnuityDrawdown =
          0.035 +
          0.14 * ((100 - Math.min(cashPayoutDeath,100)) / 100);
      } else {
        livingAnnuityDrawdown = livingAnnuityDrawdownHybrid;
      }
  
      if (monthlyIncome <= 10 && annuityIncomeSwitch) {
        livingAnnuityDrawdown = drawdownArray[monthlyIncome];
      }
  
      const buildUpUntil = getBuildUpTableNowUntilRetirement(
        parseInt(initialFormValues.annuityAge),
        totalSavingsNow,
        totalSavingsNow * longTermRealReturnOfNett.rate,
        longTermRealReturnOfNett.rate,
        totalAnnualContributionsNow
      );
  
      if (buildUpUntil.length > 0) {
        savingsAtRetirement = parseInt(
          buildUpUntil.find((entry) => {
            return (
              parseInt(entry.age) ===
              parseInt(initialFormValues.annuityCashPayoutAge)
            );
          }).openingBalance
        );
      }
  
      maximumCashLumpSum =
        savingsAtRetirement <= 247500
          ? savingsAtRetirement
          : (savingsAtRetirement -
              providentSavingsAtRetirementAge.openingBalance) /
              3 +
            providentSavingsAtRetirementAge.openingBalance;
  
      cashAtRetirement =
        parseInt(maximumCashLumpSum) * (Math.min(cashPayoutRetirement, 100) / 100);
  
      totalSavingsToBeAnnuitised = savingsAtRetirement - cashAtRetirement;
  
      maximumLovedOnePercentage = lovedOneIncomeCheck ? 1 : 0;
  
      // Living Annuity Values
  
      // With Profit Calc
  
      let singleLifeRates = await WithProfitRateValues.getLifeValues(
        parseInt(initialFormValues.annuityCashPayoutAge),
        initialFormValues.annuityGender.toLowerCase(),
        lovedOneAgeAtRetirement,
        0,
        rates
      );
  
      let jointLifeRatesMaximum = await WithProfitRateValues.getLifeValues(
        parseInt(initialFormValues.annuityCashPayoutAge),
        initialFormValues.annuityGender.toLowerCase(),
        lovedOneAgeAtRetirement,
        100,
        rates
      );
  
      let jointLifeRatesCurrent = await WithProfitRateValues.getLifeValues(
        parseInt(initialFormValues.annuityCashPayoutAge),
        initialFormValues.annuityGender.toLowerCase(),
        lovedOneAgeAtRetirement,
        annuityIncomeSwitch ? lovedOneIncome : 100,
        rates
      );
  
      let jointLifeHundredReplacement = jointLifeRatesCurrent.outputRate;
      let jointLifeHundredReplacementMax = jointLifeRatesMaximum.outputRate;
  
      maximumLovedOneIncome = annuityIncomeSwitch
        ? (totalSavingsToBeAnnuitised * jointLifeHundredReplacementMax) / 12
        : 0;
  
      lovedOneMonthlyIncomeAfterDeath = maximumLovedOneIncome * (parseInt(lovedOneIncome) / 100);
  
      if (
        initialFormValues.annuityPartnerPayout == "will not be" ||
        !annuityIncomeSwitch
      ) {
        livingAnnuityMaximum = totalSavingsToBeAnnuitised;
      } else if (initialFormValues.annuityPartnerPayout == "will be") {
        livingAnnuityMaximum =
        totalSavingsToBeAnnuitised -
        (parseInt(lovedOneMonthlyIncomeAfterDeath) /
        parseInt(maximumLovedOneIncome)) *
        parseInt(totalSavingsToBeAnnuitised);
      }
      
      livingAnnuityMinimum = annuityIncomeSwitch ? 0 : livingAnnuityMaximum;
  
      livingAnnuityInvestment =
        livingAnnuityMinimum +
        ((livingAnnuityMaximum - livingAnnuityMinimum) * (Math.min(cashPayoutDeath, 100) / 100));
  
      withProfitAnnuityInvestment =
        totalSavingsToBeAnnuitised - livingAnnuityInvestment;
      spouseAnnualIncome = 0;
  
      if(!annuityIncomeSwitch || lovedOneIncome == 0 || initialFormValues.annuityPartnerPayout != "will be") {
        spouseAnnualIncome = (totalSavingsToBeAnnuitised * jointLifeHundredReplacement) / 12;
      } else {
        spouseAnnualIncome = lovedOneMonthlyIncomeAfterDeath * 12
      }
  
      let jointLifeRatesGoalSeek = 0;
      let jointLifeRatesCurrentTest = null;
      
      ////////////////////////////////////////////////////////////////////
      for (let index = 0; index < 1000; index++) {
        let firstLifeIncome = (spouseAnnualIncome * 100) / index;
        let hundredReplacementRate = 0;
        if (!annuityIncomeSwitch || withProfitAnnuityInvestment == 0) {
          hundredReplacementRate = jointLifeHundredReplacement;
        } else {
          hundredReplacementRate =
          firstLifeIncome / withProfitAnnuityInvestment;
        }
        
        jointLifeRatesCurrentTest = WithProfitRateValues.getLifeValues(
          parseInt(initialFormValues.annuityCashPayoutAge),
          initialFormValues.annuityGender.toLowerCase(),
          parseInt(initialFormValues.annuityPartnerAge) +
          parseInt(yearsToRetirement),
          index,
          rates
          );
          
          replacementRatio =
          hundredReplacementRate / jointLifeRatesCurrentTest.outputRate;
          
          jointLifeRatesCurrent = jointLifeRatesCurrentTest;
          if (parseFloat(replacementRatio.toFixed(2)) === 1 || parseFloat(replacementRatio.toFixed(2)) <= 0.99) {
            console.log('%c ZXC replacementRatio','color: green', replacementRatio);    
            break;
          }
        }
        
        console.log('%c ZXC buildUpGoalSeek','color: red', jointLifeRatesCurrent);
      
  ////////////////////////////////////////////////////////////////////
  
      const buildUpOnwards = getBuildUpTableFromRetirementOnwards(
        initialFormValues.annuityCashPayoutAge,
        livingAnnuityInvestment,
        // livingAnnuityInvestment * longTermRealReturnOfNett.rate,
        livingAnnuityInvestment * longTermRealReturnOfNett.rate,
        longTermRealReturnOfNett.rate,
        livingAnnuityInvestment * livingAnnuityDrawdown
      );
  
      let withProfitSingleLifeAnnuityRate =
        singleLifeRates.firstLifeRate * yieldCurveAdjust.rate;
  
      monthlyWithProfitIncome = 0;
  
      if (
        lovedOneIncome == 0 ||
        initialFormValues.annuityPartnerPayout != "will be"
      ) {
        monthlyWithProfitIncome =
          (withProfitAnnuityInvestment * withProfitSingleLifeAnnuityRate) / 12;
      } else {
        monthlyWithProfitIncome =
          (withProfitAnnuityInvestment * jointLifeRatesCurrent.outputRate) / 12;
      }
  
      if (!annuityIncomeSwitch) {
        minimumMonthlyIncome =
          (1 - livingAnnuityDrawdown + 0.035) *
          ((0.025 * totalSavingsToBeAnnuitised) / 12);
      } else {
        minimumMonthlyIncome =
          (monthlyIncome / 110 * 100) === 100
            ? monthlyWithProfitIncome
            : (totalSavingsToBeAnnuitised * 0.025) / 12;
      }
  
      if (!annuityIncomeSwitch) {
        maximumMonthlyIncome =
          (1 - livingAnnuityDrawdown + 0.035) *
          ((0.175 * totalSavingsToBeAnnuitised) / 12);
      } else {
        maximumMonthlyIncome =
          monthlyIncome >= 100
            ? monthlyWithProfitIncome
            : (totalSavingsToBeAnnuitised * 0.175) / 12;
      }
  
      let monthlyWithProfitIncomeMax =
        (withProfitAnnuityInvestment * withProfitSingleLifeAnnuityRate) / 12;
  
      let monthlyLivingAnnuityIncome =
        (livingAnnuityInvestment * livingAnnuityDrawdown) / 12;
      let yourStartingIncomeAtRetirement =
        monthlyWithProfitIncome + monthlyLivingAnnuityIncome;
      let yourStartingIncomeAtRetirementMax =
        monthlyWithProfitIncomeMax +
        (livingAnnuityMaximum * livingAnnuityDrawdown) / 12;
      // Comes as a percentage of the slider
  
      // Get Living Annuity Rates
      let livingAnnuityGrowth =
        livingAnnuityInvestment * longTermRealReturnOfNett.rate;
      let livingAnnuityIncome = livingAnnuityInvestment * livingAnnuityDrawdown;
  
      let livingAnnuityRates = getLivingAnnuityRates(
        livingAnnuityInvestment,
        livingAnnuityGrowth,
        livingAnnuityIncome
      );
  
      // Charts
  
      let filteredRates = buildUpOnwards.filter((rate) => {
        return rate.age % 5 == 0;
      });
  
      let data = filteredRates.slice(0, 7);
  
      let balancesArray = data.map((value) => parseInt(value.openingBalance));
  
      let chartData = {
        cashPayoutDeath: data,
        cashPayoutDeathMax: Math.max(...balancesArray),
        monthlyIncome: monthlyIncome,
      };
  
      updateCharts(chartData, chartElementBlock);
  
      const buildUpGoalSeek = getBuildUpTableFromRetirementOnwardsGoalSeek(
        initialFormValues.annuityCashPayoutAge,
        totalSavingsToBeAnnuitised,
        totalSavingsToBeAnnuitised * longTermRealReturnOfNett.rate,
        longTermRealReturnOfNett.rate,
        livingAnnuityInvestment * livingAnnuityDrawdown
      );
  
      
      if (!annuityIncomeSwitch && buildUpGoalSeek) {
        let goalSeekAge = buildUpGoalSeek.toString();
        if (parseInt(goalSeekAge) > 100 || !goalSeekAge) {
          goalSeekAge = "100+";
        }
        annuityIncomeUntilAge = goalSeekAge;
  
        // let newIncomeValue = buildUpGoalSeek[0].income / 12;
        // updateMonthlyIncomeSlider(newIncomeValue, yourStartingIncomeAtRetirementMax);
        annuityIncomeUntilAgeElement.value = annuityIncomeUntilAge;
      }
  
      console.log(
        "%c CalculationEngine:: Maximum Cash Lump Sum",
        "color: #fc8803;",
        maximumCashLumpSum
      );
      console.log(
        "%c CalculationEngine:: Total Savings to be Annuitised",
        "color: #fc8803;",
        totalSavingsToBeAnnuitised
      );
      console.log(
        "%c CalculationEngine:: Joint Life 100% Replacement",
        "color: #fc8803;",
        jointLifeHundredReplacementMax
      );
      console.log(
        "%c CalculationEngine:: Maximum Loved One Income",
        "color: #fc8803;",
        maximumLovedOneIncome
      );
      console.log(
        "%c CalculationEngine:: Living Annuity Drawdown",
        "color: #fc8803;",
        livingAnnuityDrawdown
      );
      console.log(
        "%c CalculationEngine:: Living Annuity Investment",
        "color: #fc8803;",
        livingAnnuityInvestment
      );
      console.log(
        "%c CalculationEngine:: With Profit Annuity Investment",
        "color: #fc8803;",
        withProfitAnnuityInvestment
      );
      console.log(
        "%c CalculationEngine:: WP Single Life Annuity Rate",
        "color: #fc8803;",
        withProfitSingleLifeAnnuityRate
      );
      console.log(
        "%c CalculationEngine:: WP Joint Life Annuity Rate",
        "color: #fc8803;",
        jointLifeRatesCurrent
      );
      console.log(
        "%c CalculationEngine:: Monthly With Profit Income",
        "color: #fc8803;",
        monthlyWithProfitIncome
      );
      console.log(
        "%c CalculationEngine:: Living Annuity Drawdown",
        "color: #fc8803;",
        livingAnnuityDrawdown
      );
      console.log(
        "%c CalculationEngine:: Monthly Living Annuity Income",
        "color: #fc8803;",
        monthlyLivingAnnuityIncome
      );
      console.log(
        "%c CalculationEngine:: Your Starting Income @ Retirement",
        "color: #fc8803;",
        yourStartingIncomeAtRetirement
      );
      console.log(
        "%c CalculationEngine:: Minimum Monthly Income",
        "color: #fc8803;",
        minimumMonthlyIncome
      );
      console.log(
        "%c CalculationEngine:: Maximum Monthly Income",
        "color: #fc8803;",
        maximumMonthlyIncome
      );
      console.log(
        "%c Cash Payout on Death",
        "color: #fc8803;",
        cashPayoutDeath
      );
      console.log(
        "%c CalculationEngine:: Maximum Monthly Income",
        "color: #fc8803;",
        maximumMonthlyIncome
      );
      console.log("Build up table until retirement");
      console.table(buildUpUntil);
      console.log("Build up table from retirement onwards");
      console.table(buildUpOnwards);
      console.log("Build up table from retirement goal seek");
      console.table(buildUpGoalSeek);
      console.log("Build up table provident fund until retirement");
      console.table(providentFundBuildUpUntil);
  
      if(updateText) {
        let monthlyIncomeMaxAmount = maximumMonthlyIncome = Math.round(maximumMonthlyIncome / 500) * 500;
        let monthlyIncomeMinAmount = minimumMonthlyIncome = Math.round(minimumMonthlyIncome / 500) * 500;
        let selectedMonthlyIncome = Math.round(((livingAnnuityInvestment * livingAnnuityDrawdown) / 12 + monthlyWithProfitIncome) / 500) * 500;
  
          if ($w("#dynamicIncomeTextUntilAge")) {
            if(monthlyRetirementIncomeSliderValue.text) {
    
              $w("#dynamicIncomeTextUntilAge").text = `You have chosen a monthly income of R${Math.floor(selectedMonthlyIncome).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} which is sustainable until age ${buildUpGoalSeek}.
                Once every year you have the option to:
                - Leave your monthly income unchanged
                - Increase your monthly income, to a maximum of approximately R${monthlyIncomeMaxAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} per month
                - Decrease your monthly income, to a minimum of approximately R${monthlyIncomeMinAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} per month
                `;
            }
        }
        // - Increase your monthly income, to a maximum of approximately R${(totalSavingsToBeAnnuitised * (1 - livingAnnuityDrawdown + 0.035) * 0.175 / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} per month
        //         - Decrease your monthly income, to a minimum of approximately R${(totalSavingsToBeAnnuitised * (1 - livingAnnuityDrawdown + 0.035) * 0.025 / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} per month
  
          if ($w("#dynamicIncomeText")) {
            let monthlyIncomeOne = (livingAnnuityInvestment * livingAnnuityDrawdown) / 12 + monthlyWithProfitIncome;
            monthlyIncomeOne = monthlyIncomeOne = Math.round(monthlyIncomeOne / 500) * 500;
            let monthlyIncomeTwo = (livingAnnuityInvestment * livingAnnuityDrawdown) / 12 + monthlyWithProfitIncome;
            monthlyIncomeTwo = monthlyIncomeTwo = Math.round(monthlyIncomeTwo / 500) * 500;
            let monthlyIncomeMaxTwo = ((totalSavingsToBeAnnuitised * 0.175) / 12);
            let monthlyIncomeMinTwo = ((totalSavingsToBeAnnuitised * 0.025) / 12);
            monthlyIncomeMaxTwo = monthlyIncomeMaxTwo = Math.round(monthlyIncomeMaxTwo / 500) * 500;
            monthlyIncomeMinTwo = monthlyIncomeMinTwo = Math.round(monthlyIncomeMinTwo / 500) * 500;
  
            if(monthlyIncome == 110) {
              $w("#dynamicIncomeText").text = `You have chosen a monthly income of R${Math.floor(monthlyIncomeOne).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} which is sustainable for the rest of your life. You do not have the flexibility to change your monthly income in the future.`;
              } else {
                $w("#dynamicIncomeText").text = `You have chosen a monthly income of R${Math.floor(monthlyIncomeTwo).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} which is sustainable for the rest of your life.
                            Once every year you have the option to:
                            - Leave your monthly income unchanged
                            - Increase your monthly income, to a maximum of approximately R${monthlyIncomeMaxTwo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} per month
                            - Decrease your monthly income, to a minimum of approximately R${monthlyIncomeMinTwo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} per month
                            `;
          }
        }
      }
  
      return {
        rates,
    initialFormValues,
    cashPayoutRetirement,
    monthlyIncome,
    cashPayoutDeath,
    lovedOneIncome,
    annuityIncomeSwitch,
    annuityType,
    annuityIncomeUntilAge,
    totalSavingsNow,
    totalAnnualContributionsNow,
    providentSavingsNow,
    providentAnnualContributionsNow,
    providentSavingsAtRetirementAge,
    maximumCashLumpSum,
    minimumMonthlyIncome,
    maximumMonthlyIncome,
    lovedOneAgeAtRetirement,
    lumpSumCashPaymentSliderValue,
    monthlyRetirementIncomeSliderValue,
    lovedOneMonthlyIncomeValue,
    annuityIncomeUntilAgeElement,
    chartElementBlock,
    yearsToRetirement,
    lovedOneIncomeCheck,
    drawdownArray,
    assumptionPercentage,
    livingAnnuityDrawdownHybrid,
    livingAnnuityDrawdown,
    savingsAtRetirement,
    cashAtRetirement,
    totalSavingsToBeAnnuitised,
    maximumLovedOnePercentage,
    maximumLovedOneIncome,
    lovedOneMonthlyIncomeAfterDeath,
    livingAnnuityMaximum,
    livingAnnuityMinimum,
    livingAnnuityInvestment,
    withProfitAnnuityInvestment,
    spouseAnnualIncome,
    replacementRatio,
    monthlyWithProfitIncome
      };
  }
  
  function getLivingAnnuityRates(livingAnnuityInvestment, growth, income) {
    let startingAge = 65;
    let ratesArray = [];
    let openingBalance = parseInt(livingAnnuityInvestment);
    let tempIncome = -income;
  
    ratesArray.push({
      age: startingAge,
      openingBalance: openingBalance.toFixed(3),
      growth: growth.toFixed(3),
      income: tempIncome.toFixed(3),
    });
  
    for (let index = 0; index < 30; index++) {
      openingBalance = Math.max(openingBalance + growth + tempIncome);
      growth = openingBalance * longTermRealReturnOfNett.rate;
  
      if (openingBalance + growth <= 50000) {
        let i = -tempIncome;
        let b = growth + openingBalance;
        tempIncome = Math.min(b, i) * -1;
      } else {
        let i = -tempIncome;
        let b = openingBalance * 0.175;
        tempIncome = Math.min(i, b) * -1;
      }
  
      ratesArray.push({
        age: startingAge + index + 1,
        openingBalance: openingBalance.toFixed(3),
        growth: growth.toFixed(3),
        income: tempIncome.toFixed(3),
      });
    }
  
    return ratesArray;
  }
  
  function updateCharts(chartData, chartElementBlock) {
    chartElementBlock.postMessage({
      message: "updateCharts",
      payload: chartData,
    });
  }
  