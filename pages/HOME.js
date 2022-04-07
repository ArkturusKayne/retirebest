import { local } from 'wix-storage';

$w.onReady(async function () {
  setFormValues();
});

function setFormValues() {
  if (!local.getItem('annuityCalculationValues')) {
    if (!$w('#annuityAge').value) {
      $w('#annuityAge').value = '55';
    }

    if (!$w('#annuityCashPayoutAge').value) {
      $w('#annuityCashPayoutAge').value = '65';
    }

    if (!$w('#annuityGender').value) {
      $w('#annuityGender').value = 'male';
    }

    if (!$w('#annuityPartnerAge').value) {
      $w('#annuityPartnerAge').value = '55';
    }

    if (!$w('#annuityPartnerPayout').value) {
      $w('#annuityPartnerPayout').value = 'will be';
    }

    if (!$w('#annuitySavings').value) {
      $w('#annuitySavings').value = 'R 3 000 000';
    }

    if (!$w('#retirementAnnuityContribution').value) {
      $w('#retirementAnnuityContribution').value = 'R 5 000';
    }

    setValuesToLocalStorage();
  } else {
    let storedAnnuityValues = JSON.parse(
      local.getItem('annuityCalculationValues')
    );
    if (!$w('#annuityAge').value && storedAnnuityValues.annuityAge) {
      $w('#annuityAge').value = storedAnnuityValues.annuityAge;
    }

    if (
      !$w('#annuityCashPayoutAge').value &&
      storedAnnuityValues.annuityCashPayoutAge
    ) {
      $w('#annuityCashPayoutAge').value =
        storedAnnuityValues.annuityCashPayoutAge;
    }

    if (!$w('#annuityGender').value && storedAnnuityValues.annuityGender) {
      $w('#annuityGender').value = storedAnnuityValues.annuityGender;
    }

    if (
      !$w('#annuityPartnerAge').value &&
      storedAnnuityValues.annuityPartnerAge
    ) {
      $w('#annuityPartnerAge').value = storedAnnuityValues.annuityPartnerAge;
    }

    if (
      !$w('#annuityPartnerPayout').value &&
      storedAnnuityValues.annuityPartnerPayout
    ) {
      $w('#annuityPartnerPayout').value =
        storedAnnuityValues.annuityPartnerPayout;
    }

    if (!$w('#annuitySavings').value && storedAnnuityValues.annuitySavings) {
      $w('#annuitySavings').value = formatCurrencyOnly(
        storedAnnuityValues.annuitySavings
      );
    }

    if (
      !$w('#providentFundSavings').value &&
      storedAnnuityValues.providentFundSavings
    ) {
      $w('#providentFundSavings').value = formatCurrencyOnly(
        storedAnnuityValues.providentFundSavings
      );
    }

    if (!$w('#pensionSavings').value && storedAnnuityValues.pensionSavings) {
      $w('#pensionSavings').value = formatCurrencyOnly(
        storedAnnuityValues.pensionSavings
      );
    }

    if (
      !$w('#retirementAnnuityContribution').value &&
      storedAnnuityValues.retirementAnnuityContribution
    ) {
      $w('#retirementAnnuityContribution').value = formatCurrencyOnly(
        storedAnnuityValues.retirementAnnuityContribution
      );
    }

    if (
      !$w('#pensionContribution').value &&
      storedAnnuityValues.pensionContribution
    ) {
      $w('#pensionContribution').value = formatCurrencyOnly(
        storedAnnuityValues.pensionContribution
      );
    }

    if (
      !$w('#providentFundContribution').value &&
      storedAnnuityValues.providentFundContribution
    ) {
      $w('#providentFundContribution').value = formatCurrencyOnly(
        storedAnnuityValues.providentFundContribution
      );
    }

    if (!$w('#annuityEmail').value && storedAnnuityValues.annuityEmail) {
      $w('#annuityEmail').value = storedAnnuityValues.annuityEmail;
    }

    if (
      !$w('#annuityContactNumber').value &&
      storedAnnuityValues.annuityContactNumber
    ) {
      $w('#annuityContactNumber').value =
        storedAnnuityValues.annuityContactNumber;
    }

    setValuesToLocalStorage();
  }
}

export function formatCurrency(event) {
  if (event.target.value) {
    let filteredSavings = event.target.value.replace(/[^0-9]/g, '');
    event.target.value = Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      useGrouping: true,
    }).format(parseInt(filteredSavings))
	  .replace(/\D00(?=\D*$)/, '');
  }
}

function formatCurrencyOnly(value) {
  return Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    useGrouping: true,
  }).format(parseInt(value))
	.replace(/\D00(?=\D*$)/, '');
}

export function setValuesToLocalStorage() {
  // Save all current form values to localStorage as a stringified object.
  local.setItem(
    'annuityCalculationValues',
    JSON.stringify({
      annuityName: $w('#annuityName').value,
      annuityAge: $w('#annuityAge').value.replace(/\D/g, ''),
      annuityGender: $w('#annuityGender').value,
      annuityCashPayoutAge: $w('#annuityCashPayoutAge').value.replace(
        /\D/g,
        ''
      ),
      annuitySavings: $w('#annuitySavings').value
        ? $w('#annuitySavings').value.replace(/\D/g, '')
        : '0',
      pensionSavings: $w('#pensionSavings').value
        ? $w('#pensionSavings').value.replace(/\D/g, '')
        : '0',
      providentFundSavings: $w('#providentFundSavings').value
        ? $w('#providentFundSavings').value.replace(/\D/g, '')
        : '0',
      retirementAnnuityContribution: $w('#retirementAnnuityContribution').value
        ? $w('#retirementAnnuityContribution').value.replace(/\D/g, '')
        : '0',
      pensionContribution: $w('#pensionContribution').value
        ? $w('#pensionContribution').value.replace(/\D/g, '')
        : '0',
      providentFundContribution: $w('#providentFundContribution').value
        ? $w('#providentFundContribution').value.replace(/\D/g, '')
        : '0',
      annuityPartnerAge: $w('#annuityPartnerAge').value.replace(/\D/g, ''),
      annuityPartnerPayout: $w('#annuityPartnerPayout').value,
      annuityEmail: $w('#annuityEmail').value,
      annuityContactNumber: $w('#annuityContactNumber').value,
    })
  );
}

export function checkAge(event) {
  if (event.target.value > parseInt($w('#annuityCashPayoutAge').value)) {
    event.target.value = $w('#annuityCashPayoutAge').value;
  }

  setValuesToLocalStorage();
}

export function checkRetirementAge(event) {
  if (event.target.value < parseInt($w('#annuityAge').value)) {
    event.target.value = $w('#annuityAge').value;
  }

  setValuesToLocalStorage();
}
