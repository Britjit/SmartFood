// SAMPLE coupons — placeholder data until we connect a real coupon source.
export const sampleDeals = [
  { id: 1, store: 'Any grocery store', item: 'Fresh bananas', deal: '2 lbs for $1', category: 'Produce', snap: true },
  { id: 2, store: 'Any grocery store', item: 'Frozen mixed vegetables', deal: 'Buy 2, get 1 free', category: 'Frozen', snap: true },
  { id: 3, store: 'Any grocery store', item: 'Brown rice (2 lb bag)', deal: '$1 off', category: 'Grains', snap: true },
  { id: 4, store: 'Any grocery store', item: 'Dry black beans', deal: '25% off', category: 'Protein', snap: true },
  { id: 5, store: 'Any grocery store', item: 'Plain oats', deal: '$0.75 off', category: 'Grains', snap: true },
  { id: 6, store: 'Farmers market', item: 'Seasonal produce', deal: 'Extra $ match with SNAP (where offered)', category: 'Produce', snap: true },
]

// Real assistance programs that stretch a healthy food budget.
export const programs = [
  {
    name: 'SNAP',
    about: 'Monthly benefits for buying groceries, including fruits, vegetables, and other staples.',
    url: 'https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program',
  },
  {
    name: 'WIC',
    about: 'Healthy foods and nutrition support for pregnant people, new parents, infants, and kids under 5.',
    url: 'https://www.fns.usda.gov/wic',
  },
  {
    name: 'Double Up Food Bucks',
    about: 'In participating areas, matches SNAP spending on fruits and vegetables.',
    url: 'https://www.doubleupfoodbucks.org/',
  },
]
