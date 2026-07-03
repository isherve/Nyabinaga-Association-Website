// Initial IGA report data, taken from the FY26 Q4 IGA Reports spreadsheet
// (Cluster: Nyamasheke, PF Germain Uyizeye). Loaded once into the admin Reports
// page on first use; the admin can then edit, add, import, or export from there.

export const igaReportsSeed = [
  {
    date: '2026-06-30',
    pf: 'Germain Uyizeye',
    clusterName: 'Nyamasheke',
    fcpCode: 'RW0164',
    numFcps: 16,
    baselineAssociations: 13,
    baselineMembers: 264,
    newAssociations: 0,
    newMembers: 0,
    totalAssociations: 13,
    totalMembers: 264,
    activities:
      'Agriculture of cassava, beans, rice, sugarcane, vegetables, soja, maize, tomatoes, coffee; rearing of pigs, cows, goats, hens; knitting of beads jewelry, shopping bags; making of mahle and stove; liquid soap making; tailoring of clothes; small business',
    baselineValue: 72826010,
    fixedAssets: 2000000,
    totalLoans: 3756290,
    totalCash: 1100000,
    totalValue: 6856290,
    generalTotalValue: 79682300,
    bestAssociation: 'Abahamya campany ltd',
    notes:
      'FY26 Q4 (end of June 2026). Cluster FCPs: RW0164, RW0174, RW0181, RW0189, RW0194, RW0327, RW0388, RW0398, RW0448, RW0691, RW0756, RW0750, RW0363, RW0394, RW0688, RW0960.',
  },
]
