const ynab = require("ynab");

const { accessToken } = require('./config');
const RETIREMENT_AC_NAMES = ['Vanguard - N', 'Vanguard - H', 'Science37 401K', 'Betterment - 401K'];
const SAFE_WITHDRAWL_RATE = 0.04;
const CATEGORY_GROUPS = [
  { name: 'Fixed Essential', value: 'budgeted', type: 'essential' },
  { name: 'Fixed Nonessential', value: 'budgeted', type: 'nonessential' },
  { name: 'Flex Essential', value: 'activity', type: 'essential' },
  { name: 'Flex Nonessential', value: 'activity', type: 'nonessential' },
];


const ynabAPI = new ynab.API(accessToken);

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getBearBudgetId = async () => {
  const budgetsResponse = await ynabAPI.budgets.getBudgets();
  const budgets = budgetsResponse.data.budgets;
  return budgets.filter((budget => budget.name === 'Bears Shared Budget'))[0].id;
};

const getRetirementAccounts = async (bearBudgetId) => {
  const accountData = await ynabAPI.accounts.getAccounts(bearBudgetId);
  const accounts = accountData.data.accounts;
  const retirementAccounts = accounts.filter(account => {
    return !!RETIREMENT_AC_NAMES.find(name => name === account.name);
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

const calculateRetirementValue = async (bearBudgetId) => {
  const retirementAccounts = await getRetirementAccounts(bearBudgetId);
  const retirementAccountBalances = await getAccountBalances(retirementAccounts);

  const totalRetirementValue = retirementAccountBalances.reduce((total, amount) => total + amount);
  return formatRetirementValues(totalRetirementValue);
};

const formatRetirementValues = (totalValue) => {
  const totalBalance = formatter.format(totalValue);
  const annualIncome = formatter.format(totalValue * SAFE_WITHDRAWL_RATE);
  const monthlyIncome = formatter.format((totalValue * SAFE_WITHDRAWL_RATE) / 12);
  return { totalBalance, annualIncome, monthlyIncome };
};

const filterCategoryGroupData = (allCategoryGroups) => {
  const categoryNames = [];
  CATEGORY_GROUPS.forEach(category => categoryNames.push(category.name));
  return allCategoryGroups.filter(group => {
    return categoryNames.includes(group.name);
  });
}

const calculateExpenditureValues = async (bearBudgetId) => {
  const rawCategoryData = await ynabAPI.categories.getCategories(bearBudgetId);
  const allCategoryGroups = rawCategoryData.data.category_groups;
  const filteredGroupRawData = filterCategoryGroupData(allCategoryGroups);
  const selectedGroupData = [];
  CATEGORY_GROUPS.forEach(group => {
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
  const bearBudgetId = await getBearBudgetId();
  const retirementValues = await calculateRetirementValue(bearBudgetId); 
  outputIncomeReport(retirementValues);
  const expenditureValues = await calculateExpenditureValues(bearBudgetId);
  outputExpenditureReport(expenditureValues);
})();




