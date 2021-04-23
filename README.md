This is a small utility that performs different calculations to help us understand our progress towards FIRE.

You will need to create a `config.js` file that exports the below information:

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

For the `categoryGroups` property - we created our personal category groups based on whether we want the expenditure amount to be taken from the 'budgeted' column or 'activity' column, as well as whether the categories are for essential or nonessential purchases. 

For example, we place categories for expenses that we save towards every month but are only pay once a year in a 'budgeted' category group. We mark these with `value: 'budgeted'`. Other expenses paid every month, like utilities, are in an 'activity' category group and we want to take the value in the 'activity' column.

Essential and nonessential expenditures affect the reporting in the output.
