export function getBuildUpTableNowUntilRetirement(
    startAtAge,
    openingBalance,
    growth,
    assumptionPercentage,
    contribution,
  ) {
    let startingAge = parseInt(startAtAge);
    let ratesArray = [];
    ratesArray.push({
      age: startingAge,
      openingBalance: openingBalance,
      growth: growth,
      contribution: contribution,
    });
    for (let index = 0; index < 80; index++) {
      openingBalance = Math.max(0,openingBalance + growth + contribution);
  
      if(openingBalance < 0) {
        openingBalance = 0;
      }
      
      growth = (openingBalance * assumptionPercentage);
      ratesArray.push({
        age: startingAge + index + 1,
        openingBalance: openingBalance,
        growth: growth,
        contribution: contribution,
      });
    }
  
    return ratesArray;
  }
  
  export function getBuildUpTableFromRetirementOnwards(
    startAtAge,
    openingBalance,
    growth,
    assumptionPercentage,
    income
  ) {
  
      let startingAge = parseInt(startAtAge);
      let ratesArray = [];
      ratesArray.push({
        age: startingAge,
        openingBalance: openingBalance,
        growth: growth,
        income: income,
        ageCheck: 0
      });
  
      let ageCheckOne;
  
      for (let index = 0; index < 80; index++) {
        
        let oldBalance = openingBalance;
        let newIncome = income;
        openingBalance = Math.max(0,openingBalance + growth - income);
  
        if((openingBalance + growth) <= 50000) {
          newIncome = Math.min(openingBalance + growth, income);
        } else {
          newIncome = Math.min(openingBalance * 0.175, income);
        }
        
        if(newIncome < income && ageCheckOne !== undefined) {
          ageCheckOne = startingAge + index + 1;
        } else {
          ageCheckOne = 0;
        }
  
        if(openingBalance < 0) {
          openingBalance = 0;
        }
  
        income = newIncome;
        
        growth = openingBalance * assumptionPercentage;
        ratesArray.push({
          age: startingAge + index + 1,
          openingBalance: openingBalance,
          growth: growth,
          income: newIncome,
          ageCheck: ageCheckOne
        });
      }
    
      return ratesArray;
  }
  
  export function getBuildUpTableFromRetirementOnwardsGoalSeek(
    startAtAge,
    openingBalance,
    growth,
    assumptionPercentage,
    income
  ) {
  
      let startingAge = parseInt(startAtAge);
      let ratesArray = [];
  
      ratesArray.push({
        age: startingAge,
        openingBalance: openingBalance,
        growth: growth,
        income: income,
        ageCheck: 0,
        ageCheckTwo: 0
      });
  
      let ageCheckOne = 0;
      let ageCheckTwo = 0;
  
      for (let index = 0; index < 80; index++) {
        let oldBalance = openingBalance;
        let newIncome = income;
        openingBalance = Math.max(0,openingBalance + growth - newIncome);
  
        if((openingBalance + growth) <= 50000) {
          newIncome = Math.min(openingBalance + growth, income);
        } else {
          newIncome = Math.min(openingBalance * 0.175, income);
        }
        
        ageCheckTwo = ageCheckTwo + ageCheckOne;
  
        if (ageCheckTwo > 0) {
          ageCheckOne = 0;
        }
        else if (newIncome < income && ageCheckOne !== undefined) {
          ageCheckOne = startingAge + index + 1;
        } else {
          ageCheckOne = 0;
        }
  
        if(openingBalance < 0) {
          openingBalance = 0;
        }
        
        growth = openingBalance * assumptionPercentage;
        ratesArray.push({
          age: startingAge + index + 1,
          openingBalance: openingBalance,
          growth: growth,
          income: newIncome,
          ageCheck: ageCheckOne,
          ageCheckTwo: ageCheckTwo
        });
      }
  
      let returnValue = ratesArray.find((entry) => { 
        return parseInt(entry.ageCheck) > 0;
        });
      if(returnValue && returnValue.age) {
        return returnValue.age;
      } else {  
        return null;
      }
  }
  
  export function getBuildUpTableProvidentFundNowUntilRetirement(
    startAtAge,
    openingBalance,
    growth,
    assumptionPercentage,
    contribution,
  ) {
    
    let startingAge = parseInt(startAtAge);
    let ratesArray = [];
    ratesArray.push({
      age: startingAge,
      openingBalance: openingBalance,
      growth: growth,
      contribution: contribution,
    });
    for (let index = 0; index < 80; index++) {
      openingBalance = Math.max(0,openingBalance + growth + contribution);
  
      if(openingBalance < 0) {
        openingBalance = 0;
      }
      
      growth = (openingBalance * assumptionPercentage);
      ratesArray.push({
        age: startingAge + index + 1,
        openingBalance: openingBalance,
        growth: growth,
        contribution: contribution,
      });
    }
  
    return ratesArray;
  }