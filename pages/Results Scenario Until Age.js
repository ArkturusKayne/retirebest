import { local } from "wix-storage";
import wixData from "wix-data";
import { dataCalculation } from "public/dataCalculation";
import * as GoalSeekAges from "backend/goal-seek-ages.json";

let goalSeekAchieved = false;
let calculationValues = {};

$w.onReady(async function () {
  setTimeout(async () => {
    calculationValues.rates = {};
    calculationValues.initialFormValues = {};
    calculationValues.cashPayoutRetirement = 0;
    calculationValues.monthlyIncome = 0;
    calculationValues.cashPayoutDeath = 0;
    calculationValues.lovedOneIncome = 0;
    calculationValues.annuityIncomeSwitch = false;
    calculationValues.annuityType = "provident";
    calculationValues.annuityIncomeUntilAge = "85";
    calculationValues.totalSavingsNow = 0;
    calculationValues.totalAnnualContributionsNow = 0;
    calculationValues.providentSavingsNow = 0;
    calculationValues.providentAnnualContributionsNow = 0;
    calculationValues.providentSavingsAtRetirementAge = {};
    calculationValues.maximumCashLumpSum = 0;
    calculationValues.minimumMonthlyIncome = 0;
    calculationValues.maximumMonthlyIncome = 0;

    if (local.getItem("annuityCalculationValues")) {
      calculationValues.initialFormValues = JSON.parse(
        local.getItem("annuityCalculationValues")
      );
      console.log("Form Values", calculationValues.initialFormValues);
    } else {
      console.error("No form values found in local storage.");
    }

    if (local.getItem("incomeSliderValue")) {
      calculationValues.monthlyIncome = local.getItem("incomeSliderValue");
      await updateIncomeSlider(calculationValues.monthlyIncome);
    }

    // if(local.getItem("lumpSumSliderValue")) {
    //   calculationValues.cashPayoutDeath = local.getItem("lumpSumSliderValue");
    //   await updateLumpSumSlider(calculationValues.cashPayoutDeath);
    // }

    calculationValues.lovedOneAgeAtRetirement =
      parseInt(calculationValues.initialFormValues.annuityPartnerAge) +
      parseInt(calculationValues.initialFormValues.annuityCashPayoutAge) -
      parseInt(calculationValues.initialFormValues.annuityAge);
    if (calculationValues.lovedOneAgeAtRetirement > 85)
      calculationValues.lovedOneAgeAtRetirement = 85;
    if (calculationValues.lovedOneAgeAtRetirement < 45)
      calculationValues.lovedOneAgeAtRetirement = 40;
    if (!calculationValues.cashPayoutRetirement)
      calculationValues.cashPayoutRetirement = 50;
    if (!calculationValues.monthlyIncome) calculationValues.monthlyIncome = 50;

    calculationValues.lumpSumCashPaymentSliderValue = $w(
      "#lumpSumCashPaymentSliderValue"
    );
    calculationValues.monthlyRetirementIncomeSliderValue = $w(
      "#monthlyRetirementIncomeSliderValue"
    );
    calculationValues.lovedOneMonthlyIncomeValue = false;
    calculationValues.annuityIncomeUntilAgeElement = $w(
      "#annuityIncomeUntilAge"
    );
    calculationValues.chartElementBlock = $w("#chartElementBlock");

    if (!goalSeekAchieved) {
      goalSeekAchieved = true;
      calculationValues.monthlyIncome =
        GoalSeekAges[
          parseInt(calculationValues.initialFormValues.annuityCashPayoutAge)
        ];
      calculationValues.cashPayoutDeath = 110 - calculationValues.monthlyIncome;
      await updateIncomeSlider(calculationValues.monthlyIncome);
    }

    await getRates(calculationValues.rates);

    // Charts
    $w("#chartElementBlock").onMessage(async (event) => {
        console.log('EVENT', event);
      if (event.data) {
        if (event.data.message == "checkValuesInner") {
          calculationValues.cashPayoutDeath = parseInt(
            event.data.payload.cashPayoutDeath
          );
          calculationValues.monthlyIncome =
            110 - parseInt(event.data.payload.cashPayoutDeath);
          updateIncomeSlider(calculationValues.monthlyIncome);
          let calculatedValues = dataCalculation(calculationValues);
          calculatedValues.then((values) => {
            calculationValues = values;
            updateSliderValues(values);
          });
        }
      }
    });
    // Monthly slider
    $w("#monthlyRetirementIncome").onMessage(async (event) => {
      if (event.data) {
        if (event.data.message == "incomeSliderUpdated") {
          local.setItem("incomeSliderValue", event.data.payload.sliderValue);
          calculationValues.monthlyIncome = event.data.payload.sliderValue;
          calculationValues.cashPayoutDeath =
            110 - event.data.payload.sliderValue;
          updateSliderColors(calculationValues.monthlyIncome);
          let calculatedValues = dataCalculation(calculationValues);
          calculatedValues.then((values) => {
            calculationValues = values;
            updateSliderValues(values);
          });
        }
      }
    });
    // Lump Sum slider
    $w("#lumpSumCashPayment").onMessage(async (event) => {
      if (event.data) {
        if (event.data.message == "lumpSumSliderUpdated") {
          local.setItem("lumpSumSliderValue", event.data.payload.sliderValue);
          calculationValues.cashPayoutRetirement =
            event.data.payload.sliderValue;
          let calculatedValues = dataCalculation(calculationValues);
          calculatedValues.then((values) => {
            calculationValues = values;
            updateSliderValues(values);
          });
        }
      }
    });
    let calculatedValues = dataCalculation(calculationValues, false);
    calculatedValues.then((values) => {
      calculationValues = values;
      if(values.maximumCashLumpSum >= 500000) {
        let lumpSumFraction = parseFloat(
          (500000 / values.maximumCashLumpSum).toFixed(2)
        );
        if (lumpSumFraction > 0) {
          values.cashPayoutRetirement = lumpSumFraction * 100;
          updateLumpSumSlider(values.cashPayoutRetirement);
        }
      }
      updateSliderValues(values, false);
    });
    updateSliderColors(calculationValues.monthlyIncome);
  }, 0);
});

function updateSliderValues(values, updateText = true) {
  updateIncomeSlider(values.monthlyIncome);
  updateLumpSumSlider(values.cashPayoutRetirement);
  let calculatedValues = dataCalculation(calculationValues, updateText);
  calculatedValues.then((values) => {
    let lumpSumValue = ((values.cashPayoutRetirement / 100) * values.maximumCashLumpSum);
    let monthlyRetirementValue = (values.livingAnnuityInvestment * values.livingAnnuityDrawdown) / 12 +
    values.monthlyWithProfitIncome;
    if(lumpSumValue > 1000000) {
      lumpSumValue = Math.round(lumpSumValue / 10000) * 10000;
    } else {
      lumpSumValue = Math.round(lumpSumValue / 1000) * 1000;
    }
      monthlyRetirementValue = Math.round(monthlyRetirementValue / 500) * 500;
    if ($w("#lumpSumCashPaymentSliderValue")) {
      $w("#lumpSumCashPaymentSliderValue").text = `R${Math.floor(lumpSumValue)}`
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    if ($w("#monthlyRetirementIncomeSliderValue")) {
      $w("#monthlyRetirementIncomeSliderValue").text = `R${Math.floor(
        monthlyRetirementValue
      )}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      calculationValues = values;
    }
  });
}

function updateIncomeSlider(monthlyIncome) {
  $w("#monthlyRetirementIncome").postMessage({
    message: "updateMonthlyIncomeSlider",
    payload: monthlyIncome,
  });
}

function updateLumpSumSlider(cashPayoutDeath) {
  $w("#lumpSumCashPayment").postMessage({
    message: "updateLumpSumSlider",
    payload: cashPayoutDeath,
  });
}

function updateSliderColors(monthlyIncome) {
  $w("#chartElementBlock").postMessage({
    message: "setSliderColors",
    payload: monthlyIncome,
  });
}

async function getRates(rates) {
  if (rates !== {}) {
    await wixData
      .query("AnnuityRates")
      .ascending("age")
      .limit(1000)
      .find()
      .then((results) => {
        rates.defaultAnnuityRates = results.items;
      });
    await wixData
      .query("SecondLifeZeroIncome")
      .ascending("age")
      .limit(1000)
      .find()
      .then((results) => {
        rates.secondLifeZeroIncomeRates = results.items;
      });
    await wixData
      .query("SecondLifeSeventyIncome")
      .ascending("age")
      .limit(1000)
      .find()
      .then((results) => {
        rates.secondLifeSeventyIncomeRates = results.items;
      });
  } else {
    return;
  }
}
