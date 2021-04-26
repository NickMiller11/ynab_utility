# YNAB Utility

This is a small utility that performs different calculations to help us understand our progress towards FIRE.

You can run it with `node ynab.js` when in the project's root directory.

## Config

You will need to update `config.js` with your budgeting information:

```js
const config = {
  accessToken: 'accessTokenHere',
  budgetName: 'My Budget Name',
  retirementAccountNames: ['Account-1', 'Account-2', 'Account-3'],
  categoryGroups: [
    { name: 'Fixed Essential', value: 'budgeted', type: 'essential' },
    { name: 'Fixed Nonessential', value: 'budgeted', type: 'nonessential' },
    { name: 'Flex Essential', value: 'activity', type: 'essential' },
    { name: 'Flex Nonessential', value: 'activity', type: 'nonessential' },
  ],
  safeWithdrawlRate: 0.04,
};
```

### Access Token

You can find out how to get your personal access token [here](https://api.youneedabudget.com/#personal-access-tokens)

### Retirement Account Names

These are the names of your accounts that you want included in the "Retirement Income" section of the output.

### Category Groups

For the `categoryGroups` property - we created our personal category groups based on whether we want expenditure amounts to be taken from the 'budgeted' column or 'activity' column, as well as whether the categories are for essential or nonessential purchases. 

For example, we place categories for expenses that we save towards every month but are only pay infrequently (for example, once a year) in a 'budgeted' category group. We can mark these with `value: 'budgeted'` in the config file. Other expenses paid every month, like utilities, are in an 'activity' category group and we want to take the dollar value in the 'activity' column.

Only dollar amounts from categories in groups of type `essential` are included in the "Essential expenses this month:" section of the output. Dollar amounts from both `essential` and `nonessential` types are included in the total expenses. 

### Safe Withdrawal Rate

This is the percentage of your retirement savings that you can withdraw per year, expressed as a decimal.