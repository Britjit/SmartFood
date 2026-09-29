// Healthier picks + swaps at common chains. Menus change — always check the chain's current menu/nutrition page.
// `match` is compared (lowercase) against the restaurant name/brand from the map.
export const chains = [
  {
    name: "McDonald's",
    match: ['mcdonald'],
    picks: ['Plain hamburger', 'Egg McMuffin', 'Apple slices', 'Side salad (light dressing)'],
    swaps: ['Water or unsweetened tea instead of soda', 'Apple slices instead of fries', 'Skip the extra cheese and sauce'],
  },
  {
    name: 'Taco Bell',
    match: ['taco bell'],
    picks: ['Any item ordered "Fresco style"', 'Black beans (side or in a bowl)', 'Chicken soft taco'],
    swaps: ['"Fresco style" swaps cheese/sauce for pico de gallo', 'Beans instead of beef for more fiber', 'Skip the nacho cheese'],
  },
  {
    name: 'Chick-fil-A',
    match: ['chick-fil-a', 'chick fil a'],
    picks: ['Grilled nuggets', 'Grilled chicken sandwich', 'Fruit cup', 'Market salad'],
    swaps: ['Grilled instead of fried', 'Fruit cup instead of fries', 'Unsweetened iced tea instead of sweet tea'],
  },
  {
    name: "Wendy's",
    match: ['wendy'],
    picks: ['Small chili', 'Grilled chicken sandwich', 'Plain baked potato'],
    swaps: ['Chili or baked potato instead of fries', 'Hold the mayo', 'Water instead of a Frosty or soda'],
  },
  {
    name: 'Subway',
    match: ['subway'],
    picks: ['6" turkey or chicken on multigrain', 'Veggie sub loaded with vegetables', 'Salad version of any sub'],
    swaps: ['Load up on veggies', 'Mustard or vinegar instead of mayo/creamy sauces', '6" instead of footlong'],
  },
  {
    name: 'Burger King',
    match: ['burger king'],
    picks: ['Plain hamburger', 'Grilled chicken option (if available)', 'Side salad'],
    swaps: ['Small instead of large', 'Water instead of soda', 'Skip bacon and cheese'],
  },
  {
    name: 'Popeyes',
    match: ['popeyes'],
    picks: ['Blackened chicken tenders', 'Green beans', 'Corn on the cob'],
    swaps: ['Blackened instead of breaded', 'Green beans instead of fries', 'Skip the biscuit'],
  },
  {
    name: 'KFC',
    match: ['kfc', 'kentucky fried'],
    picks: ['Grilled chicken (where available)', 'Green beans', 'Corn on the cob'],
    swaps: ['Remove the skin/breading', 'Veggie sides instead of mac & cheese or fries'],
  },
]

export const generalTips = [
  'Drink water or unsweetened drinks — sugary drinks add up fast.',
  'Pick grilled, baked, or blackened over fried.',
  'Go with the smallest size or a kids meal.',
  'Add a fruit or veggie side when there is one.',
  'Go easy on creamy sauces, cheese, and dressings.',
]

export function findChain(nameOrBrand) {
  const n = (nameOrBrand || '').toLowerCase()
  return chains.find((c) => c.match.some((m) => n.includes(m)))
}
