const ynab = require("ynab");

const { 
  accessToken, 
  budgetName, 
  retirementAccountNames, 
  categoryGroups,
  safeWithdrawlRate,
} = require('./config');

const SAFE_WITHDRAWL_RATE = 0.04;



const ynabAPI = new ynab.API(accessToken);

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getBudgetId = async () => {
  const budgetsResponse = await ynabAPI.budgets.getBudgets();
  const budgets = budgetsResponse.data.budgets;
  return budgets.filter((budget => budget.name === budgetName))[0].id;
};

const getRetirementAccounts = async (budgetId) => {
  const accountData = await ynabAPI.accounts.getAccounts(budgetId);
  const accounts = accountData.data.accounts;
  const retirementAccounts = accounts.filter(account => {
    return !!retirementAccountNames.find(name => name === account.name);
  });

  return retirementAccounts;
};

const getAccountBalances = (accounts) => {
  const balances = [];
  for (let account of accounts) {
    balances.push(account.balance);
  }

  const adjustedBalances = balances.map(balance => balance / 1000);

  return adjustedBalances;
}

const outputIncomeReport = (retirementValues) => {
  const { totalBalance, annualIncome, monthlyIncome } = retirementValues;

  console.log();
  console.log(`Total retirement funds: ${totalBalance}`);
  console.log(`Annual retirement income: ${annualIncome}`);
  console.log(`Monthly retirement income: ${monthlyIncome}`);
  console.log();
};

const calculateRetirementValue = async (budgetId) => {
  const retirementAccounts = await getRetirementAccounts(budgetId);
  const retirementAccountBalances = await getAccountBalances(retirementAccounts);

  const totalRetirementValue = retirementAccountBalances.reduce((total, amount) => total + amount);
  return formatRetirementValues(totalRetirementValue);
};

const formatRetirementValues = (totalValue) => {
  const totalBalance = formatter.format(totalValue);
  const annualIncome = formatter.format(totalValue * safeWithdrawlRate);
  const monthlyIncome = formatter.format((totalValue * safeWithdrawlRate) / 12);
  return { totalBalance, annualIncome, monthlyIncome };
};

const filterCategoryGroupData = (allCategoryGroups) => {
  const categoryNames = [];
  categoryGroups.forEach(category => categoryNames.push(category.name));
  return allCategoryGroups.filter(group => {
    return categoryNames.includes(group.name);
  });
}

const calculateExpenditureValues = async (budgetId) => {
  const rawCategoryData = await ynabAPI.categories.getCategories(budgetId);
  const allCategoryGroups = rawCategoryData.data.category_groups;
  const filteredGroupRawData = filterCategoryGroupData(allCategoryGroups);
  const selectedGroupData = [];
  categoryGroups.forEach(group => {
    const groupData = { name: group.name, type: group.type };
    const categoryGroupData = filteredGroupRawData.find(groupObject => groupObject.name === group.name);
    const valueType = categoryGroupData.name.split(' ')[0];
    const values = [];
    categoryGroupData.categories.forEach(category => {
      valueType === 'Fixed' ? values.push(category.budgeted / 1000) : values.push(category.activity / -1000)
    })

    const valueTotal = values.reduce((total, amount) => total + amount);
    groupData['value'] = valueTotal;
    selectedGroupData.push(groupData)
  })

  let essentialExp = selectedGroupData.filter(group => group.type === 'essential').reduce((a, b) => ({ value: a.value + b.value })).value;
  let totalExp = selectedGroupData.reduce((a, b) => ({ value: a.value + b.value })).value;
  essentialExp = formatter.format(essentialExp);
  totalExp = formatter.format(totalExp);

  return { essentialExp, totalExp };
};

const outputExpenditureReport = (expenses) => {
  const { essentialExp, totalExp } = expenses;

  console.log();
  console.log(`Essential expenses this month: ${essentialExp}`);
  console.log(`Total expenses this month: ${totalExp}`);
  console.log();
};

(async function() {
  const budgetId = await getBudgetId();
  const retirementValues = await calculateRetirementValue(budgetId); 
  outputIncomeReport(retirementValues);
  const expenditureValues = await calculateExpenditureValues(budgetId);
  outputExpenditureReport(expenditureValues);
})();




