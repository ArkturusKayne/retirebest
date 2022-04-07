import { local } from "wix-storage";
import wixData from "wix-data";
import { dataCalculation as dataCalculation2 } from "public/dataCalculation";

let calculationValues2 = {};

$w.onReady(async function () {
  setTimeout(async () => {
    calculationValues2.rates = {};
    calculationValues2.initialFormValues = {};
    calculationValues2.cashPayoutRetirement = 0;
    calculationValues2.monthlyIncome = 0;
    calculationValues2.cashPayoutDeath = 0;
    calculationValues2.lovedOneIncome = 0;
    calculationValues2.annuityIncomeSwitch = true;
    calculationValues2.annuityType = "provident";
    calculationValues2.annuityIncomeUntilAge = "85";
    calculationValues2.totalSavingsNow = 0;
    calculationValues2.totalAnnualContributionsNow = 0;
    calculationValues2.providentSavingsNow = 0;
    calculationValues2.providentAnnualContributionsNow = 0;
    calculationValues2.providentSavingsAtRetirementAge = {};
    calculationValues2.maximumCashLumpSum = 0;
    calculationValues2.minimumMonthlyIncome = 0;
    calculationValues2.maximumMonthlyIncome = 0;

    if (local.getItem("annuityCalculationValues")) {
      calculationValues2.initialFormValues = JSON.parse(
        local.getItem("annuityCalculationValues")
      );
      console.log("Form Values", calculationValues2.initialFormValues);
    } else {
      console.error("No form values found in local storage.");
    }

    if (local.getItem("incomeSliderValue")) {
      calculationValues2.monthlyIncome = local.getItem("incomeSliderValue");
      await updateIncomeSlider2(calculationValues2.monthlyIncome);
    }

    if (local.getItem("lumpSumSliderValue")) {
      calculationValues2.cashPayoutRetirement = local.getItem("lumpSumSliderValue");
      await updateLumpSumSlider2(calculationValues2.cashPayoutRetirement);
    }

    if (local.getItem("lovedOneSliderValue")) {
      calculationValues2.lovedOneIncome = local.getItem("lovedOneSliderValue");
      await updateLovedOneMonthlySlider(calculationValues2.lovedOneIncome);
    }

    calculationValues2.lovedOneAgeAtRetirement =
      parseInt(calculationValues2.initialFormValues.annuityPartnerAge) +
      parseInt(calculationValues2.initialFormValues.annuityCashPayoutAge) -
      parseInt(calculationValues2.initialFormValues.annuityAge);
    if (calculationValues2.lovedOneAgeAtRetirement > 85)
      calculationValues2.lovedOneAgeAtRetirement = 85;
    if (calculationValues2.lovedOneAgeAtRetirement < 45)
      calculationValues2.lovedOneAgeAtRetirement = 40;
    if (!calculationValues2.cashPayoutRetirement)
      calculationValues2.cashPayoutRetirement = 50;
    if (!calculationValues2.monthlyIncome)
      calculationValues2.monthlyIncome = 50;
    if (!calculationValues2.lovedOneIncome)
      calculationValues2.lovedOneIncome = 50;

    calculationValues2.lumpSumCashPaymentSliderValue = $w(
      "#lumpSumCashPaymentSliderValue"
    );
    calculationValues2.monthlyRetirementIncomeSliderValue = $w(
      "#monthlyRetirementIncomeSliderValue"
    );
    calculationValues2.lovedOneMonthlyIncomeValue = $w(
      "#lovedOneMonthlyIncomeValue"
    );
    calculationValues2.annuityIncomeUntilAgeElement = false;
    calculationValues2.chartElementBlock = $w("#chartElementBlock");

    await getRates2(calculationValues2.rates);

    $w("#incomeForLife").value = "Income for life";
    $w("#chartElementBlock").onMessage((event) => {
      if (event.data) {
        if (event.data.message == "checkValuesInner") {
          calculationValues2.cashPayoutDeath = parseInt(
            event.data.payload.cashPayoutDeath
            );
          calculationValues2.monthlyIncome =
            110 - parseInt(event.data.payload.cashPayoutDeath);
          updateIncomeSlider2(calculationValues2.monthlyIncome);
          let calculatedValues2 = dataCalculation2(calculationValues2);
          calculatedValues2.then((values) => {
            calculationValues2 = values;
            updateSliderValues2(values);
          });
        }
      }
    });
    // Monthly slider
    $w("#monthlyRetirementIncome").onMessage(async (event) => {
      if (event.data) {
        if (event.data.message == "incomeSliderUpdated") {
          local.setItem("incomeSliderValue", event.data.payload.sliderValue);
          calculationValues2.monthlyIncome = event.data.payload.sliderValue;
          calculationValues2.cashPayoutDeath =
            110 - event.data.payload.sliderValue;
            let calculatedValues2 = dataCalculation2(calculationValues2);
            calculatedValues2.then((values) => {
              calculationValues2 = values;
              updateSliderValues2(values);
            });
        }
      }
    });
    // Lump Sum slider
    $w("#lumpSumCashPayment").onMessage(async (event) => {
      if (event.data) {
        if (event.data.message == "lumpSumSliderUpdated") {
          local.setItem("lumpSumSliderValue", event.data.payload.sliderValue);
          calculationValues2.cashPayoutRetirement =
            event.data.payload.sliderValue;
          let calculatedValues2 = dataCalculation2(calculationValues2);
          calculatedValues2.then((values) => {
            calculationValues2 = values;
            updateSliderValues2(values);
          });
        }
      }
    });
    // Loved One Income slider
    $w("#lovedOneMonthlySlider").onMessage(async (event) => {
      if (event.data) {
        if (event.data.message == "lovedOneSliderUpdated") {
          local.setItem("lovedOneSliderValue", event.data.payload.sliderValue);
          calculationValues2.lovedOneIncome = event.data.payload.sliderValue;
          let calculatedValues2 = dataCalculation2(calculationValues2);
          calculatedValues2.then((values) => {
            calculationValues2 = values;
            updateSliderValues2(values);
          });
        }
      }
    });

    let calculatedValues2 = dataCalculation2(calculationValues2);
    calculatedValues2.then((values) => {
      calculationValues2 = values;
      updateSliderValues2(values);
    });
    updateSliderColors2(calculationValues2.monthlyIncome);
  }, 0);
});

function updateSliderColors2(monthlyIncome) {
  $w("#chartElementBlock").postMessage({
    message: "setSliderColors",
    payload: monthlyIncome,
  });
}

function updateSliderValues2(values) {
  updateIncomeSlider2(values.monthlyIncome);
  updateLumpSumSlider2(values.cashPayoutRetirement);
  let calculatedValues2 = dataCalculation2(calculationValues2);
  calculatedValues2.then((values) => {
  let lumpSumValue2 = ((values.cashPayoutRetirement / 100) * values.maximumCashLumpSum);
  let monthlyRetirementValue2 = (values.livingAnnuityInvestment * values.livingAnnuityDrawdown) / 12 +
  values.monthlyWithProfitIncome;
  let lovedOneIncomeValue = (values.lovedOneIncome / 100) * values.maximumLovedOneIncome;
    if(lumpSumValue2 > 1000000) {
      lumpSumValue2 = Math.round(lumpSumValue2 / 10000) * 10000;
    } else {
      lumpSumValue2 = Math.round(lumpSumValue2 / 1000) * 1000;
    }
      monthlyRetirementValue2 = Math.round(monthlyRetirementValue2 / 500) * 500;
      lovedOneIncomeValue = Math.round(lovedOneIncomeValue / 500) * 500;
      
    if ($w("#lumpSumCashPaymentSliderValue")) {
      $w("#lumpSumCashPaymentSliderValue").text = `R${Math.floor(lumpSumValue2)}`
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    
    if ($w("#monthlyRetirementIncomeSliderValue")) {
      $w("#monthlyRetirementIncomeSliderValue").text = `R${Math.floor(monthlyRetirementValue2)}`
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      calculationValues2 = values;
    }
    if ($w("#lovedOneMonthlyIncomeValue")) {
      $w("#lovedOneMonthlyIncomeValue").text = `R${Math.floor(lovedOneIncomeValue)}`
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  });
}

function updateIncomeSlider2(monthlyIncome) {
  $w("#monthlyRetirementIncome").postMessage({
    message: "updateMonthlyIncomeSlider",
    payload: monthlyIncome,
  });
}

function updateLumpSumSlider2(cashPayoutDeath) {
  $w("#lumpSumCashPayment").postMessage({
    message: "updateLumpSumSlider",
    payload: cashPayoutDeath,
  });
}

function updateLovedOneMonthlySlider(lovedOneIncome) {
  $w("#lovedOneMonthlySlider").postMessage({
    message: "updateLovedOneSlider",
    payload: lovedOneIncome,
  });
}

async function getRates2(rates) {
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
