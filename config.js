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

module.exports = config;