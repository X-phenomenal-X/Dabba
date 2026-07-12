const { useState, useEffect, useCallback, useMemo, useRef } = React;

// ---- Design tokens ----
// PALETTE: every color used more than a few times across the app, named semantically.
// One-off decorative hex values inside hand-drawn SVG illustrations (mascot, dish icons)
// are intentionally left as literals — those are bespoke illustration pigments, not
// reusable system colors, so forcing them into named tokens would be artificial.
const PALETTE = {
  bg: "#1C1815",
  surface: "#252019",
  surfaceDark: "#1F1A14",
  border: "#34291C",
  borderLight: "#4A3E2C",
  textPrimary: "#F2E9DC",
  textSecondary: "#C9BBA3",
  textMuted: "#8A7A63",
  textMutedBrown: "#5C4E38",
  textMutedGreen: "#5C6E58",
  accent: "#E3A008",
  accent2: "#C97C2C",
  success: "#4A7C59",
  error: "#C25450",
  amberDark: "#B0691F",
  cream: "#FCEBC8",
};

// S: spacing scale for padding/margin/gap/borderRadius. Kept deliberately separate from
// font-size values (a different semantic scale) rather than conflating the two.
const S = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  xxl: "1.5rem",
  xxxl: "1.75rem",
};

const TASKS = [
  { id: "morningShake", label: "Morning shake", detail: "Naked Mass + full milk + banana", time: "6:15 AM", kcal: 700, protein: 50, carbs: 90, fat: 15, reminderHour: 8 },
  { id: "breakfast", label: "Breakfast", detail: "Parantha + butter + cheese + dahi", time: "6:15–7:00 AM", kcal: 450, protein: 14, carbs: 45, fat: 23, reminderHour: 9 },
  { id: "lunch", label: "Lunch tiffin", detail: "Reheat yesterday's batch", time: "1:00 PM", kcal: 750, protein: 28, carbs: 95, fat: 29, reminderHour: 15 },
  { id: "dinner", label: "Dinner", detail: "Tiffin backup or doctored noodles", time: "7:30 PM", kcal: 750, protein: 28, carbs: 90, fat: 33, reminderHour: 21 },
  { id: "cookSession", label: "Cook session", detail: "Batch-cook tomorrow's tiffin", time: "9:00 PM", kcal: 0, protein: 0, carbs: 0, fat: 0, reminderHour: 23 },
  { id: "nightShake", label: "Night shake", detail: "Naked Mass + milk + dahi", time: "9:30 PM", kcal: 650, protein: 50, carbs: 75, fat: 17, reminderHour: 23 },
];

const CARB_TARGET = 350;
const FAT_TARGET = 90;

const CALORIE_TARGET = 2800;
const PROTEIN_TARGET = 95;
const MILESTONES = [7, 14, 30, 50, 66, 100];

const RECIPES = [
  {
    name: "Beginner Dal-Rice-Egg Bhurji",
    cal: "~750–850 cal / serving",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Rinse rice, boil 15 min covered, rest 5 min off heat.",
      "Rinse dal, simmer ~20 min with turmeric until mushy.",
      "Tadka: heat 1.5 tbsp ghee, add garlic-ginger paste 15 sec, pour into dal.",
      "Sauté onion in ghee till golden, add tomato + spices till mushy.",
      "Crack in eggs, scramble 2–3 min.",
      "Plate rice + dal + bhurji. Pack half for tomorrow's tiffin.",
    ],
    ingredients: ["Rice", "Toor or moong dal", "Ghee", "Garlic-ginger paste", "Onion", "Tomato", "Eggs"],
  },
  {
    name: "Cream Carbonara Buldak",
    cal: "~830–860 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Cook Buldak noodles 1 min under packet time, drain most water.",
      "Off heat: stir in sauce packet + butter.",
      "Melt in 2 cheese slices.",
      "Whisk 1 egg + 2 tbsp milk, stir in fast off-heat for creaminess.",
    ],
    ingredients: ["Buldak noodles", "Butter", "Cheese slices", "Eggs", "Milk"],
  },
  {
    name: "Grilled Cheese & Egg Sandwich",
    cal: "~550–600 cal",
    category: "sandwich",
    slots: ["breakfast", "lunch"],
    steps: [
      "Fry 1 egg till white is set, yolk soft.",
      "Butter bread on outer sides.",
      "Layer cheese, egg, cheese between slices.",
      "Grill 2–3 min each side till golden and melted.",
    ],
    ingredients: ["Bread", "Butter", "Cheese slices", "Eggs"],
  },
  {
    name: "No-Cook Cheese & Boiled Egg Sandwich",
    cal: "~400–450 cal",
    category: "sandwich",
    slots: ["lunch"],
    steps: [
      "Boil eggs ahead in the electric boiler (12–15 min).",
      "Butter bread, layer cheese + sliced boiled egg.",
      "Season, close, slice. Zero stove time at assembly.",
    ],
    ingredients: ["Bread", "Butter", "Cheese slices", "Eggs"],
  },
  {
    name: "Peanut Butter Banana Milkshake",
    cal: "~450–500 cal",
    category: "drink",
    slots: ["breakfast", "snack"],
    steps: [
      "Add 1.5 cups full-fat milk, 1 banana, and 2 tbsp peanut butter to a blender.",
      "Blend on high for 30-45 seconds until smooth.",
      "Taste and add a spoon of honey if you want it sweeter.",
      "Pour into a glass and drink right away for the best texture.",
    ],
    ingredients: ["Milk", "Banana", "Peanut butter", "Honey"],
  },
  {
    name: "Masala Omelette Toast",
    cal: "~500–550 cal",
    category: "egg",
    slots: ["breakfast"],
    steps: [
      "Whisk 2-3 eggs with a pinch of salt and pepper.",
      "Finely chop a small onion and tomato, stir into the eggs.",
      "Heat butter in a pan on medium, pour in the egg mixture.",
      "Cook 2-3 min until the bottom sets, then fold in half and cook 1 more min.",
      "Toast 2 bread slices with butter, serve the omelette on top or alongside.",
    ],
    ingredients: ["Eggs", "Onion", "Tomato", "Bread", "Butter"],
  },
  {
    name: "Cheesy Egg Fried Rice",
    cal: "~650–700 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat butter in a pan on medium-high, add garlic-ginger paste for 15 sec.",
      "Push to one side, crack in 2 eggs, scramble until just set.",
      "Add 1.5 cups leftover rice, breaking up clumps, stir-fry 3-4 min.",
      "Tear in 2 cheese slices, stir until melted through.",
      "Season with salt and pepper, serve hot.",
    ],
    ingredients: ["Rice", "Eggs", "Cheese slices", "Butter", "Garlic-ginger paste"],
  },
  {
    name: "Chicken or Paneer Curry",
    cal: "~600–650 cal / serving",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Heat 1.5 tbsp ghee in a pan, add chopped onion, cook till golden, ~5 min.",
      "Add garlic-ginger paste, cook 1 min until fragrant.",
      "Add chopped tomato, cook until soft and mushy, ~4 min.",
      "Add chicken pieces (or paneer cubes) and spices, stir to coat.",
      "Cover and simmer 12-15 min for chicken (or 5 min for paneer), stirring occasionally.",
      "Stir in a spoon of dahi off heat for creaminess, serve with rice.",
    ],
    ingredients: ["Chicken or paneer", "Onion", "Tomato", "Garlic-ginger paste", "Ghee", "Dahi"],
  },
  {
    name: "Deluxe Mac and Cheese",
    cal: "~750–800 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Cook the mac and cheese pasta as per packet instructions.",
      "Drain, stir in the cheese packet with butter and a splash of extra milk.",
      "Crack in 1 egg off heat, stir fast so it thickens without scrambling.",
      "Tear in an extra cheese slice for more calories, stir until melted.",
      "Serve immediately while hot and creamy.",
    ],
    ingredients: ["KD mac and cheese", "Milk", "Butter", "Eggs", "Cheese slices"],
  },
  {
    name: "Paneer Bhurji",
    cal: "~500–550 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Crumble paneer into small pieces with your hands or a fork.",
      "Heat ghee in a pan, add chopped onion, cook till soft, ~4 min.",
      "Add garlic-ginger paste and chopped tomato, cook until mushy.",
      "Add crumbled paneer and spices, stir-fry 3-4 min until warmed through.",
      "Serve with roti, bread, or rice.",
    ],
    ingredients: ["Paneer", "Onion", "Tomato", "Ghee", "Garlic-ginger paste"],
  },
  {
    name: "Sweet Dahi Banana Bowl",
    cal: "~350–400 cal",
    category: "sweet",
    slots: ["breakfast", "snack"],
    steps: [
      "Spoon 1 cup thick dahi into a bowl.",
      "Slice a banana on top.",
      "Drizzle honey or a spoon of sugar over it.",
      "Sprinkle a handful of chopped dry fruits for crunch and extra calories.",
    ],
    ingredients: ["Dahi", "Banana", "Honey", "Dry fruits"],
  },
  {
    name: "Power Cereal Bowl",
    cal: "~450–500 cal",
    category: "other",
    slots: ["breakfast"],
    steps: [
      "Pour a generous bowl of cereal (Kellogg's or Oreo Puffs).",
      "Add full-fat milk until just covering the cereal.",
      "Slice a banana on top.",
      "Scatter a handful of dry fruits for extra protein and calories.",
    ],
    ingredients: ["Cereal", "Milk", "Banana", "Dry fruits"],
  },
{
    name: "Banana Peanut Butter Toast",
    cal: "~450-500 cal",
    category: "sandwich",
    slots: ["breakfast", "snack"],
    steps: [
      "Toast 2 slices of bread until golden.",
      "Spread a generous layer of peanut butter on both slices.",
      "Slice a banana thinly and layer it on top.",
      "Drizzle honey on top if you want it sweeter, then close and slice.",
    ],
    ingredients: ["Bread", "Peanut butter", "Banana", "Honey"],
  },
  {
    name: "Besan Chilla (Gram Flour Pancake)",
    cal: "~350-400 cal",
    category: "other",
    slots: ["breakfast"],
    steps: [
      "Mix 1 cup besan (gram flour) with water until it's a smooth, pourable batter.",
      "Finely chop onion and tomato, stir into the batter with a pinch of salt.",
      "Heat butter or ghee in a pan on medium, pour a ladle of batter and spread thin.",
      "Cook 2-3 min until the underside is golden, flip and cook 1-2 min more.",
      "Repeat for remaining batter, serve hot with dahi.",
    ],
    ingredients: ["Besan (gram flour)", "Onion", "Tomato", "Ghee", "Dahi"],
  },
  {
    name: "Curd Rice with Tempering",
    cal: "~450-500 cal",
    category: "curry",
    slots: ["lunch"],
    steps: [
      "Mash 1.5 cups cooked rice slightly with a spoon.",
      "Stir in 1 cup dahi and a splash of milk until creamy.",
      "Heat 1 tbsp ghee in a small pan, let it warm through, pour over the rice.",
      "Season with salt, mix well, and serve at room temperature.",
    ],
    ingredients: ["Rice", "Dahi", "Milk", "Ghee"],
  },
  {
    name: "Stuffed Cheese Parantha",
    cal: "~500-550 cal",
    category: "sandwich",
    slots: ["breakfast", "lunch"],
    steps: [
      "Heat a frozen parantha in a pan on medium until half-cooked, about 1 min per side.",
      "Lay a cheese slice on top, fold the parantha over it.",
      "Press gently and cook 2 more minutes per side with butter until golden and cheese has melted inside.",
      "Serve with a side of dahi.",
    ],
    ingredients: ["Frozen parantha", "Cheese slices", "Butter", "Dahi"],
  },
  {
    name: "Oats Porridge with Banana & Peanut Butter",
    cal: "~500-550 cal",
    category: "other",
    slots: ["breakfast"],
    steps: [
      "Simmer 0.5 cup oats with 1.5 cups full-fat milk on medium-low, stirring often, 5-7 min.",
      "Once thick and creamy, stir in a spoon of peanut butter.",
      "Top with sliced banana and a handful of dry fruits.",
    ],
    ingredients: ["Oats", "Milk", "Peanut butter", "Banana", "Dry fruits"],
  },
  {
    name: "Egg Bhurji Toast",
    cal: "~500-550 cal",
    category: "egg",
    slots: ["breakfast"],
    steps: [
      "Heat butter in a pan, sauté chopped onion and tomato until soft, ~3 min.",
      "Crack in 2-3 eggs, season with salt and pepper, scramble until just set.",
      "Toast 2 slices of bread with butter.",
      "Pile the egg bhurji onto the toast and serve.",
    ],
    ingredients: ["Eggs", "Onion", "Tomato", "Bread", "Butter"],
  },
  {
    name: "Rajma Chawal (Kidney Bean Curry with Rice)",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat ghee in a pan, sauté chopped onion till golden, ~5 min.",
      "Add garlic-ginger paste, cook 1 min, then add chopped tomato until mushy.",
      "Add cooked or canned rajma (kidney beans) and spices, simmer 10 min, mashing a few beans to thicken.",
      "Serve hot over rice.",
    ],
    ingredients: ["Rajma (kidney beans)", "Rice", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Chole (Chickpea Curry)",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat ghee in a pan, sauté chopped onion until golden.",
      "Add garlic-ginger paste and chopped tomato, cook until soft and mushy.",
      "Add cooked or canned chickpeas and spices, simmer 10-12 min.",
      "Serve with rice or bread.",
    ],
    ingredients: ["Chickpeas", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Egg Curry",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Boil 4 eggs, peel, and set aside.",
      "Heat ghee, sauté onion until golden, add garlic-ginger paste 1 min.",
      "Add chopped tomato and spices, cook until it forms a thick masala.",
      "Add the boiled eggs, simmer 5 min, stir in a spoon of dahi off heat.",
      "Serve with rice.",
    ],
    ingredients: ["Eggs", "Onion", "Tomato", "Garlic-ginger paste", "Ghee", "Dahi"],
  },
  {
    name: "Chicken Fried Rice",
    cal: "~650-700 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat butter in a pan, add garlic-ginger paste for 15 sec.",
      "Add chopped chicken pieces, cook through, about 6-8 min.",
      "Push aside, crack in an egg, scramble, then mix everything with 1.5 cups cooked rice.",
      "Stir-fry 3-4 min, season with salt and pepper, serve hot.",
    ],
    ingredients: ["Chicken", "Rice", "Eggs", "Garlic-ginger paste", "Butter"],
  },
  {
    name: "Veg Pulao",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat ghee in a pan, add garlic-ginger paste and chopped onion, sauté till soft.",
      "Add chopped tomato and any vegetables on hand, cook 3-4 min.",
      "Add rinsed rice and water, bring to a boil, then cover and simmer 15 min.",
      "Fluff with a fork and serve.",
    ],
    ingredients: ["Rice", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Paneer Butter Masala",
    cal: "~650-700 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Heat butter in a pan, sauté chopped onion until soft.",
      "Add garlic-ginger paste and chopped tomato, cook until mushy, ~6 min.",
      "Add paneer cubes and spices, simmer 5 min.",
      "Stir in a spoon of dahi off heat for creaminess, serve with rice or bread.",
    ],
    ingredients: ["Paneer", "Butter", "Onion", "Tomato", "Garlic-ginger paste", "Dahi"],
  },
  {
    name: "Simplified Chicken Biryani",
    cal: "~700-750 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Marinate chicken pieces in dahi, garlic-ginger paste, and spices for 15 min if time allows.",
      "Heat ghee in a pot, sauté onion until deep golden.",
      "Add the marinated chicken, cook 8-10 min until mostly done.",
      "Add rinsed rice and water, bring to a boil, then cover and simmer 15-18 min until rice is done.",
      "Let it rest 5 min covered before fluffing and serving.",
    ],
    ingredients: ["Chicken", "Rice", "Dahi", "Onion", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Dal Makhani",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Simmer dal (whole black or regular) with water and turmeric until soft, ~25 min.",
      "In a separate pan, heat butter, add garlic-ginger paste and chopped tomato, cook until mushy.",
      "Pour this into the dal, add a spoon of dahi, and simmer 10 more minutes, mashing slightly.",
      "Finish with a swirl of butter, serve with rice.",
    ],
    ingredients: ["Dal", "Butter", "Tomato", "Garlic-ginger paste", "Dahi"],
  },
  {
    name: "Aloo Gobi (Potato Cauliflower Curry)",
    cal: "~450-500 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat ghee in a pan, add chopped onion, cook until soft.",
      "Add cubed potato and cauliflower florets, stir to coat.",
      "Add chopped tomato and spices, cover and cook 12-15 min, stirring occasionally, until tender.",
      "Serve with rice or bread.",
    ],
    ingredients: ["Potato", "Cauliflower", "Onion", "Tomato", "Ghee"],
  },
  {
    name: "Grilled Chicken Sandwich",
    cal: "~550-600 cal",
    category: "sandwich",
    slots: ["lunch"],
    steps: [
      "Cook a chicken piece in a pan with butter and salt until fully done, ~8 min, then slice.",
      "Butter 2 bread slices on the outer sides.",
      "Layer cheese and the sliced chicken between the bread.",
      "Grill in the pan 2-3 min per side until golden and cheese is melted.",
    ],
    ingredients: ["Bread", "Chicken", "Cheese slices", "Butter"],
  },
  {
    name: "Veg Cheese Toastie",
    cal: "~450-500 cal",
    category: "sandwich",
    slots: ["lunch", "breakfast"],
    steps: [
      "Butter 2 bread slices on the outer sides.",
      "Layer cheese, sliced tomato, and sliced onion between the bread.",
      "Grill in a pan on medium 2-3 min per side until golden and cheese is melted.",
    ],
    ingredients: ["Bread", "Cheese slices", "Tomato", "Onion", "Butter"],
  },
  {
    name: "Chicken Hakka Noodles",
    cal: "~650-700 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Boil noodles per packet instructions, drain and set aside.",
      "Heat butter or oil in a pan, add garlic-ginger paste and chopped chicken, cook through.",
      "Add chopped onion, stir-fry 2-3 min.",
      "Add the noodles, toss well with salt and pepper, cook 2-3 more min, serve hot.",
    ],
    ingredients: ["Noodles", "Chicken", "Onion", "Garlic-ginger paste", "Butter"],
  },
  {
    name: "Creamy Tomato Pasta",
    cal: "~600-650 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Boil pasta per packet instructions, drain, keeping a splash of the water.",
      "In the same pot, melt butter, add chopped tomato, cook until soft and saucy.",
      "Stir in a splash of milk and a torn cheese slice, mix until creamy.",
      "Toss the pasta back in, adding reserved water if needed, serve hot.",
    ],
    ingredients: ["Pasta", "Butter", "Tomato", "Milk", "Cheese slices"],
  },
  {
    name: "Egg Fried Maggi",
    cal: "~550-600 cal",
    category: "noodles",
    slots: ["dinner", "snack"],
    steps: [
      "Cook Maggi noodles per packet instructions, drain most of the water.",
      "Push noodles aside in the pan, crack in an egg, scramble it, then mix through.",
      "Stir in the tastemaker packet and a spoon of butter, cook 1 more minute.",
    ],
    ingredients: ["Maggi noodles", "Eggs", "Butter"],
  },
  {
    name: "Banana Peanut Butter Smoothie Bowl",
    cal: "~450-500 cal",
    category: "drink",
    slots: ["breakfast", "snack"],
    steps: [
      "Blend 1 banana, 2 tbsp peanut butter, and 0.5 cup milk until thick and smooth.",
      "Pour into a bowl rather than a glass for a thicker, spoonable texture.",
      "Top with a handful of dry fruits.",
    ],
    ingredients: ["Banana", "Peanut butter", "Milk", "Dry fruits"],
  },
  {
    name: "Roasted Makhana with Ghee",
    cal: "~250-300 cal",
    category: "other",
    slots: ["snack"],
    steps: [
      "Heat 1 tbsp ghee in a pan on low-medium.",
      "Add a couple handfuls of makhana (fox nuts), roast stirring often for 5-6 min until crisp.",
      "Season with a pinch of salt, cool slightly before eating.",
    ],
    ingredients: ["Makhana (fox nuts)", "Ghee"],
  },
  {
    name: "Dry Fruit & Nut Trail Mix",
    cal: "~350-400 cal",
    category: "other",
    slots: ["snack"],
    steps: [
      "Combine a generous handful of dry fruits and nuts in a bowl.",
      "Drizzle a little honey over them and toss to coat, if you want extra calories.",
      "Portion into a small container to carry with you.",
    ],
    ingredients: ["Dry fruits", "Honey"],
  },
  {
    name: "Banana Lassi",
    cal: "~350-400 cal",
    category: "drink",
    slots: ["breakfast", "snack", "drink"],
    steps: [
      "Blend 1 cup dahi, 1 banana, a splash of milk, and honey or sugar until smooth.",
      "Add a splash more milk if it's too thick, blend again.",
      "Pour into a glass and drink chilled.",
    ],
    ingredients: ["Dahi", "Banana", "Milk", "Honey"],
  },
  {
    name: "Hershey's Chocolate Milk",
    cal: "~250-300 cal",
    category: "drink",
    slots: ["snack", "drink"],
    steps: [
      "Pour a glass of cold full-fat milk.",
      "Add 1-2 tbsp Hershey's chocolate syrup.",
      "Stir well or shake in a bottle until fully mixed.",
    ],
    ingredients: ["Milk", "Hershey's chocolate syrup"],
  },
  {
    name: "Besan Ladoo (Sweet Gram Flour Balls)",
    cal: "~180-220 cal per piece",
    category: "sweet",
    slots: ["snack"],
    steps: [
      "Roast 1 cup besan (gram flour) in 3-4 tbsp ghee on low heat, stirring constantly, until fragrant and golden, ~10 min.",
      "Remove from heat, let cool slightly, then mix in sugar or jaggery to taste.",
      "While still warm, roll into small balls with your hands.",
      "Let cool completely before storing.",
    ],
    ingredients: ["Besan (gram flour)", "Ghee", "Sugar or jaggery"],
  },
{
    name: "Vegetable Upma",
    cal: "~350-400 cal",
    category: "other",
    slots: ["breakfast"],
    steps: [
      "Dry roast 1 cup semolina (sooji) in a pan until lightly golden and fragrant, set aside.",
      "Heat ghee in the same pan, sauté chopped onion until soft.",
      "Add chopped tomato and any vegetables on hand, cook 2-3 min.",
      "Add 2 cups water, bring to a boil, then slowly stir in the roasted semolina.",
      "Cook 3-4 min stirring until thick, season with salt, serve hot.",
    ],
    ingredients: ["Semolina (sooji)", "Onion", "Tomato", "Ghee"],
  },
  {
    name: "Poha (Flattened Rice)",
    cal: "~350-400 cal",
    category: "other",
    slots: ["breakfast"],
    steps: [
      "Rinse 1.5 cups poha (flattened rice) briefly in water, drain and set aside to soften.",
      "Heat ghee in a pan, sauté chopped onion until soft.",
      "Add chopped tomato, cook 2 min, then add the softened poha.",
      "Mix gently, season with salt and turmeric, cook 3-4 min until heated through.",
      "Top with a squeeze of lemon if you have one, serve warm.",
    ],
    ingredients: ["Poha (flattened rice)", "Onion", "Tomato", "Ghee"],
  },
  {
    name: "French Toast",
    cal: "~450-500 cal",
    category: "egg",
    slots: ["breakfast"],
    steps: [
      "Whisk 2 eggs with a splash of milk and a pinch of sugar in a shallow bowl.",
      "Dip 2-3 bread slices in the mixture, coating both sides.",
      "Heat butter in a pan on medium, fry each slice 2-3 min per side until golden.",
      "Serve warm, drizzled with honey if you like it sweet.",
    ],
    ingredients: ["Eggs", "Milk", "Bread", "Butter", "Honey"],
  },
  {
    name: "Peanut Butter Banana Pancakes",
    cal: "~500-550 cal",
    category: "other",
    slots: ["breakfast"],
    steps: [
      "Mash 1 banana in a bowl, whisk in 1 egg and 2 tbsp peanut butter until smooth.",
      "Heat butter in a pan on medium-low.",
      "Pour small rounds of batter into the pan, cook 2 min per side until golden.",
      "Stack and serve with a drizzle of honey.",
    ],
    ingredients: ["Banana", "Eggs", "Peanut butter", "Butter", "Honey"],
  },
  {
    name: "Egg & Cheese Breakfast Muffin Sandwich",
    cal: "~450-500 cal",
    category: "sandwich",
    slots: ["breakfast"],
    steps: [
      "Fry 1-2 eggs in butter until the white is set.",
      "Toast a bread slice or bun until golden.",
      "Layer the fried egg and a cheese slice on the toasted bread.",
      "Season with salt and pepper, close and serve warm.",
    ],
    ingredients: ["Eggs", "Bread", "Cheese slices", "Butter"],
  },
  {
    name: "Sooji Halwa (Semolina Sweet)",
    cal: "~350-400 cal",
    category: "sweet",
    slots: ["breakfast", "snack"],
    steps: [
      "Roast 1 cup semolina (sooji) in 3-4 tbsp ghee on medium-low until golden and fragrant, ~5 min.",
      "Meanwhile heat 2 cups milk with sugar until warm.",
      "Slowly pour the warm milk into the roasted semolina, stirring constantly to avoid lumps.",
      "Cook 3-4 min until thick, top with dry fruits, serve warm.",
    ],
    ingredients: ["Semolina (sooji)", "Ghee", "Milk", "Sugar", "Dry fruits"],
  },
  {
    name: "Palak Paneer",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Blanch spinach in hot water 2 min, then blend into a smooth puree.",
      "Heat ghee, sauté chopped onion until soft, add garlic-ginger paste 1 min.",
      "Add chopped tomato, cook until mushy, then stir in the spinach puree.",
      "Add paneer cubes and simmer 5 min, finish with a spoon of dahi off heat.",
    ],
    ingredients: ["Spinach", "Paneer", "Onion", "Tomato", "Garlic-ginger paste", "Ghee", "Dahi"],
  },
  {
    name: "Matar Paneer",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Heat ghee, sauté chopped onion until golden.",
      "Add garlic-ginger paste and chopped tomato, cook until mushy.",
      "Add green peas and paneer cubes with spices, simmer 8-10 min.",
      "Serve with rice or bread.",
    ],
    ingredients: ["Paneer", "Green peas", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Chicken Tikka Masala",
    cal: "~650-700 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Marinate chicken pieces in dahi, garlic-ginger paste, and spices for 15 min if time allows.",
      "Pan-sear the chicken in ghee until browned, set aside.",
      "In the same pan, sauté onion, then add tomato and cook until a thick sauce forms.",
      "Return the chicken to the pan, simmer 10 min, finish with a swirl of dahi or cream.",
    ],
    ingredients: ["Chicken", "Dahi", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Butter Chicken",
    cal: "~700-750 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Marinate chicken in dahi, garlic-ginger paste, and a pinch of chilli powder for 15 min if time allows.",
      "Pan-sear the chicken in butter or ghee until browned, set aside.",
      "In the same pan, melt more butter and cook chopped tomato down into a thick, smooth sauce (mash it as it cooks).",
      "Stir in a spoon of cream or extra dahi to make it rich, then return the chicken to the pan.",
      "Simmer 10 min until the chicken is cooked through, finish with a final knob of butter on top.",
      "Serve hot with rice or bread — this one's meant to be extra buttery.",
    ],
    ingredients: ["Chicken", "Butter", "Dahi", "Tomato", "Garlic-ginger paste", "Cream or extra dahi"],
  },
  {
    name: "Kadai Chicken",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Heat ghee in a pan, sauté chopped onion and bell pepper if available until soft.",
      "Add garlic-ginger paste and chopped tomato, cook until thick.",
      "Add chicken pieces and spices, cover and simmer 12-15 min until cooked through.",
      "Serve hot with rice or bread.",
    ],
    ingredients: ["Chicken", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Dum Aloo",
    cal: "~450-500 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Boil small potatoes until just tender, then lightly fry in ghee until golden on the outside.",
      "In the same pan, sauté onion, garlic-ginger paste, and tomato until a thick masala forms.",
      "Add the potatoes back in with a spoon of dahi and spices, simmer 8-10 min.",
      "Serve with rice or bread.",
    ],
    ingredients: ["Potato", "Onion", "Tomato", "Garlic-ginger paste", "Ghee", "Dahi"],
  },
  {
    name: "Bhindi Masala (Okra Curry)",
    cal: "~350-400 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Wash and dry okra well, then slice into rounds.",
      "Heat ghee in a pan, add the okra, and cook uncovered on medium 8-10 min until no longer sticky, stirring occasionally.",
      "Push aside, sauté chopped onion and tomato in the same pan until soft.",
      "Mix everything together with spices, cook 3-4 more min, serve with rice or bread.",
    ],
    ingredients: ["Okra", "Onion", "Tomato", "Ghee"],
  },
  {
    name: "Egg Biryani",
    cal: "~650-700 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Boil 4-5 eggs, peel, and lightly fry in ghee until golden spots form.",
      "In a pot, sauté onion until deep golden, add garlic-ginger paste and tomato, cook until mushy.",
      "Add rinsed rice, water, and the eggs, bring to a boil.",
      "Cover and simmer 15-18 min until rice is done, let rest 5 min before serving.",
    ],
    ingredients: ["Eggs", "Rice", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Mixed Vegetable Curry",
    cal: "~400-450 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat ghee in a pan, sauté chopped onion until soft.",
      "Add garlic-ginger paste and chopped tomato, cook until mushy.",
      "Add whatever mixed vegetables you have on hand, cover and cook 10-12 min until tender.",
      "Season with spices, serve with rice or bread.",
    ],
    ingredients: ["Mixed vegetables", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Keema Curry (Minced Meat)",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Heat ghee in a pan, sauté chopped onion until golden.",
      "Add garlic-ginger paste, cook 1 min, then add minced meat, breaking it up as it browns.",
      "Add chopped tomato and spices, cover and simmer 15-20 min until fully cooked.",
      "Serve with rice or bread.",
    ],
    ingredients: ["Minced meat (keema)", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Sambar with Rice",
    cal: "~450-500 cal",
    category: "curry",
    slots: ["lunch"],
    steps: [
      "Simmer 0.5 cup toor dal with water and turmeric until soft, ~20 min, then mash slightly.",
      "In a pan, sauté chopped onion and tomato, add to the dal.",
      "Add any vegetables on hand and a splash of tamarind water or lemon juice, simmer 10 min.",
      "Serve hot over rice.",
    ],
    ingredients: ["Toor dal", "Rice", "Onion", "Tomato"],
  },
  {
    name: "Kadhi Chawal",
    cal: "~450-500 cal",
    category: "curry",
    slots: ["lunch"],
    steps: [
      "Whisk 1 cup dahi with 2 tbsp besan (gram flour) and water until smooth.",
      "Heat ghee in a pot, add the mixture, and bring to a gentle simmer, stirring often to avoid curdling.",
      "Simmer 15-20 min on low until thickened, season with salt.",
      "Serve hot over rice.",
    ],
    ingredients: ["Dahi", "Besan (gram flour)", "Rice", "Ghee"],
  },
  {
    name: "Pav Bhaji",
    cal: "~650-700 cal",
    category: "curry",
    slots: ["dinner", "snack"],
    steps: [
      "Boil and mash potato, cauliflower, and peas together until soft and smooth.",
      "Heat a generous knob of butter in a pan, sauté chopped onion and tomato until mushy.",
      "Add the mashed vegetables, pav bhaji masala, and a splash of water, simmer 10 min.",
      "Toast pav (soft buns) in butter on a griddle until golden on both sides.",
      "Serve the bhaji topped with a final cube of butter, chopped onion, and lemon, with the buttered pav on the side.",
    ],
    ingredients: ["Potato", "Cauliflower or mixed veg", "Peas", "Onion", "Tomato", "Butter", "Pav (soft buns)", "Pav bhaji masala"],
  },
  {
    name: "Malai Kofta",
    cal: "~700-750 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Mash paneer with a little potato and cornflour, shape into small balls, pan-fry in ghee until golden.",
      "Sauté onion in ghee until soft, add garlic-ginger paste and tomato, cook into a thick sauce.",
      "Blend or mash the sauce smooth, return to the pan, stir in cream or extra dahi.",
      "Simmer the sauce, then add the koftas just before serving so they don't fall apart.",
      "Serve hot with rice or bread.",
    ],
    ingredients: ["Paneer", "Potato", "Cornflour", "Onion", "Tomato", "Garlic-ginger paste", "Cream or dahi", "Ghee"],
  },
  {
    name: "Chicken 65",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["snack", "dinner"],
    steps: [
      "Marinate bite-size chicken pieces in dahi, garlic-ginger paste, chilli powder, and a spoon of cornflour for 15 min.",
      "Shallow-fry the pieces in oil until golden and crisp on the outside, cooked through inside.",
      "In a separate pan, quickly sauté curry leaves and green chilli in a little oil if available.",
      "Toss the fried chicken through, serve hot as a snack or alongside rice.",
    ],
    ingredients: ["Chicken", "Dahi", "Garlic-ginger paste", "Cornflour", "Chilli powder", "Oil"],
  },
  {
    name: "Veg Manchurian",
    cal: "~500-550 cal",
    category: "curry",
    slots: ["snack", "dinner"],
    steps: [
      "Mix grated cabbage and carrot with cornflour and a little flour, shape into small balls, fry until golden.",
      "In a pan, sauté garlic-ginger paste, then add soy sauce, a splash of ketchup, and water to make a sauce.",
      "Thicken the sauce with a little cornflour slurry, simmer 3-4 min.",
      "Toss the fried veg balls through the sauce just before serving so they stay crisp.",
    ],
    ingredients: ["Cabbage", "Carrot", "Cornflour", "Garlic-ginger paste", "Soy sauce", "Ketchup"],
  },
  {
    name: "Idli Sambar",
    cal: "~450-500 cal",
    category: "curry",
    slots: ["breakfast"],
    steps: [
      "Steam idli batter (store-bought or homemade) in an idli steamer for 10-12 min until a knife comes out clean.",
      "For a quick sambar, simmer cooked toor dal with tamarind, chopped vegetables, and sambar powder for 10 min.",
      "Serve the idlis hot with the sambar and a spoon of ghee on top.",
    ],
    ingredients: ["Idli batter", "Toor dal", "Mixed vegetables", "Tamarind", "Sambar powder", "Ghee"],
  },
  {
    name: "Misal Pav",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["breakfast", "snack"],
    steps: [
      "Simmer sprouted moong or matki beans with onion, tomato, and spices until soft, keep it a bit soupy.",
      "Top with fine sev (crunchy noodles) and chopped onion just before serving.",
      "Serve hot with buttered pav (soft buns) on the side for dunking.",
    ],
    ingredients: ["Sprouted moong or matki", "Onion", "Tomato", "Sev", "Pav (soft buns)", "Butter"],
  },
  {
    name: "Mutton Curry",
    cal: "~750-800 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Marinate mutton pieces in dahi and garlic-ginger paste for at least 20 min if time allows.",
      "Sauté sliced onion in ghee until deep golden brown, this builds most of the flavor.",
      "Add the mutton and spices, sear a few minutes, then add tomato and a cup of water.",
      "Cover and simmer on low 45-60 min until tender, checking water level occasionally.",
      "Finish with a swirl of ghee, serve hot with rice.",
    ],
    ingredients: ["Mutton", "Dahi", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Fish Curry",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Lightly pan-sear fish fillets in oil, just enough to firm them up, set aside.",
      "Sauté onion until soft, add garlic-ginger paste and tomato, cook into a thick base.",
      "Add spices and a splash of water, simmer 5 min, then gently slide the fish back in.",
      "Simmer 8-10 min until the fish is cooked through, serve hot with rice.",
    ],
    ingredients: ["Fish fillets", "Onion", "Tomato", "Garlic-ginger paste", "Oil"],
  },
  {
    name: "Chilli Paneer",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["snack", "dinner"],
    steps: [
      "Toss paneer cubes in cornflour, shallow-fry until golden on the edges.",
      "In the same pan, sauté chopped onion and bell pepper if available, then add garlic-ginger paste.",
      "Add soy sauce, a little ketchup, and a splash of water, simmer into a glossy sauce.",
      "Toss the paneer back through the sauce, serve hot.",
    ],
    ingredients: ["Paneer", "Cornflour", "Onion", "Garlic-ginger paste", "Soy sauce", "Ketchup"],
  },
  {
    name: "Chicken Korma",
    cal: "~700-750 cal",
    category: "curry",
    slots: ["dinner"],
    steps: [
      "Sauté sliced onion in ghee until golden, blend with a splash of water into a smooth paste.",
      "Return the paste to the pan, add garlic-ginger paste and chicken, sear a few minutes.",
      "Stir in dahi a spoon at a time to prevent curdling, then add a cup of water.",
      "Cover and simmer 20 min until the chicken is tender, finish with a swirl of cream if available.",
      "Serve hot with rice or bread.",
    ],
    ingredients: ["Chicken", "Onion", "Dahi", "Garlic-ginger paste", "Ghee", "Cream (optional)"],
  },
  {
    name: "Chole Bhature",
    cal: "~800-850 cal",
    category: "curry",
    slots: ["breakfast", "lunch"],
    steps: [
      "Simmer cooked or canned chickpeas with onion, tomato, and chole masala until thick, mashing a few for body.",
      "For a quick bhature shortcut, deep-fry store-bought or leftover dough rounds until puffed and golden.",
      "Serve the chole hot with the fried bhature, a wedge of lemon, and sliced onion.",
    ],
    ingredients: ["Chickpeas", "Onion", "Tomato", "Chole masala", "Dough or bhature (store-bought)"],
  },
  {
    name: "Sabudana Khichdi",
    cal: "~500-550 cal",
    category: "curry",
    slots: ["breakfast"],
    steps: [
      "Soak sabudana (tapioca pearls) in water for a few hours or overnight until soft, then drain well.",
      "Heat ghee in a pan, add roasted crushed peanuts and boiled, cubed potato, sauté briefly.",
      "Add the soaked sabudana, a pinch of sugar, and salt, toss gently on low heat until translucent.",
      "Serve hot with a squeeze of lemon.",
    ],
    ingredients: ["Sabudana (tapioca pearls)", "Potato", "Peanuts", "Ghee"],
  },
  {
    name: "Aloo Paratha",
    cal: "~550-600 cal",
    category: "curry",
    slots: ["breakfast"],
    steps: [
      "Mash boiled potato with chopped onion, green chilli if available, and spices.",
      "Stuff the mixture into a ball of dough, roll out gently into a flatbread without letting filling escape.",
      "Cook on a hot griddle with ghee on both sides until golden and crisp.",
      "Serve hot with butter, dahi, and pickle.",
    ],
    ingredients: ["Potato", "Dough (store-bought or homemade)", "Onion", "Ghee", "Dahi"],
  },
  {
    name: "Vegetable Korma",
    cal: "~600-650 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Sauté sliced onion in ghee until golden, blend with a splash of water into a smooth paste.",
      "Return to the pan, add garlic-ginger paste and mixed vegetables, sear a couple minutes.",
      "Stir in dahi a spoon at a time, then add a cup of water, cover and simmer 12-15 min until vegetables are tender.",
      "Finish with a swirl of cream if available, serve with rice or bread.",
    ],
    ingredients: ["Mixed vegetables", "Onion", "Dahi", "Garlic-ginger paste", "Ghee", "Cream (optional)"],
  },
  {
    name: "Chana Masala",
    cal: "~500-550 cal",
    category: "curry",
    slots: ["lunch", "dinner"],
    steps: [
      "Heat ghee in a pan, sauté chopped onion until golden.",
      "Add garlic-ginger paste and chopped tomato, cook until mushy.",
      "Add cooked or canned chickpeas and spices, simmer 10-12 min, mashing a few for thickness.",
      "Serve with rice or bread.",
    ],
    ingredients: ["Chickpeas", "Onion", "Tomato", "Garlic-ginger paste", "Ghee"],
  },
  {
    name: "Club Sandwich",
    cal: "~550-600 cal",
    category: "sandwich",
    slots: ["lunch"],
    steps: [
      "Toast 3 slices of bread until golden.",
      "Fry an egg and cook a small piece of chicken if using, until done.",
      "Layer bread, cheese, egg, tomato, and chicken, stacking with the middle bread slice in between.",
      "Press gently, slice diagonally, and serve.",
    ],
    ingredients: ["Bread", "Eggs", "Chicken", "Cheese slices", "Tomato"],
  },
  {
    name: "Egg Salad Sandwich",
    cal: "~450-500 cal",
    category: "sandwich",
    slots: ["lunch"],
    steps: [
      "Boil 3 eggs, peel, and mash roughly in a bowl.",
      "Mix in a spoon of butter or dahi, salt, and pepper until creamy.",
      "Butter 2 bread slices, spread the egg mixture on one.",
      "Close, slice, and serve.",
    ],
    ingredients: ["Eggs", "Bread", "Butter", "Dahi"],
  },
  {
    name: "Paneer Tikka Sandwich",
    cal: "~500-550 cal",
    category: "sandwich",
    slots: ["lunch"],
    steps: [
      "Cut paneer into slabs, pan-fry in ghee with a pinch of spices until golden on both sides.",
      "Butter 2 bread slices.",
      "Layer the paneer with sliced onion and tomato between the bread.",
      "Grill in the pan 2 min per side until golden, serve warm.",
    ],
    ingredients: ["Paneer", "Bread", "Butter", "Onion", "Tomato"],
  },
  {
    name: "Schezwan Noodles",
    cal: "~600-650 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Boil noodles per packet instructions, drain and toss with a little oil to prevent sticking.",
      "Heat butter or oil in a pan, add garlic-ginger paste and chopped onion, stir-fry 2 min.",
      "Add the noodles with a spicy sauce or extra chili if you have any, toss well 3-4 min.",
      "Season with salt, serve hot.",
    ],
    ingredients: ["Noodles", "Onion", "Garlic-ginger paste", "Butter"],
  },
  {
    name: "White Sauce Pasta",
    cal: "~650-700 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Boil pasta per packet instructions, drain and set aside.",
      "Melt butter in a pan, stir in a spoon of flour, cook 1 min, then slowly whisk in milk to make a smooth sauce.",
      "Add torn cheese slices, stir until melted and thick.",
      "Toss the pasta through the sauce, season with salt and pepper, serve hot.",
    ],
    ingredients: ["Pasta", "Butter", "Milk", "Cheese slices"],
  },
  {
    name: "Veg Hakka Noodles",
    cal: "~550-600 cal",
    category: "noodles",
    slots: ["dinner"],
    steps: [
      "Boil noodles per packet instructions, drain and toss with a little oil.",
      "Heat butter or oil in a pan, add garlic-ginger paste and chopped onion, stir-fry 2 min.",
      "Add any vegetables on hand and the noodles, toss on high heat 3-4 min.",
      "Season with salt and pepper, serve hot.",
    ],
    ingredients: ["Noodles", "Onion", "Garlic-ginger paste", "Butter"],
  },
  {
    name: "Aloo Tikki (Potato Patties)",
    cal: "~350-400 cal",
    category: "other",
    slots: ["snack"],
    steps: [
      "Boil 2-3 potatoes until soft, peel and mash well.",
      "Mix in salt and any spices you like, shape into small flat patties.",
      "Heat ghee in a pan, shallow-fry the patties 3-4 min per side until golden and crisp.",
      "Serve hot with dahi.",
    ],
    ingredients: ["Potato", "Ghee", "Dahi"],
  },
  {
    name: "Bread Pakora",
    cal: "~400-450 cal",
    category: "other",
    slots: ["snack"],
    steps: [
      "Mix besan (gram flour) with water and a pinch of salt into a thick batter.",
      "Dip bread slices into the batter, coating both sides.",
      "Heat ghee in a pan, shallow-fry the coated bread 2-3 min per side until golden.",
      "Serve hot with dahi or chutney.",
    ],
    ingredients: ["Bread", "Besan (gram flour)", "Ghee", "Dahi"],
  },
  {
    name: "Roasted Chana Snack",
    cal: "~250-300 cal",
    category: "other",
    slots: ["snack"],
    steps: [
      "Heat a dry pan on medium and add roasted chana (chickpeas).",
      "Toast for 2-3 min, stirring often, until warmed and fragrant.",
      "Toss with a pinch of salt, eat as-is or mixed with dry fruits.",
    ],
    ingredients: ["Roasted chana (chickpeas)", "Dry fruits"],
  },
  {
    name: "Badam Milk (Almond Milk)",
    cal: "~350-400 cal",
    category: "drink",
    slots: ["snack", "drink"],
    steps: [
      "Soak a handful of almonds in warm water for 10 min, then peel if you have time.",
      "Blend the almonds with 1.5 cups warm milk and sugar until mostly smooth.",
      "Warm gently in a pan if you'd like it hot, or serve chilled.",
    ],
    ingredients: ["Almonds", "Milk", "Sugar"],
  },
  {
    name: "Kheer (Rice Pudding)",
    cal: "~350-400 cal per serving",
    category: "sweet",
    slots: ["snack"],
    steps: [
      "Simmer 0.25 cup rice with 2 cups milk on low heat, stirring often, 25-30 min until thick and creamy.",
      "Stir in sugar to taste and simmer 5 more minutes.",
      "Top with chopped dry fruits, serve warm or chilled.",
    ],
    ingredients: ["Rice", "Milk", "Sugar", "Dry fruits"],
  },
  {
    name: "Gajar Halwa (Carrot Halwa)",
    cal: "~350-400 cal per serving",
    category: "sweet",
    slots: ["snack"],
    steps: [
      "Grate 2-3 carrots finely.",
      "Heat ghee in a pan, add the grated carrot, and cook stirring often for 8-10 min until softened.",
      "Add milk and simmer 15-20 min, stirring occasionally, until the milk is mostly absorbed.",
      "Stir in sugar, cook 5 more min, top with dry fruits, serve warm.",
    ],
    ingredients: ["Carrot", "Ghee", "Milk", "Sugar", "Dry fruits"],
  },
];

// Offline fallbacks — these work entirely from the built-in recipe list, no network needed.
// Used as the guaranteed baseline for search/plan/suggestions in case live AI access is unavailable.
function searchRecipeOffline(query) {
  const q = query.toLowerCase().trim();
  const exact = RECIPES.find((r) => r.name.toLowerCase() === q);
  if (exact) return { recipe: exact, quality: "exact" };

  const substring = RECIPES.find((r) => r.name.toLowerCase().includes(q) || q.includes(r.name.toLowerCase()));
  if (substring) return { recipe: substring, quality: "exact" };

  const qWords = q.split(/\s+/).filter((w) => w.length > 2);
  if (qWords.length) {
    // The last word in a food query is usually the core dish/protein (e.g. "chicken" in
    // "butter chicken", "curry" in "veg curry") — weight it more heavily than modifiers,
    // since a single generic word like "butter" alone isn't a reliable signal (it could
    // just as easily mean a shake or toast as a curry).
    const coreWord = qWords[qWords.length - 1];
    let best = null;
    let bestScore = 0;
    RECIPES.forEach((r) => {
      const rName = r.name.toLowerCase();
      const matched = qWords.filter((w) => rName.includes(w));
      let score = matched.length;
      if (matched.includes(coreWord)) score += 1.5;
      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    });
    // Require either 2+ overlapping words, or a match on the core word specifically —
    // a lone modifier-word match doesn't clear this bar and falls through to category instead.
    if (best && bestScore >= 2) {
      return { recipe: best, quality: "keyword" };
    }
  }

  const cat = inferCategory(query);
  const catMatch = RECIPES.find((r) => r.category === cat);
  if (catMatch) return { recipe: catMatch, quality: "category" };

  return null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMealPlanOffline() {
  const breakfasts = shuffle(RECIPES.filter((r) => r.slots.includes("breakfast")));
  const lunches = shuffle(RECIPES.filter((r) => r.slots.includes("lunch")));
  const dinners = shuffle(RECIPES.filter((r) => r.slots.includes("dinner")));
  return [1, 2, 3].map((n, i) => ({
    day: `Day ${n}`,
    breakfast: breakfasts.length ? breakfasts[i % breakfasts.length].name : "Parantha + butter + cheese",
    lunch: lunches.length ? lunches[i % lunches.length].name : "Rice + dal + egg",
    dinner: dinners.length ? dinners[i % dinners.length].name : "Doctored noodles + egg + cheese",
  }));
}

function suggestEatNowOffline(excludeName) {
  const hour = new Date().getHours();
  const slot = hour < 11 ? "breakfast" : hour < 16 ? "lunch" : hour < 21 ? "dinner" : "snack";
  let candidates = RECIPES.filter((r) => r.slots.includes(slot));
  if (!candidates.length) candidates = RECIPES;
  if (excludeName && candidates.length > 1) {
    candidates = candidates.filter((r) => r.name !== excludeName);
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const kcalMatch = pick.cal.match(/\d+/);
  const kcal = kcalMatch ? parseInt(kcalMatch[0], 10) : 500;
  return { name: pick.name, why: `A ${slot} pick from your recipe library, ready to cook.`, kcal };
}

// Matches selected pantry ingredients against the recipe library's ingredient lists,
// scoring by overlap, so "suggest from what I have" always returns something useful
// even without a live AI call. Shuffled before scoring so tied recipes don't always
// return the same two array-order winners, and includes a small exception so "butter"
// and "peanut butter" — genuinely different pantry items — don't cross-match just
// because one is a substring of the other.
function suggestFromPantryOffline(selectedItems) {
  const selectedLower = selectedItems.map((s) => s.toLowerCase());
  const ingredientMatches = (sel, ing) => {
    if (ing === sel) return true;
    if (sel === "butter" && ing.includes("peanut butter")) return false;
    if (sel === "peanut butter" && ing === "butter") return false;
    return ing.includes(sel) || sel.includes(ing);
  };
  const scored = shuffle(RECIPES).map((r) => {
    const ingLower = (r.ingredients || []).map((i) => i.toLowerCase());
    const score = selectedLower.filter((sel) => ingLower.some((ing) => ingredientMatches(sel, ing))).length;
    return { recipe: r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).slice(0, 2).map((s) => s.recipe);
  if (matched.length) return matched;
  // Nothing overlapped at all — still return something rather than nothing.
  return shuffle(RECIPES).slice(0, 2);
}

const SHOPPING_DEFAULT = ["Chicken or paneer", "Toor or moong dal", "Regular full-fat peanut butter", "Onion", "Tomato"];

// Built-in nutrition lookup — works fully offline, no network dependency.
// Keeps the food-log feature reliable even if the live API lookup is unavailable.
const FOOD_DB = [
  { keywords: ["tim hortons iced coffee", "tims iced coffee"], name: "Tim Hortons Iced Coffee (medium)", kcal: 190, protein: 2 },
  { keywords: ["iced coffee"], name: "Iced Coffee (medium, with milk)", kcal: 120, protein: 2 },
  { keywords: ["black coffee", "americano"], name: "Black Coffee / Americano", kcal: 10, protein: 0 },
  { keywords: ["latte"], name: "Latte (medium)", kcal: 190, protein: 10 },
  { keywords: ["cappuccino"], name: "Cappuccino (medium)", kcal: 120, protein: 7 },
  { keywords: ["cold brew"], name: "Cold Brew (black)", kcal: 15, protein: 0 },
  { keywords: ["frappuccino", "frappe"], name: "Frappuccino (medium)", kcal: 370, protein: 4 },
  { keywords: ["hot chocolate"], name: "Hot Chocolate (medium)", kcal: 300, protein: 8 },
  { keywords: ["chai latte", "chai tea", "masala chai", "chai"], name: "Chai (medium)", kcal: 120, protein: 3 },
  { keywords: ["milkshake", "shake"], name: "Milkshake (medium)", kcal: 550, protein: 10 },
  { keywords: ["smoothie"], name: "Fruit Smoothie (medium)", kcal: 280, protein: 4 },
  { keywords: ["protein shake"], name: "Protein Shake (1 scoop + milk)", kcal: 250, protein: 30 },
  { keywords: ["lassi"], name: "Sweet Lassi (1 glass)", kcal: 220, protein: 6 },
  { keywords: ["coconut water"], name: "Coconut Water (1 glass)", kcal: 45, protein: 1 },
  { keywords: ["orange juice"], name: "Orange Juice (1 glass)", kcal: 110, protein: 2 },
  { keywords: ["soda", "cola", "coke", "pepsi"], name: "Soda (can)", kcal: 150, protein: 0 },
  { keywords: ["beer"], name: "Beer (1 can/bottle)", kcal: 150, protein: 2 },
  { keywords: ["big mac"], name: "McDonald's Big Mac", kcal: 550, protein: 25 },
  { keywords: ["quarter pounder"], name: "McDonald's Quarter Pounder with Cheese", kcal: 520, protein: 30 },
  { keywords: ["mcchicken"], name: "McDonald's McChicken", kcal: 400, protein: 14 },
  { keywords: ["whopper"], name: "Burger King Whopper", kcal: 660, protein: 28 },
  { keywords: ["cheeseburger"], name: "Cheeseburger (fast food)", kcal: 300, protein: 15 },
  { keywords: ["hamburger", "burger"], name: "Hamburger (fast food)", kcal: 250, protein: 12 },
  { keywords: ["hot dog"], name: "Hot Dog (1, with bun)", kcal: 300, protein: 11 },
  { keywords: ["medium fries", "french fries", "fries"], name: "French Fries (medium)", kcal: 340, protein: 4 },
  { keywords: ["onion rings"], name: "Onion Rings (regular)", kcal: 410, protein: 5 },
  { keywords: ["chicken nuggets", "nuggets"], name: "Chicken Nuggets (6 pc)", kcal: 280, protein: 14 },
  { keywords: ["chicken wings", "wings"], name: "Chicken Wings (6 pc)", kcal: 480, protein: 30 },
  { keywords: ["nachos"], name: "Nachos (regular, with cheese)", kcal: 550, protein: 12 },
  { keywords: ["subway", "footlong", "6 inch sub"], name: "Subway 6-inch Sandwich", kcal: 350, protein: 18 },
  { keywords: ["blt"], name: "BLT Sandwich", kcal: 400, protein: 15 },
  { keywords: ["grilled cheese"], name: "Grilled Cheese Sandwich", kcal: 400, protein: 15 },
  { keywords: ["pb&j", "peanut butter jelly", "peanut butter sandwich"], name: "PB&J Sandwich", kcal: 350, protein: 12 },
  { keywords: ["pizza slice", "slice of pizza"], name: "Pizza Slice (regular cheese)", kcal: 285, protein: 12 },
  { keywords: ["personal pizza", "medium pizza"], name: "Medium Pizza (whole)", kcal: 1800, protein: 70 },
  { keywords: ["donut", "doughnut"], name: "Donut (glazed)", kcal: 260, protein: 3 },
  { keywords: ["muffin"], name: "Muffin (bakery style)", kcal: 420, protein: 6 },
  { keywords: ["bagel"], name: "Bagel (plain)", kcal: 270, protein: 10 },
  { keywords: ["croissant"], name: "Croissant", kcal: 270, protein: 5 },
  { keywords: ["pancakes"], name: "Pancakes (3, with syrup)", kcal: 520, protein: 10 },
  { keywords: ["waffle"], name: "Waffle (with syrup)", kcal: 450, protein: 8 },
  { keywords: ["oatmeal", "porridge"], name: "Oatmeal (1 bowl)", kcal: 250, protein: 8 },
  { keywords: ["cereal"], name: "Cereal with Milk (1 bowl)", kcal: 250, protein: 8 },
  { keywords: ["salad"], name: "Salad (with dressing)", kcal: 350, protein: 10 },
  { keywords: ["soup"], name: "Soup (1 bowl)", kcal: 200, protein: 8 },
  { keywords: ["taco"], name: "Taco", kcal: 220, protein: 9 },
  { keywords: ["burrito"], name: "Burrito", kcal: 550, protein: 20 },
  { keywords: ["fried chicken"], name: "Fried Chicken (2 pieces)", kcal: 500, protein: 35 },
  { keywords: ["mac and cheese", "mac n cheese"], name: "Mac and Cheese (1 bowl)", kcal: 450, protein: 15 },
  { keywords: ["ramen"], name: "Ramen Bowl", kcal: 500, protein: 18 },
  { keywords: ["sushi roll", "sushi"], name: "Sushi Roll (8 pc)", kcal: 300, protein: 10 },
  { keywords: ["pasta"], name: "Pasta (1 plate)", kcal: 500, protein: 15 },
  { keywords: ["ice cream"], name: "Ice Cream (1 scoop/cone)", kcal: 250, protein: 4 },
  { keywords: ["chips", "crisps"], name: "Chips (1 small bag)", kcal: 250, protein: 3 },
  { keywords: ["popcorn"], name: "Popcorn (1 medium bag)", kcal: 300, protein: 5 },
  { keywords: ["granola bar", "protein bar"], name: "Granola/Protein Bar (1)", kcal: 220, protein: 10 },
  { keywords: ["trail mix"], name: "Trail Mix (1 handful)", kcal: 200, protein: 6 },
  { keywords: ["banana"], name: "Banana (1 medium)", kcal: 105, protein: 1 },
  { keywords: ["apple"], name: "Apple (1 medium)", kcal: 95, protein: 0 },
  { keywords: ["mango"], name: "Mango (1 medium)", kcal: 200, protein: 3 },
  { keywords: ["orange"], name: "Orange (1 medium)", kcal: 65, protein: 1 },
  { keywords: ["boiled egg", "boiled eggs"], name: "Boiled Eggs (2)", kcal: 155, protein: 13 },
  { keywords: ["samosa"], name: "Samosa", kcal: 260, protein: 4 },
  { keywords: ["paratha", "parantha"], name: "Parantha (plain, with butter)", kcal: 300, protein: 6 },
  { keywords: ["butter chicken"], name: "Butter Chicken (1 serving)", kcal: 490, protein: 30 },
  { keywords: ["biryani"], name: "Biryani (1 plate)", kcal: 600, protein: 22 },
  { keywords: ["dal", "daal"], name: "Dal (1 bowl, with rice)", kcal: 450, protein: 15 },
  { keywords: ["rajma"], name: "Rajma Chawal (1 plate)", kcal: 500, protein: 16 },
  { keywords: ["chole", "chana masala"], name: "Chole (1 serving, with rice/bread)", kcal: 500, protein: 14 },
  { keywords: ["palak paneer"], name: "Palak Paneer (1 serving)", kcal: 450, protein: 18 },
  { keywords: ["aloo gobi"], name: "Aloo Gobi (1 serving)", kcal: 300, protein: 6 },
  { keywords: ["chowmein", "chow mein", "hakka noodles"], name: "Chowmein (1 plate)", kcal: 500, protein: 12 },
  { keywords: ["momos"], name: "Momos (6 pc)", kcal: 300, protein: 10 },
  { keywords: ["dhokla"], name: "Dhokla (4 pieces)", kcal: 200, protein: 6 },
  { keywords: ["vada pav"], name: "Vada Pav (1)", kcal: 300, protein: 6 },
  { keywords: ["kachori"], name: "Kachori (1)", kcal: 220, protein: 4 },
  { keywords: ["pakora", "bhajiya"], name: "Pakora (1 plate)", kcal: 350, protein: 6 },
  { keywords: ["jalebi"], name: "Jalebi (2-3 pieces)", kcal: 300, protein: 2 },
  { keywords: ["gulab jamun"], name: "Gulab Jamun (2 pieces)", kcal: 300, protein: 4 },
  { keywords: ["rasgulla"], name: "Rasgulla (2 pieces)", kcal: 200, protein: 4 },
  { keywords: ["roti", "chapati", "phulka"], name: "Roti/Chapati (2, plain)", kcal: 200, protein: 6 },
  { keywords: ["naan"], name: "Naan (1, plain)", kcal: 260, protein: 8 },
  { keywords: ["curd rice"], name: "Curd Rice (1 bowl)", kcal: 300, protein: 8 },
  { keywords: ["poha"], name: "Poha (1 plate)", kcal: 250, protein: 5 },
  { keywords: ["upma"], name: "Upma (1 plate)", kcal: 250, protein: 6 },
  { keywords: ["idli"], name: "Idli (3 pieces, with sambar)", kcal: 300, protein: 8 },
  { keywords: ["dosa"], name: "Dosa (1, plain, with chutney)", kcal: 350, protein: 8 },
  { keywords: ["uttapam"], name: "Uttapam (1, with chutney)", kcal: 350, protein: 8 },
];

// When a food isn't in the list above at all, use lightweight keyword-based heuristics
// instead of one identical generic number for everything — a "fried" item and a "salad"
// shouldn't both come back as the same rough estimate just because neither matched.
function estimateUnknownFood(q) {
  let kcal = 300;
  let protein = 8;
  if (/fried|deep.?fried|crispy|butter|ghee|cheese|creamy|rich/.test(q)) {
    kcal += 150;
  }
  if (/salad|soup|broth|steamed|boiled|grilled|lean/.test(q)) {
    kcal -= 100;
  }
  if (/shake|smoothie|milkshake/.test(q)) {
    kcal += 200;
  }
  if (/chicken|paneer|egg|fish|meat|mutton|lentil|dal|beans|lamb|beef|tofu/.test(q)) {
    protein += 12;
  }
  if (/rice|noodles|pasta|bread|roti|naan|potato|biryani/.test(q)) {
    kcal += 100;
  }
  if (/dessert|sweet|cake|halwa|ladoo|barfi|ice cream|sugar/.test(q)) {
    kcal += 120;
  }
  return { kcal: Math.max(50, kcal), protein: Math.max(2, protein) };
}

function estimateFoodLocally(query) {
  const q = query.toLowerCase();
  let match = null;
  let matchLen = 0;
  for (const item of FOOD_DB) {
    for (const kw of item.keywords) {
      if (q.includes(kw) && kw.length > matchLen) {
        match = item;
        matchLen = kw.length;
      }
    }
  }
  const isGuess = !match;
  if (!match) {
    const guess = estimateUnknownFood(q);
    match = { name: query, kcal: guess.kcal, protein: guess.protein };
  }

  let kcal = match.kcal;
  let protein = match.protein;

  if (/extra large|\bxl\b/.test(q)) {
    kcal *= 1.5;
    protein *= 1.4;
  } else if (/\blarge\b/.test(q)) {
    kcal *= 1.3;
    protein *= 1.2;
  } else if (/\bsmall\b/.test(q)) {
    kcal *= 0.75;
    protein *= 0.8;
  }
  if (/extra cream/.test(q)) kcal += 50;
  if (/no sugar|sugar.?free|unsweetened/.test(q)) kcal -= 40;
  if (/extra sugar|double sugar/.test(q)) kcal += 20;
  if (/no cheese/.test(q)) {
    kcal -= 50;
    protein -= 3;
  }
  if (/double (patty|meat|burger)/.test(q)) {
    kcal *= 1.6;
    protein *= 1.7;
  }
  if (/skim|non.?fat|fat.?free/.test(q)) kcal -= 20;
  if (/whipped cream/.test(q)) kcal += 60;

  return {
    name: isGuess ? query : match.name,
    kcal: Math.max(0, Math.round(kcal)),
    protein: Math.max(0, Math.round(protein)),
    source: isGuess ? "rough general estimate — not in built-in list" : "estimated from built-in food list",
  };
}

const PANTRY_DEFAULT = [
  "Eggs", "Milk", "Cheese slices", "Bread", "Butter", "Ghee", "Bananas", "Rice",
  "Dal", "Dahi", "Garlic-ginger paste", "Dry fruits", "Chicken", "Paneer",
  "Onion", "Tomato", "Instant noodles", "Peanut butter",
];

// TheMealDB's free-tier categories — each has real recipes with photos and full instructions.
const MEALDB_CATEGORIES = [
  "Chicken", "Beef", "Pork", "Lamb", "Goat", "Seafood", "Pasta", "Vegetarian",
  "Vegan", "Breakfast", "Dessert", "Side", "Starter", "Miscellaneous",
];

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// Backward-compat: older saved days stored a single extra/extraProtein number instead
// of an itemized list. Wrap that into one migrated line item so nothing is lost.
function migrateExtraItems(todayData) {
  if (Array.isArray(todayData.extraItems)) return todayData.extraItems;
  if (todayData.extra) {
    return [{ id: "migrated", name: "Earlier logged extras", kcal: todayData.extra, protein: todayData.extraProtein || 0 }];
  }
  return [];
}

function computeTrend(weights, alpha = 0.15) {
  if (!weights.length) return [];
  const sorted = [...weights].sort((a, b) => (a.date > b.date ? 1 : -1));
  const filled = [];
  for (let i = 0; i < sorted.length; i++) {
    filled.push(sorted[i]);
    if (i < sorted.length - 1) {
      const gap = daysBetween(sorted[i].date, sorted[i + 1].date);
      if (gap > 1) {
        const startW = sorted[i].weight;
        const endW = sorted[i + 1].weight;
        for (let g = 1; g < gap; g++) {
          const d = new Date(sorted[i].date);
          d.setDate(d.getDate() + g);
          filled.push({ date: d.toISOString().slice(0, 10), weight: startW + ((endW - startW) * g) / gap, interpolated: true });
        }
      }
    }
  }
  let trend = filled[0].weight;
  return filled.map((f, i) => {
    trend = i === 0 ? f.weight : alpha * f.weight + (1 - alpha) * trend;
    return { ...f, trend: Math.round(trend * 10) / 10 };
  });
}

// A friendly tiffin-box mascot whose face reflects today's progress.
function Mascot({ pct, size = 108 }) {
  const mood = pct >= 100 ? "thrilled" : pct >= 50 ? "happy" : pct > 0 ? "content" : "sleepy";
  const mouth = {
    thrilled: "M 32 60 Q 44 76 56 60",
    happy: "M 34 58 Q 44 70 54 58",
    content: "M 36 58 Q 44 63 52 58",
    sleepy: "M 37 59 L 51 59",
  }[mood];
  const eyesClosed = mood === "sleepy";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 88 100" width={size} height={size * (100 / 88)}>
        <path d="M 30 18 Q 44 2 58 18" stroke={PALETTE.textMutedBrown} strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="14" y="16" width="60" height="18" rx="9" fill={PALETTE.accent} />
        <rect x="10" y="32" width="68" height="26" rx="8" fill={PALETTE.accent2} />
        <rect x="10" y="56" width="68" height="26" rx="8" fill={PALETTE.amberDark} />
        <rect x="18" y="38" width="52" height="40" rx="14" fill={PALETTE.cream} />
        {eyesClosed ? (
          <>
            <path d="M 30 52 Q 34 55 38 52" stroke={PALETTE.bg} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 50 52 Q 54 55 58 52" stroke={PALETTE.bg} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="34" cy="52" r="3.6" fill={PALETTE.bg} />
            <circle cx="54" cy="52" r="3.6" fill={PALETTE.bg} />
          </>
        )}
        <ellipse cx="27" cy="60" rx="5" ry="3" fill={PALETTE.accent} opacity="0.35" />
        <ellipse cx="61" cy="60" rx="5" ry="3" fill={PALETTE.accent} opacity="0.35" />
        <path d={mouth} stroke={PALETTE.bg} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </svg>

      {mood !== "sleepy" && (
        <>
          <span className="steam" style={{ left: "30%", animationDelay: "0s" }} />
          <span className="steam" style={{ left: "48%", animationDelay: "0.6s" }} />
          <span className="steam" style={{ left: "64%", animationDelay: "1.1s" }} />
        </>
      )}
      {mood === "thrilled" && (
        <>
          <span className="mascot-sparkle" style={{ top: "-4px", left: "-6px", animationDelay: "0s" }}>✦</span>
          <span className="mascot-sparkle" style={{ top: "4px", right: "-8px", animationDelay: "0.4s" }}>✦</span>
        </>
      )}
    </div>
  );
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const AMBIENT_EMOJI = ["🍌", "🥚", "🥛", "✨", "🧈", "🍚"];

function inferCategory(name = "") {
  const n = name.toLowerCase();
  if (/(noodle|ramen|maggi|yippee|buldak|pasta)/.test(n)) return "noodles";
  if (/(sandwich|toast|bread|grilled cheese)/.test(n)) return "sandwich";
  if (/(shake|smoothie|lassi|milk)/.test(n)) return "drink";
  if (/(sweet|dessert|halwa|kheer|pudding|cake)/.test(n)) return "sweet";
  if (/(egg|omelette|bhurji)/.test(n)) return "egg";
  if (/(rice|dal|curry|biryani|paneer|chicken|sabzi|masala)/.test(n)) return "curry";
  return "other";
}

// Rough veg/egg/non-veg classifier from ingredient text, used for the diet filter.
function inferDiet(recipe) {
  const text = ((recipe.ingredients || []).join(" ") + " " + recipe.name).toLowerCase();
  if (/chicken|mutton|lamb|fish|prawn|keema|meat|beef|pork|seafood|goat/.test(text)) return "nonveg";
  if (/\begg/.test(text)) return "egg";
  return "veg";
}

// Pulls the highest number out of a free-text calorie string (e.g. "~750–850 cal" -> 850)
// so recipes can be sorted by calories despite cal being stored as display text.
function parseCalNumber(calString) {
  if (!calString) return 0;
  const nums = (calString.match(/\d+/g) || []).map(Number);
  return nums.length ? Math.max(...nums) : 0;
}

const DISH_THEME = {
  curry: { bg: "#3A2E14", accent: PALETTE.accent },
  noodles: { bg: "#2E2A1C", accent: PALETTE.accent2 },
  sandwich: { bg: "#332417", accent: "#D9A75C" },
  egg: { bg: "#33301F", accent: "#F0C94A" },
  drink: { bg: "#1E2E28", accent: PALETTE.success },
  sweet: { bg: "#3A2030", accent: "#C97C9C" },
  other: { bg: "#2A2620", accent: PALETTE.textMuted },
};

// Cute flat-style dish illustrations, category-matched, no external images needed.
const CATEGORY_IMAGE = {
  curry: "cat-curry.png",
  noodles: "cat-noodles.png",
  sandwich: "cat-sandwich.png",
  egg: "cat-egg.png",
  drink: "cat-drink.png",
  sweet: "cat-sweet.png",
  other: "cat-other.png",
};

function DishIllustration({ category = "other", size = 52 }) {
  const [failed, setFailed] = useState(false);
  const theme = DISH_THEME[category] || DISH_THEME.other;
  const imageSrc = CATEGORY_IMAGE[category] || CATEGORY_IMAGE.other;

  if (!failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: theme.bg }}>
        <img src={imageSrc} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  const icon = {
    curry: (
      <>
        <path d="M14 34 Q14 48 32 48 Q50 48 50 34 Z" fill={theme.accent} />
        <ellipse cx="32" cy="32" rx="19" ry="6" fill={PALETTE.cream} />
        <circle cx="26" cy="30" r="2" fill={PALETTE.amberDark} />
        <circle cx="36" cy="29" r="2" fill={PALETTE.amberDark} />
        <circle cx="31" cy="33" r="2" fill={PALETTE.amberDark} />
      </>
    ),
    noodles: (
      <>
        <path d="M14 34 Q14 48 32 48 Q50 48 50 34 Z" fill={theme.accent} />
        <path d="M20 30 Q24 24 20 20" stroke={PALETTE.cream} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M28 32 Q32 24 28 18" stroke={PALETTE.cream} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M36 32 Q40 25 36 20" stroke={PALETTE.cream} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M44 30 Q47 25 44 21" stroke={PALETTE.cream} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <rect x="40" y="12" width="2.4" height="16" rx="1.2" fill={PALETTE.textMutedBrown} transform="rotate(18 40 12)" />
        <rect x="45" y="12" width="2.4" height="16" rx="1.2" fill={PALETTE.textMutedBrown} transform="rotate(18 45 12)" />
      </>
    ),
    sandwich: (
      <>
        <ellipse cx="32" cy="44" rx="20" ry="4" fill={theme.accent} opacity="0.4" />
        <path d="M14 40 L32 16 L50 40 Z" fill="#E8C179" />
        <path d="M17 36 L47 36 L44 40 L20 40 Z" fill="#F0C94A" />
        <path d="M22 30 L42 30 L40 33 L24 33 Z" fill={PALETTE.cream} />
      </>
    ),
    egg: (
      <>
        <ellipse cx="32" cy="34" rx="20" ry="14" fill={PALETTE.cream} />
        <ellipse cx="34" cy="34" rx="8" ry="8" fill="#F0A430" />
        <ellipse cx="31" cy="31" rx="2.4" ry="2" fill={PALETTE.cream} opacity="0.7" />
      </>
    ),
    drink: (
      <>
        <path d="M22 14 L42 14 L38 46 Q32 50 26 46 Z" fill={theme.accent} opacity="0.85" />
        <path d="M24 20 L40 20 L38 26 L26 26 Z" fill={PALETTE.cream} opacity="0.9" />
      </>
    ),
    sweet: (
      <>
        <circle cx="32" cy="32" r="18" fill={theme.accent} opacity="0.9" />
        <circle cx="26" cy="26" r="2.4" fill={PALETTE.cream} />
        <circle cx="38" cy="27" r="2.4" fill={PALETTE.cream} />
        <circle cx="32" cy="37" r="2.4" fill={PALETTE.cream} />
      </>
    ),
    other: (
      <>
        <path d="M14 34 Q14 48 32 48 Q50 48 50 34 Z" fill={theme.accent} />
        <ellipse cx="32" cy="32" rx="17" ry="6" fill={PALETTE.cream} />
      </>
    ),
  }[category] || null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 64 64" width={size * 0.72} height={size * 0.72}>
        {icon}
      </svg>
    </div>
  );
}

// Maps a recipe to a Foodish API category when there's a solid visual match.
// Returns null when no good match exists — those keep the hand-drawn illustration instead
// of showing a mismatched stock photo (e.g. a burger photo for a milkshake).
// Maps a recipe to a Foodish API category ONLY when there's a specific, verified-accurate
// match on the actual dish name. Broad category-level fallbacks (e.g. "any curry gets a
// rice photo," "any sandwich gets a burger photo") were removed after causing systematic
// mismatches — a rice bowl photo for Palak Paneer or a burger photo for a grilled cheese
// sandwich is actively misleading, worse than no photo at all. Anything that doesn't match
// here falls through to a TheMealDB name search, and only then to the hand-drawn illustration.
function getFoodishCategory(recipe) {
  const n = recipe.name.toLowerCase();
  if (/biryani/.test(n)) return "biryani";
  if (/butter chicken|tikka|kadai/.test(n)) return "butter-chicken";
  if (/\bdosa\b/.test(n)) return "dosa";
  if (/\bsamosa\b/.test(n)) return "samosa";
  if (/\bpizza\b/.test(n)) return "pizza";
  if (/\bpasta\b/.test(n)) return "pasta";
  if (/\bburger\b/.test(n)) return "burger";
  if (/\bdessert\b/.test(n)) return "dessert";
  return null;
}

// Strips qualifier words so recipe names match better against TheMealDB's search index
// (e.g. "Beginner Dal-Rice-Egg Bhurji" -> "Dal-Rice-Egg Bhurji").
function cleanRecipeNameForSearch(name) {
  return name
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(Beginner|Simplified|Deluxe|No-Cook|Sweet|Power|Cream|Grilled)\b/gi, "")
    .trim();
}

// Real food photo (from the free Foodish API) with a graceful fallback to the
// hand-drawn illustration if there's no good category match or the fetch fails.
function RecipePhoto({ recipe, size = 52 }) {
  const foodishCat = useMemo(() => getFoodishCategory(recipe), [recipe.name, recipe.category]);
  const [photoUrl, setPhotoUrl] = useState(recipe.photoUrl || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (recipe.photoUrl) {
      setPhotoUrl(recipe.photoUrl);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setPhotoUrl(null);
    setFailed(false);

    async function loadPhoto() {
      if (foodishCat) {
        try {
          const r = await fetch(`https://foodish-api.com/api/images/${foodishCat}`);
          const d = await r.json();
          if (!cancelled && d && d.image) {
            setPhotoUrl(d.image);
            return;
          }
        } catch (e) {}
      }
      // Second source: TheMealDB, tried whenever Foodish had no category match or failed.
      try {
        const query = cleanRecipeNameForSearch(recipe.name);
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const d = await r.json();
        if (!cancelled && d && d.meals && d.meals[0] && d.meals[0].strMealThumb) {
          setPhotoUrl(d.meals[0].strMealThumb);
          return;
        }
      } catch (e) {}
      if (!cancelled) setFailed(true);
    }

    loadPhoto();
    return () => {
      cancelled = true;
    };
  }, [foodishCat, recipe.name, recipe.photoUrl]);

  if (failed) {
    return <DishIllustration category={recipe.category || inferCategory(recipe.name)} size={size} />;
  }

  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: PALETTE.surface, border: `2px solid ${PALETTE.borderLight}`, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={recipe.name}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: PALETTE.surface }} />
      )}
    </div>
  );
}

// A real 3D-rendered tiffin box built from CSS transforms (perspective + rotateY + translateZ) —
// not a flat image. Slowly auto-rotates so you see it as an actual dimensional object.
function Dabba3D({ size = 90 }) {
  const w = size;
  const h = size * 1.15;
  const half = w / 2;
  const halfH = h / 2;
  const faceStyle = {
    position: "absolute",
    width: w,
    height: h,
    backfaceVisibility: "hidden",
    borderRadius: "10px",
    background: `linear-gradient(180deg, ${PALETTE.accent} 0%, #E3A008 26%, #C97C2C 26%, #C97C2C 63%, #B0691F 63%, #B0691F 100%)`,
    border: "1px solid rgba(0,0,0,0.25)",
    boxShadow: "inset 0 0 14px rgba(0,0,0,0.25)",
  };
  return (
    <div style={{ width: w, height: h, perspective: "700px" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "dabbaSpin 9s linear infinite",
        }}
      >
        <div style={{ ...faceStyle, transform: `translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)`, width: w }} />
        <div style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)`, width: w }} />
        <div
          style={{
            position: "absolute",
            width: w,
            height: w,
            left: 0,
            top: halfH - w / 2,
            background: PALETTE.accent,
            borderRadius: "10px",
            transform: `rotateX(90deg) translateZ(${halfH}px)`,
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}

// Animated circular progress ring — used for calorie / protein daily targets.
function Ring({ pct, size = 84, stroke = 9, color, label, value, target, unit }) {
  const svgSize = size + 10;
  const cx = svgSize / 2;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;

  // Smoothly counts the displayed number up (or down) toward the real value instead of
  // jumping instantly, so logging a meal feels like it visibly adds up.
  const [displayValue, setDisplayValue] = useState(value);
  const animRef = useRef(null);
  useEffect(() => {
    const start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 500;
    const startTime = performance.now();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // When the target is exceeded, a thin outer arc shows how far past 100% — framed as a
  // bonus, not a warning, since going over on calories/protein is the actual goal here.
  const overflowPct = pct > 100 ? Math.min(100, pct - 100) : 0;
  const outerR = r + stroke / 2 + 4;
  const outerCirc = 2 * Math.PI * outerR;
  const outerOffset = outerCirc - (overflowPct / 100) * outerCirc;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
      <svg width={svgSize} height={svgSize} style={{ transform: "rotate(-90deg)" }}>
        {overflowPct > 0 && <circle cx={cx} cy={cx} r={outerR} fill="none" stroke="#2A2416" strokeWidth={3} />}
        {overflowPct > 0 && (
          <circle
            cx={cx}
            cy={cx}
            r={outerR}
            fill="none"
            stroke={PALETTE.success}
            strokeWidth={3}
            strokeDasharray={outerCirc}
            strokeDashoffset={outerOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 4px ${PALETTE.success}88)` }}
          />
        )}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={PALETTE.bg} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 5px ${color}88)` }}
        />
        <text
          x={cx}
          y={cx}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${cx} ${cx})`}
          style={{ fill: PALETTE.textPrimary, fontSize: "0.95rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}
        >
          {displayValue}
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: PALETTE.textPrimary }}>{label}</div>
        <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>
          / {target}
          {unit}
        </div>
      </div>
    </div>
  );
}

// Little sprout-in-pot illustration for the Progress page — growth metaphor for the weight-gain trend.
function GrowthIllustration({ size = 76 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <ellipse cx="40" cy="66" rx="22" ry="5" fill={PALETTE.success} opacity="0.15" />
        <path d="M24 52 L56 52 L51 68 L29 68 Z" fill={PALETTE.accent2} />
        <rect x="24" y="48" width="32" height="6" rx="2" fill={PALETTE.amberDark} />
        <path d="M40 50 C40 36 40 30 40 22" stroke={PALETTE.success} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M40 34 C32 30 28 22 30 16 C38 18 42 26 40 34 Z" fill={PALETTE.success} />
        <path d="M40 40 C48 37 52 30 51 24 C43 25 38 32 40 40 Z" fill="#5E9270" />
        <circle cx="52" cy="18" r="2" fill={PALETTE.accent} />
        <circle cx="58" cy="26" r="1.6" fill={PALETTE.accent} />
      </svg>
    );
  }
  return <img src="banner-progress.png" alt="" width={size} height={size} onError={() => setFailed(true)} style={{ display: "block", objectFit: "contain" }} />;
}

// Woven basket with food peeking out, for the Shop page.
function BasketIllustration({ size = 76 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <path d="M20 40 Q40 24 60 40" stroke={PALETTE.textMutedBrown} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M16 42 L64 42 L58 68 Q40 74 22 68 Z" fill={PALETTE.accent2} />
        <path d="M16 42 L64 42 L62 48 L18 48 Z" fill={PALETTE.amberDark} />
        <path d="M22 55 L58 55" stroke={PALETTE.amberDark} strokeWidth="1.6" />
        <path d="M22 61 L58 61" stroke={PALETTE.amberDark} strokeWidth="1.6" />
        <path d="M30 40 Q34 24 30 14" stroke={PALETTE.accent} strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="42" cy="34" rx="9" ry="8" fill={PALETTE.cream} />
        <path d="M50 40 Q56 28 52 18" stroke={PALETTE.success} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return <img src="banner-basket.png" alt="" width={size} height={size} onError={() => setFailed(true)} style={{ display: "block", objectFit: "contain" }} />;
}

// A magnifying glass over a dashed, empty plate — used when filters/search return nothing.
function EmptySearchIllustration({ size = 64 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <circle cx="38" cy="42" r="22" fill="none" stroke={PALETTE.border} strokeWidth="2.5" strokeDasharray="4 5" />
      <circle cx="34" cy="34" r="12" fill="none" stroke={PALETTE.textMuted} strokeWidth="3.5" />
      <line x1="43" y1="43" x2="56" y2="56" stroke={PALETTE.textMuted} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// A tiffin box with a checkmark and a couple of sparkles — used for "all done" empty states.
function AllDoneIllustration({ size = 64 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect x="18" y="34" width="44" height="30" rx="9" fill={PALETTE.accent2} />
      <rect x="18" y="34" width="44" height="10" rx="6" fill={PALETTE.accent} />
      <circle cx="40" cy="52" r="11" fill={PALETTE.cream} />
      <path d="M35 52 L39 56 L46 47" stroke={PALETTE.success} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 20 L22 26 L28 28 L22 30 L20 36 L18 30 L12 28 L18 26 Z" fill={PALETTE.accent} opacity="0.8" />
      <path d="M60 16 L61.5 20 L65.5 21.5 L61.5 23 L60 27 L58.5 23 L54.5 21.5 L58.5 20 Z" fill={PALETTE.success} opacity="0.7" />
    </svg>
  );
}

// A small reusable empty-state block: illustration + title + optional subtitle.
function EmptyState({ illustration, title, subtitle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "1.75rem 1rem", background: PALETTE.surface, borderRadius: "14px", border: `1px solid ${PALETTE.border}` }}>
      {illustration}
      <div style={{ fontSize: "0.88rem", color: PALETTE.textSecondary, fontWeight: 600, marginTop: "0.6rem" }}>{title}</div>
      {subtitle && <div style={{ fontSize: "0.76rem", color: PALETTE.textMuted, marginTop: "0.25rem" }}>{subtitle}</div>}
    </div>
  );
}

// Chef hat with a friendly face, for the Recipes page.
function ChefIllustration({ size = 76 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <path d="M24 44 Q18 30 28 22 Q30 12 40 12 Q50 12 52 22 Q62 30 56 44 Z" fill={PALETTE.cream} />
        <rect x="24" y="42" width="32" height="10" rx="4" fill={PALETTE.cream} />
        <circle cx="34" cy="40" r="2.4" fill={PALETTE.bg} />
        <circle cx="46" cy="40" r="2.4" fill={PALETTE.bg} />
        <path d="M34 47 Q40 51 46 47" stroke={PALETTE.bg} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="30" cy="43" rx="2.8" ry="1.8" fill={PALETTE.accent} opacity="0.3" />
        <ellipse cx="50" cy="43" rx="2.8" ry="1.8" fill={PALETTE.accent} opacity="0.3" />
      </svg>
    );
  }
  return <img src="banner-chef.png" alt="" width={size} height={size} onError={() => setFailed(true)} style={{ display: "block", objectFit: "contain" }} />;
}

function PageBanner({ illustration, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "1.5rem" }}>
      {illustration}
      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.3rem" }}>{title}</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "0.8rem", color: PALETTE.textMuted, marginTop: "0.1rem" }}>{subtitle}</div>
      </div>
    </div>
  );
}

// Guards against the AI occasionally omitting a field — keeps cards from crashing on bad JSON.
function normalizeRecipe(r) {
  if (!r || typeof r !== "object") return null;
  if (!r.name) return null;
  return {
    name: r.name,
    cal: r.cal || "~cal unknown",
    category: r.category || inferCategory(r.name),
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) && r.steps.length ? r.steps : ["No steps returned — try searching again."],
  };
}

// Converts a TheMealDB API meal object into this app's recipe shape. TheMealDB doesn't
// provide calories, so we ballpark one using the same offline food-estimator used
// elsewhere in the app, clearly labeled as an estimate.
function parseMealDbRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(measure && measure.trim() ? `${measure.trim()} ${ing.trim()}` : ing.trim());
    }
  }
  let steps = (meal.strInstructions || "")
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (steps.length <= 1) {
    steps = (meal.strInstructions || "")
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const calEstimate = estimateFoodLocally(meal.strMeal);
  return {
    name: meal.strMeal,
    cal: `~${calEstimate.kcal} cal (estimated)`,
    category: inferCategory(meal.strMeal),
    ingredients,
    steps: steps.length ? steps : ["Steps didn't parse cleanly — check the original recipe."],
    photoUrl: meal.strMealThumb,
  };
}

function extractStepMinutes(step) {
  const match = step.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*min/i);
  if (!match) return null;
  const a = parseInt(match[1], 10);
  const b = match[2] ? parseInt(match[2], 10) : a;
  return Math.round((a + b) / 2);
}

// Estimates total cook time from any "X min" mentions in the steps, plus a flat 2 min
// per step for active work not otherwise timed. Difficulty is a rough proxy from step
// count — useful context for a beginner cook deciding what to attempt on a given night.
function estimateRecipeEffort(recipe) {
  const steps = recipe.steps || [];
  let minutes = 0;
  steps.forEach((s) => {
    const m = extractStepMinutes(s);
    minutes += m !== null ? m : 2;
  });
  const difficulty = steps.length <= 4 ? "Easy" : steps.length <= 6 ? "Medium" : "Involved";
  return { minutes, difficulty };
}

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CookingMode({ recipe, onClose, onAddToShopping, onMarkMeal }) {
  const [stepIdx, setStepIdx] = useState(-1);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const [ingredientChecks, setIngredientChecks] = useState({});
  const intervalRef = useRef(null);

  const steps = recipe ? recipe.steps : [];
  const total = steps.length;
  const gathering = stepIdx === -1;
  const done = stepIdx >= total;
  const timerMinutes = !gathering && !done && steps[stepIdx] ? extractStepMinutes(steps[stepIdx]) : null;

  useEffect(() => {
    setStepIdx(-1);
    setIngredientChecks({});
    setRunning(false);
  }, [recipe]);

  useEffect(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(timerMinutes ? timerMinutes * 60 : null);
    // eslint-disable-next-line
  }, [stepIdx, recipe]);

  useEffect(() => {
    if (running && secondsLeft !== null && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [running]);

  if (!recipe) return null;

  const category = recipe.category || inferCategory(recipe.name);
  const toggleIngredient = (idx) => setIngredientChecks((c) => ({ ...c, [idx]: !c[idx] }));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, background: PALETTE.bg, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ringPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .timer-pulse { animation: ringPulse 1s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.25rem", borderBottom: `1px solid ${PALETTE.border}`, paddingTop: "calc(1.1rem + env(safe-area-inset-top))" }}>
        <button onClick={onClose} title="Close" style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={16} color={PALETTE.textPrimary} />
        </button>
        <div style={{ textAlign: "center", flex: 1, margin: "0 0.75rem" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: PALETTE.textPrimary }}>{recipe.name}</div>
          {gathering && <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted }}>Gather your ingredients</div>}
          {!gathering && !done && (
            <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted }}>
              Step {stepIdx + 1} of {total}
            </div>
          )}
        </div>
        <RecipePhoto recipe={recipe} size={38} />
      </div>

      {/* Progress dots */}
      {!gathering && (
        <div style={{ display: "flex", gap: "0.3rem", padding: "0.9rem 1.25rem 0", justifyContent: "center" }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                height: "4px",
                flex: 1,
                maxWidth: "36px",
                borderRadius: "999px",
                background: i <= stepIdx ? PALETTE.accent : PALETTE.border,
                boxShadow: i <= stepIdx ? `0 0 6px ${PALETTE.accent}88` : "none",
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: gathering ? "flex-start" : "center", padding: "1.5rem", textAlign: "center", overflowY: "auto" }}>
        {gathering ? (
          <div className="fade-in" style={{ width: "100%", maxWidth: "360px", textAlign: "left" }}>
            <div style={{ fontSize: "0.82rem", color: PALETTE.textMuted, marginBottom: "0.9rem", textAlign: "center" }}>Tap each item off as you set it out — makes the steps go faster.</div>
            {(recipe.ingredients || []).map((ing, i) => (
              <button
                key={ing + i}
                onClick={() => toggleIngredient(i)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.7rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.9rem", marginBottom: "0.4rem", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    border: ingredientChecks[i] ? "none" : `2px solid ${PALETTE.borderLight}`,
                    background: ingredientChecks[i] ? PALETTE.success : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {ingredientChecks[i] && <Check size={13} color={PALETTE.textPrimary} strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "0.88rem", color: ingredientChecks[i] ? PALETTE.textMutedGreen : PALETTE.textPrimary, textDecoration: ingredientChecks[i] ? "line-through" : "none" }}>{ing}</span>
              </button>
            ))}
          </div>
        ) : !done ? (
          <>
            <div className="pop-in" key={stepIdx} style={{ fontSize: "1.25rem", lineHeight: 1.6, color: PALETTE.textPrimary, maxWidth: "360px", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
              {steps[stepIdx]}
            </div>

            {timerMinutes && (
              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <div className={running ? "timer-pulse" : ""} style={{ position: "relative", width: "150px", height: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="150" height="150" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                    <circle cx="75" cy="75" r="68" fill="none" stroke={PALETTE.surface} strokeWidth="7" />
                    <circle
                      cx="75"
                      cy="75"
                      r="68"
                      fill="none"
                      stroke={secondsLeft === 0 ? PALETTE.success : PALETTE.accent}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 68}
                      strokeDashoffset={2 * Math.PI * 68 * (1 - (secondsLeft || 0) / (timerMinutes * 60))}
                      style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 6px ${secondsLeft === 0 ? PALETTE.success : PALETTE.accent}88)` }}
                    />
                  </svg>
                  <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'Fraunces', serif", color: secondsLeft === 0 ? PALETTE.success : PALETTE.accent }}>
                    {formatMMSS(secondsLeft || 0)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    onClick={() => setRunning(!running)}
                    disabled={secondsLeft === 0}
                    style={{ background: PALETTE.accent, border: "none", borderRadius: "999px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: secondsLeft === 0 ? 0.5 : 1, boxShadow: `0 4px 14px ${PALETTE.accent}55` }}
                  >
                    {running ? <Pause size={18} color={PALETTE.bg} /> : <Play size={18} color={PALETTE.bg} />}
                  </button>
                  <button
                    onClick={() => {
                      setRunning(false);
                      setSecondsLeft(timerMinutes * 60);
                    }}
                    style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <RotateCcw size={16} color={PALETTE.textMuted} />
                  </button>
                </div>
                {secondsLeft === 0 && <div style={{ fontSize: "0.78rem", color: PALETTE.success, fontWeight: 600 }}>Time's up — check it and move on ✓</div>}
              </div>
            )}
          </>
        ) : (
          <div className="pop-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", position: "relative" }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: `${10 + Math.random() * 80}%`,
                  width: "7px",
                  height: "7px",
                  borderRadius: i % 2 === 0 ? "50%" : "2px",
                  background: [PALETTE.accent, PALETTE.accent2, PALETTE.success, PALETTE.textPrimary][i % 4],
                  animationDuration: `${1.4 + Math.random() * 1}s`,
                  animationDelay: `${Math.random() * 0.3}s`,
                  zIndex: 2,
                }}
              />
            ))}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: "-16px", borderRadius: "50%", background: `radial-gradient(circle, ${PALETTE.accent}33 0%, transparent 70%)`, zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <Mascot pct={100} size={110} />
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.3rem", color: PALETTE.textPrimary }}>{recipe.name} is ready! 🎉</div>
            <div style={{ fontSize: "0.85rem", color: PALETTE.textMuted, marginBottom: "0.25rem" }}>Pack half for tomorrow if this is a batch-cook meal.</div>
            {onMarkMeal && (
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <button
                  onClick={() => onMarkMeal("lunch")}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.success, border: "none", borderRadius: "10px", padding: "0.6rem 1rem", color: PALETTE.textPrimary, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  🍱 Log as lunch
                </button>
                <button
                  onClick={() => onMarkMeal("dinner")}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.success, border: "none", borderRadius: "10px", padding: "0.6rem 1rem", color: PALETTE.textPrimary, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  🍽️ Log as dinner
                </button>
              </div>
            )}
            <button
              onClick={() => onAddToShopping(recipe)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.border, border: "none", borderRadius: "10px", padding: "0.65rem 1.1rem", color: PALETTE.accent, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
              <ShoppingBasket size={15} /> Add ingredients to list
            </button>
          </div>
        )}
      </div>

      {/* Footer nav */}
      {gathering && (
        <div style={{ padding: "1.25rem", borderTop: `1px solid ${PALETTE.border}` }}>
          <button
            onClick={() => setStepIdx(0)}
            style={{ width: "100%", background: PALETTE.accent, border: "none", borderRadius: "12px", padding: "0.85rem", color: PALETTE.bg, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", cursor: "pointer" }}
          >
            <Play size={16} /> Start cooking
          </button>
        </div>
      )}
      {!gathering && !done && (
        <div style={{ display: "flex", gap: "0.75rem", padding: "1.25rem", borderTop: `1px solid ${PALETTE.border}` }}>
          <button
            onClick={() => setStepIdx((s) => Math.max(-1, s - 1))}
            style={{ flex: 1, background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "12px", padding: "0.85rem", color: PALETTE.textPrimary, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", cursor: "pointer" }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStepIdx((s) => s + 1)}
            style={{ flex: 2, background: PALETTE.accent, border: "none", borderRadius: "12px", padding: "0.85rem", color: PALETTE.bg, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", cursor: "pointer" }}
          >
            {stepIdx === total - 1 ? "Finish" : "Next"} <ChevronRight size={16} />
          </button>
        </div>
      )}
      {done && (
        <div style={{ padding: "1.25rem", borderTop: `1px solid ${PALETTE.border}` }}>
          <button
            onClick={onClose}
            style={{ width: "100%", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "12px", padding: "0.85rem", color: PALETTE.textPrimary, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", cursor: "pointer" }}
          >
            <CheckCircle2 size={17} /> Close
          </button>
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "today", label: "Today", icon: Home },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "shop", label: "Shop", icon: ShoppingBasket },
];

function DynamicRecipeCard({ recipe, onAddToShopping, onSave, onRemove, onStartCooking, onRemix, onOpen, isFavorite, onToggleFavorite, badge, saved, note, onSaveNote }) {
  const [open, setOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note || "");
  const [editingNote, setEditingNote] = useState(false);
  return (
    <div className="card-hover fade-in" style={{ background: PALETTE.surface, borderRadius: "14px", marginBottom: "0.5rem", border: `1px solid ${PALETTE.border}`, overflow: "hidden" }}>
      <button
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen && onOpen) onOpen(recipe.name);
        }}
        style={{ width: "100%", background: "transparent", border: "none", padding: "0.8rem 1rem", display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer", color: PALETTE.textPrimary, textAlign: "left" }}
      >
        <RecipePhoto recipe={recipe} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {recipe.name}
            {badge}
          </div>
          <div style={{ fontSize: "0.75rem", color: PALETTE.textMuted, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>{recipe.cal}</span>
            {recipe.steps && recipe.steps.length > 0 && (
              <>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>
                  {estimateRecipeEffort(recipe).difficulty} · ~{estimateRecipeEffort(recipe).minutes} min
                </span>
              </>
            )}
          </div>
        </div>
        {onToggleFavorite && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(recipe.name);
            }}
            style={{ display: "flex", padding: "0.2rem", flexShrink: 0 }}
          >
            <Star size={16} color={isFavorite ? PALETTE.accent : PALETTE.textMutedBrown} fill={isFavorite ? PALETTE.accent : "none"} />
          </span>
        )}
        <ChevronDown size={18} color={PALETTE.textMuted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>
      {open && (
        <div className="fade-in" style={{ padding: "0 1rem 1rem" }}>
          <ol style={{ margin: 0, padding: "0 0 0.75rem 1.1rem", fontSize: "0.85rem", color: PALETTE.textSecondary, lineHeight: 1.6 }}>
            {(recipe.steps || []).map((s, si) => (
              <li key={si} style={{ marginBottom: "0.3rem" }}>
                {s}
              </li>
            ))}
          </ol>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => onStartCooking(recipe)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.accent, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.bg, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
            >
              <Play size={13} /> Start cooking
            </button>
            <button
              onClick={() => onAddToShopping(recipe)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.accent, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
            >
              <ShoppingBasket size={14} /> Add ingredients to list
            </button>
            {onSave && (
              <button
                onClick={() => onSave(recipe)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.success, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
              >
                <Bookmark size={14} /> Save
              </button>
            )}
            {onRemix && (
              <button
                onClick={() => onRemix(recipe)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.accent2, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
              >
                <Shuffle size={13} /> Remix
              </button>
            )}
            <button
              onClick={async () => {
                const text = `${recipe.name} (${recipe.cal})\n\nIngredients:\n${(recipe.ingredients || []).map((i) => `• ${i}`).join("\n")}\n\nSteps:\n${(recipe.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n— from Today's Dabba`;
                if (navigator.share) {
                  try {
                    await navigator.share({ text, title: recipe.name });
                  } catch (e) {}
                } else if (navigator.clipboard) {
                  try {
                    await navigator.clipboard.writeText(text);
                  } catch (e) {}
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "transparent", border: `1px solid ${PALETTE.borderLight}`, borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.textMuted, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
            >
              <Share2 size={13} /> Share
            </button>
            {onRemove && (
              <button
                onClick={() => onRemove(recipe.name)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "transparent", border: `1px solid ${PALETTE.borderLight}`, borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.textMuted, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>
          {onSaveNote && (
            <div style={{ marginTop: "0.75rem" }}>
              {editingNote ? (
                <div>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="e.g. too spicy, halve the chilli next time…"
                    rows={2}
                    style={{ width: "100%", background: PALETTE.surfaceDark, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem 0.7rem", color: PALETTE.textPrimary, fontSize: "0.78rem", outline: "none", resize: "none", fontFamily: "inherit" }}
                  />
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
                    <button
                      onClick={() => {
                        onSaveNote(recipe.name, noteDraft);
                        setEditingNote(false);
                      }}
                      style={{ background: PALETTE.success, border: "none", borderRadius: "6px", padding: "0.35rem 0.7rem", color: PALETTE.textPrimary, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Save note
                    </button>
                    <button onClick={() => setEditingNote(false)} style={{ background: "transparent", border: "none", color: PALETTE.textMuted, fontSize: "0.72rem", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : note ? (
                <button onClick={() => setEditingNote(true)} style={{ width: "100%", textAlign: "left", background: PALETTE.surfaceDark, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem 0.7rem", cursor: "pointer" }}>
                  <div style={{ fontSize: "0.66rem", color: PALETTE.textMuted, marginBottom: "0.15rem" }}>📝 Your note</div>
                  <div style={{ fontSize: "0.78rem", color: PALETTE.textSecondary }}>{note}</div>
                </button>
              ) : (
                <button onClick={() => setEditingNote(true)} style={{ background: "transparent", border: "none", color: PALETTE.textMuted, fontSize: "0.74rem", cursor: "pointer", padding: 0 }}>
                  + Add a note
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BulkTiffin() {
  const [tab, setTab] = useState("today");
  const [slideDirection, setSlideDirection] = useState("right");
  const prevTabIndexRef = useRef(0);

  useEffect(() => {
    const idx = NAV_ITEMS.findIndex((i) => i.id === tab);
    if (idx === -1) return;
    setSlideDirection(idx >= prevTabIndexRef.current ? "right" : "left");
    prevTabIndexRef.current = idx;
  }, [tab]);

  const [dailyTasks, setDailyTasks] = useState({});
  const [weights, setWeights] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [shopping, setShopping] = useState(SHOPPING_DEFAULT.map((item) => ({ item, checked: false })));
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState("");
  const [streakData, setStreakData] = useState({ streak: 0, lastActiveDate: null, freezeAvailable: true, lastMilestone: 0, bestStreak: 0 });
  const [extraItems, setExtraItems] = useState([]);
  const [extraInput, setExtraInput] = useState("");
  const [celebration, setCelebration] = useState(null);
  const [history, setHistory] = useState({});
  const [goalWeight, setGoalWeight] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [showPortions, setShowPortions] = useState(false);

  // Recipe search / pantry-filter / saved-recipes state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchQuality, setSearchQuality] = useState(null);
  const [searchNotice, setSearchNotice] = useState("");
  const [foodLogNotice, setFoodLogNotice] = useState("");
  const [planNotice, setPlanNotice] = useState("");
  const [nowNotice, setNowNotice] = useState("");
  const [suggestNotice, setSuggestNotice] = useState("");
  const [searchError, setSearchError] = useState("");
  const [pantryItems, setPantryItems] = useState(PANTRY_DEFAULT.map((name) => ({ name, selected: false })));
  const [newPantryItem, setNewPantryItem] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestError, setSuggestError] = useState("");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [healthNudgeDismissedAt, setHealthNudgeDismissedAt] = useState(null);
  const prevNeedToBuy = useRef(null);
  const [calorieTarget, setCalorieTarget] = useState(CALORIE_TARGET);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [lastBackupAt, setLastBackupAt] = useState(null);
  const [desiredGainRate, setDesiredGainRate] = useState(0.35);
  const [gainRateInput, setGainRateInput] = useState("");
  const [testKeyStatus, setTestKeyStatus] = useState(null);
  const [persistenceGranted, setPersistenceGranted] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState(null);
  const [importError, setImportError] = useState("");
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [show3DMascot, setShow3DMascot] = useState(false);
  const [mascotViewMode, setMascotViewMode] = useState("video");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [heroModelLoaded, setHeroModelLoaded] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
    };
  }, []);
  const [notifyPermission, setNotifyPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [notifiedToday, setNotifiedToday] = useState([]);
  const [clockTick, setClockTick] = useState(0);
  const importFileRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    // Only treat as a tab-switch swipe if it's clearly horizontal and long enough to be
    // intentional — otherwise normal vertical scrolling would keep flipping tabs.
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const idx = NAV_ITEMS.findIndex((i) => i.id === tab);
      if (dx < 0 && idx < NAV_ITEMS.length - 1) setTab(NAV_ITEMS[idx + 1].id);
      else if (dx > 0 && idx > 0) setTab(NAV_ITEMS[idx - 1].id);
    }
  };
  const [proteinTarget, setProteinTarget] = useState(PROTEIN_TARGET);
  const [showSettings, setShowSettings] = useState(false);
  const [calorieTargetInput, setCalorieTargetInput] = useState("");
  const [proteinTargetInput, setProteinTargetInput] = useState("");
  const [recipeOpens, setRecipeOpens] = useState({});
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [mealdbCategory, setMealdbCategory] = useState(null);
  const [mealdbBrowseResults, setMealdbBrowseResults] = useState([]);
  const [mealdbBrowseLoading, setMealdbBrowseLoading] = useState(false);
  const [mealdbDetailLoading, setMealdbDetailLoading] = useState(false);
  const [mealdbPreview, setMealdbPreview] = useState(null);
  const [mealdbError, setMealdbError] = useState("");
  const [showBrowseLibrary, setShowBrowseLibrary] = useState(false);
  const [shoppingInput, setShoppingInput] = useState("");
  const [recipeFilter, setRecipeFilter] = useState("all");
  const [recipeSlotFilters, setRecipeSlotFilters] = useState([]);
  const [recipeDietFilter, setRecipeDietFilter] = useState("all");
  const [recipeSort, setRecipeSort] = useState("default");
  const [recipeListSearch, setRecipeListSearch] = useState("");
  const [surpriseRecipe, setSurpriseRecipe] = useState(null);
  const [recipeNotes, setRecipeNotes] = useState({});
  const [deletedShoppingItem, setDeletedShoppingItem] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [dateKey, setDateKey] = useState(todayKey());
  const didMountRef = useRef(false);
  const [taskOverrides, setTaskOverrides] = useState({});
  const [taskKcalInputs, setTaskKcalInputs] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [foodLogQuery, setFoodLogQuery] = useState("");
  const [foodLogLoading, setFoodLogLoading] = useState(false);
  const [foodLogResult, setFoodLogResult] = useState(null);
  const [foodLogError, setFoodLogError] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [remixOpen, setRemixOpen] = useState(false);
  const [remixTarget, setRemixTarget] = useState(null);
  const [remixInstruction, setRemixInstruction] = useState("");
  const [remixLoading, setRemixLoading] = useState(false);
  const [remixResult, setRemixResult] = useState(null);
  const [remixError, setRemixError] = useState("");

  const [planLoading, setPlanLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [planError, setPlanError] = useState("");

  const [nowLoading, setNowLoading] = useState(false);
  const [nowResult, setNowResult] = useState(null);
  const [nowError, setNowError] = useState("");

  const key = dateKey;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  useEffect(() => {
    (async () => {
      let todayData = { tasks: {}, extraItems: [] };
      try {
        const t = await window.storage.get(`daily:${key}`, false);
        if (t) todayData = JSON.parse(t.value);
      } catch (e) {}
      setDailyTasks(todayData.tasks || {});
      setExtraItems(migrateExtraItems(todayData));
      setNotifiedToday(todayData.notifiedToday || []);

      try {
        const h = await window.storage.get("history", false);
        if (h) setHistory(JSON.parse(h.value));
      } catch (e) {}
      try {
        const g = await window.storage.get("goal-weight", false);
        if (g) setGoalWeight(JSON.parse(g.value));
      } catch (e) {}
      try {
        const w = await window.storage.get("weights", false);
        if (w) setWeights(JSON.parse(w.value));
      } catch (e) {}
      try {
        const s = await window.storage.get("shopping", false);
        if (s) setShopping(JSON.parse(s.value));
      } catch (e) {}
      try {
        const p = await window.storage.get("pantry-items", false);
        if (p) setPantryItems(JSON.parse(p.value));
      } catch (e) {}
      try {
        const sr = await window.storage.get("custom-recipes", false);
        if (sr) setSavedRecipes(JSON.parse(sr.value));
      } catch (e) {}

      let sd = { streak: 0, lastActiveDate: null, freezeAvailable: true, lastMilestone: 0, bestStreak: 0 };
      try {
        const st = await window.storage.get("streak-data", false);
        if (st) sd = JSON.parse(st.value);
      } catch (e) {}

      if (sd.lastActiveDate && sd.lastActiveDate !== key) {
        const gap = daysBetween(sd.lastActiveDate, key);
        if (gap === 2 && sd.freezeAvailable) {
          sd = { ...sd, freezeAvailable: false };
        } else if (gap >= 2) {
          sd = { ...sd, streak: 0 };
        }
      }
      setStreakData(sd);
      try {
        await window.storage.set("streak-data", JSON.stringify(sd), false);
      } catch (e) {}

      try {
        const hn = await window.storage.get("health-nudge-dismissed", false);
        if (hn) setHealthNudgeDismissedAt(JSON.parse(hn.value));
      } catch (e) {}
      try {
        const tg = await window.storage.get("targets", false);
        if (tg) {
          const parsed = JSON.parse(tg.value);
          if (parsed.calorieTarget) setCalorieTarget(parsed.calorieTarget);
          if (parsed.proteinTarget) setProteinTarget(parsed.proteinTarget);
        }
      } catch (e) {}
      try {
        const ak = await window.storage.get("api-key", false);
        if (ak) setApiKey(JSON.parse(ak.value));
      } catch (e) {}
      try {
        const ro = await window.storage.get("recipe-opens", false);
        if (ro) setRecipeOpens(JSON.parse(ro.value));
      } catch (e) {}
      try {
        const tov = await window.storage.get("task-overrides", false);
        if (tov) setTaskOverrides(JSON.parse(tov.value));
      } catch (e) {}
      try {
        const lb = await window.storage.get("last-backup-at", false);
        if (lb) setLastBackupAt(JSON.parse(lb.value));
      } catch (e) {}
      try {
        const gr = await window.storage.get("gain-rate", false);
        if (gr) setDesiredGainRate(JSON.parse(gr.value));
      } catch (e) {}
      try {
        const fv = await window.storage.get("favorite-recipes", false);
        if (fv) setFavorites(JSON.parse(fv.value));
      } catch (e) {}
      try {
        const rn = await window.storage.get("recipe-notes", false);
        if (rn) setRecipeNotes(JSON.parse(rn.value));
      } catch (e) {}
      try {
        const granted = await window.storage.requestPersistence();
        setPersistenceGranted(granted);
      } catch (e) {}
      try {
        const est = await window.storage.usageEstimate();
        setStorageEstimate(est);
      } catch (e) {}

      setLoaded(true);
    })();
  }, []);

  // Show a one-time "add to home screen" coaching banner if running in a regular
  // Safari tab rather than installed — installing exempts the app from iOS's
  // 7-day storage eviction policy, so this matters for data safety too.
  useEffect(() => {
    if (!loaded) return;
    const isStandalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;
    (async () => {
      try {
        const dismissed = await window.storage.get("install-banner-dismissed", false);
        if (!dismissed) setShowInstallBanner(true);
      } catch (e) {
        setShowInstallBanner(true);
      }
    })();
  }, [loaded]);

  const dismissInstallBanner = async () => {
    setShowInstallBanner(false);
    try {
      await window.storage.set("install-banner-dismissed", JSON.stringify(true), false);
    } catch (e) {}
  };

  // Show a brief, one-time welcome only for a genuinely fresh install (no history, no
  // weigh-ins yet) — not a multi-step tour, just enough context to get the first tile
  // checked off quickly, per the general finding that onboarding friction hurts more
  // than it helps once there's an obvious first action available.
  useEffect(() => {
    if (!loaded) return;
    if (Object.keys(history).length > 0 || weights.length > 0) return;
    (async () => {
      try {
        const dismissed = await window.storage.get("welcome-dismissed", false);
        if (!dismissed) setShowWelcome(true);
      } catch (e) {}
    })();
  }, [loaded]);

  const dismissWelcome = async () => {
    setShowWelcome(false);
    try {
      await window.storage.set("welcome-dismissed", JSON.stringify(true), false);
    } catch (e) {}
  };

  // Check once a minute whether the calendar date has rolled over.
  useEffect(() => {
    const iv = setInterval(() => {
      const now = todayKey();
      if (now !== dateKey) setDateKey(now);
    }, 60000);
    return () => clearInterval(iv);
  }, [dateKey]);

  // Ticks every 5 min so "overdue" task detection and the app badge stay fresh
  // even if the person just leaves the app open without interacting.
  useEffect(() => {
    const iv = setInterval(() => setClockTick((t) => t + 1), 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // If the date changed while the app stayed open, reload today's checklist fresh
  // instead of leaving yesterday's completed tiles showing.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    (async () => {
      let todayData = { tasks: {}, extraItems: [] };
      try {
        const t = await window.storage.get(`daily:${dateKey}`, false);
        if (t) todayData = JSON.parse(t.value);
      } catch (e) {}
      setDailyTasks(todayData.tasks || {});
      setExtraItems(migrateExtraItems(todayData));
      setNotifiedToday(todayData.notifiedToday || []);
      showToast("New day — dabba reset 🍱");
    })();
  }, [dateKey]);

  const persistDaily = async (tasks, items) => {
    try {
      await window.storage.set(`daily:${key}`, JSON.stringify({ tasks, extraItems: items, notifiedToday }), false);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
    const extraKcal = items.reduce((s, i) => s + (i.kcal || 0), 0);
    const extraProteinSum = items.reduce((s, i) => s + (i.protein || 0), 0);
    const completed = TASKS.filter((t) => tasks[t.id]).length;
    const kcal = TASKS.reduce((sum, t) => sum + (tasks[t.id] ? taskKcal(t) : 0), 0) + extraKcal;
    const proteinTotal = TASKS.reduce((sum, t) => sum + (tasks[t.id] ? t.protein : 0), 0) + extraProteinSum;
    const updatedHistory = { ...history, [key]: { completed, total: TASKS.length, kcal, protein: proteinTotal } };
    const cutoff = todayKey(-30);
    Object.keys(updatedHistory).forEach((d) => {
      if (d < cutoff) delete updatedHistory[d];
    });
    setHistory(updatedHistory);
    try {
      await window.storage.set("history", JSON.stringify(updatedHistory), false);
    } catch (e) {}
  };

  const bumpStreakIfNeeded = async () => {
    if (streakData.lastActiveDate === key) return;
    const wasYesterday = streakData.lastActiveDate === todayKey(-1);
    const newStreak = wasYesterday || streakData.streak === 0 ? streakData.streak + 1 : 1;
    const newFreeze = newStreak % 7 === 0 ? true : streakData.freezeAvailable;
    const hitMilestone = MILESTONES.find((m) => m === newStreak && m > streakData.lastMilestone);
    const updated = {
      streak: newStreak,
      lastActiveDate: key,
      freezeAvailable: newFreeze,
      lastMilestone: hitMilestone ? hitMilestone : streakData.lastMilestone,
      bestStreak: Math.max(streakData.bestStreak || 0, newStreak),
    };
    setStreakData(updated);
    try {
      await window.storage.set("streak-data", JSON.stringify(updated), false);
    } catch (e) {}
    if (hitMilestone) {
      setCelebration(hitMilestone);
      setTimeout(() => setCelebration(null), 3200);
    }
  };

  const toggleTask = useCallback(
    async (id) => {
      const nowDone = !dailyTasks[id];
      if (nowDone && navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch (e) {}
      }
      const updated = { ...dailyTasks, [id]: nowDone };
      setDailyTasks(updated);
      await persistDaily(updated, extraItems);
      if (nowDone) {
        showToast("Nice — logged");
        bumpStreakIfNeeded();
        if (showWelcome) dismissWelcome();
      }
    },
    [dailyTasks, extraItems, streakData, key, history, showWelcome]
  );

  const addExtraCal = async () => {
    const val = parseInt(extraInput, 10);
    if (!val || val <= 0) return;
    const newItem = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "Quick add", kcal: val, protein: 0 };
    const updated = [...extraItems, newItem];
    setExtraItems(updated);
    setExtraInput("");
    await persistDaily(dailyTasks, updated);
    showToast(`+${val} kcal added`);
  };

  const removeExtraItem = async (id) => {
    const updated = extraItems.filter((i) => i.id !== id);
    setExtraItems(updated);
    await persistDaily(dailyTasks, updated);
  };

  const setGoal = async () => {
    const val = parseFloat(goalInput);
    if (!val || val <= 0) return;
    setGoalWeight(val);
    setGoalInput("");
    try {
      await window.storage.set("goal-weight", JSON.stringify(val), false);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const logWeight = async () => {
    const val = parseFloat(weightInput);
    if (!val || val <= 0) return;
    const entry = { date: key, weight: val };
    const updated = [...weights.filter((w) => w.date !== key), entry].sort((a, b) => (a.date > b.date ? 1 : -1));
    setWeights(updated);
    setWeightInput("");
    try {
      await window.storage.set("weights", JSON.stringify(updated), false);
      showToast("Weight logged");
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const deleteWeight = async (date) => {
    const updated = weights.filter((w) => w.date !== date);
    setWeights(updated);
    try {
      await window.storage.set("weights", JSON.stringify(updated), false);
      showToast("Entry removed");
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const toggleShopping = async (idx) => {
    const updated = shopping.map((s, i) => (i === idx ? { ...s, checked: !s.checked } : s));
    setShopping(updated);
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const removeShoppingItem = async (idx) => {
    const removed = shopping[idx];
    const updated = shopping.filter((_, i) => i !== idx);
    setShopping(updated);
    setDeletedShoppingItem({ item: removed, idx });
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const undoRemoveShoppingItem = async () => {
    if (!deletedShoppingItem) return;
    const { item, idx } = deletedShoppingItem;
    const updated = [...shopping];
    updated.splice(Math.min(idx, updated.length), 0, item);
    setShopping(updated);
    setDeletedShoppingItem(null);
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
    } catch (e) {}
  };

  useEffect(() => {
    if (!deletedShoppingItem) return;
    const t = setTimeout(() => setDeletedShoppingItem(null), 5000);
    return () => clearTimeout(t);
  }, [deletedShoppingItem]);

  const clearBoughtItems = async () => {
    const updated = shopping.filter((s) => !s.checked);
    const removedCount = shopping.length - updated.length;
    setShopping(updated);
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
      showToast(`Cleared ${removedCount} bought item${removedCount === 1 ? "" : "s"}`);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const addManualShoppingItem = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const existingIdx = shopping.findIndex((s) => s.item.toLowerCase() === trimmed.toLowerCase());
    let updated;
    if (existingIdx !== -1) {
      updated = shopping.map((s, i) => (i === existingIdx ? { ...s, qty: (s.qty || 1) + 1, checked: false } : s));
      showToast(`Bumped to ×${updated[existingIdx].qty}`);
    } else {
      updated = [...shopping, { item: trimmed, checked: false, qty: 1 }];
      showToast("Added to list");
    }
    setShopping(updated);
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const updateShoppingQty = async (idx, delta) => {
    const updated = shopping.map((s, i) => (i === idx ? { ...s, qty: Math.max(1, (s.qty || 1) + delta) } : s));
    setShopping(updated);
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
    } catch (e) {}
  };

  const removeFromPantry = async (itemName) => {
    const updated = pantryItems.filter((p) => p.name.toLowerCase() !== itemName.toLowerCase());
    setPantryItems(updated);
    try {
      await window.storage.set("pantry-items", JSON.stringify(updated), false);
      showToast(`Moved "${itemName}" to need-to-buy`);
    } catch (e) {}
  };

  const formatShoppingItemLine = (s) => `• ${s.item}${(s.qty || 1) > 1 ? ` (×${s.qty})` : ""}`;

  const shareShoppingList = async (items) => {
    if (!items.length) {
      showToast("Nothing to share");
      return;
    }
    const text = `Shopping list — Today's Dabba\n\n${items.map(formatShoppingItemLine).join("\n")}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // user cancelled the share sheet — not an error
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard");
      } catch (e) {
        showToast("Couldn't copy — try again");
      }
    }
  };

  const copyShoppingList = async (items) => {
    if (!items.length) {
      showToast("Nothing to copy");
      return;
    }
    const text = `Shopping list — Today's Dabba\n\n${items.map(formatShoppingItemLine).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("List copied");
    } catch (e) {
      showToast("Couldn't copy — try again");
    }
  };

  // Rough grocery-aisle grouping so the "need to buy" list reads like a real shopping list.
  const AISLE_KEYWORDS = {
    Produce: ["onion", "tomato", "potato", "garlic", "ginger", "spinach", "cauliflower", "okra", "banana", "lemon", "carrot", "pepper", "chilli", "chili", "coriander", "mint", "cabbage", "vegetable", "fruit"],
    "Dairy & Eggs": ["milk", "cheese", "dahi", "yogurt", "curd", "butter", "ghee", "paneer", "cream", "egg"],
    "Meat & Seafood": ["chicken", "fish", "mutton", "lamb", "keema", "prawn", "meat"],
    Bakery: ["bread", "bun", "parantha", "paratha", "tortilla"],
    "Pantry & Grains": ["rice", "dal", "atta", "flour", "besan", "noodles", "pasta", "oats", "cereal", "sugar", "salt", "oil", "spice", "masala", "jaggery", "peanut butter", "honey"],
    Frozen: ["frozen"],
  };
  function getAisle(itemName) {
    const n = itemName.toLowerCase();
    for (const [aisle, keywords] of Object.entries(AISLE_KEYWORDS)) {
      if (keywords.some((k) => n.includes(k))) return aisle;
    }
    return "Other";
  }
  const AISLE_ORDER = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Bakery", "Pantry & Grains", "Frozen", "Other"];

  const addRecipeIngredientsToShopping = async (recipe) => {
    const existingNames = new Set(shopping.map((s) => s.item.toLowerCase()));
    const toAdd = (recipe.ingredients || []).filter((ing) => !existingNames.has(ing.toLowerCase())).map((item) => ({ item, checked: false, qty: 1 }));
    if (!toAdd.length) {
      showToast("Already on your list");
      return;
    }
    const updated = [...shopping, ...toAdd];
    setShopping(updated);
    try {
      await window.storage.set("shopping", JSON.stringify(updated), false);
      showToast(`Added ${toAdd.length} item${toAdd.length > 1 ? "s" : ""}`);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const extractJson = (text) => {
    const cleaned = text.replace(/```json|```/g, "");
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no JSON object found in response: " + cleaned.slice(0, 200));
    return JSON.parse(match[0]);
  };

  const AI_MODEL = "claude-haiku-4-5-20251001";

  function friendlyApiError(status, errType) {
    if (status === 401) return "Your Claude API key looks invalid — check it in ⚙️ Settings.";
    if (status === 402) return "Your Anthropic account needs credit — add some at console.anthropic.com.";
    if (status === 429) return "You've hit your Claude rate limit for now — try again in a minute.";
    if (status === 529) return "Anthropic's servers are overloaded right now — try again shortly.";
    if (status === 413) return "That request was too large — try a shorter description or a smaller photo.";
    if (status === 400) return "That request didn't go through — try rephrasing.";
    return `Claude API error (${status}) — try again in a moment.`;
  }

  // Shared low-level call with retry/backoff for transient failures (429 rate limit,
  // honoring Retry-After; 529 overload, exponential backoff + jitter). Used by all
  // three API-calling functions below so this hardening only needs to live in one place.
  async function claudeRequest(body, { retries = 2 } = {}) {
    if (!apiKey) {
      const err = new Error("No Claude API key set — add one in ⚙️ Settings.");
      err.noKey = true;
      throw err;
    }
    let attempt = 0;
    while (true) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      });
      if (response.ok) return response.json();

      const retryable = response.status === 429 || response.status === 529;
      if (retryable && attempt < retries) {
        const retryAfterHeader = response.headers.get("retry-after");
        const waitMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 300;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        attempt++;
        continue;
      }

      let errType = null;
      try {
        const errJson = await response.json();
        errType = errJson && errJson.error && errJson.error.type;
      } catch (e) {}
      const err = new Error(friendlyApiError(response.status, errType));
      err.status = response.status;
      throw err;
    }
  }

  const callClaude = async (promptText) => {
    const data = await claudeRequest({
      model: AI_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: promptText }],
    });
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return extractJson(text);
  };

  const callClaudeWithSearch = async (promptText) => {
    const data = await claudeRequest({
      model: AI_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: promptText }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    });
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return extractJson(text);
  };

  const searchFoodLog = async () => {
    if (!foodLogQuery.trim()) return;
    setFoodLogLoading(true);
    setFoodLogError("");
    setFoodLogNotice("");
    setFoodLogResult(null);
    const query = foodLogQuery.trim();

    if (apiKey) {
      try {
        const searchPrompt = `The person ate or drank this: "${query}". If this names a specific restaurant or chain item (e.g. Tim Hortons, McDonald's, Starbucks, Domino's), search the web for that chain's official nutrition information for the specific item and size mentioned, adjusting for any modifications mentioned (e.g. "extra cream", "no sugar", "large", "double patty"). If it's a home-cooked or generic food with no chain named, skip searching and just estimate. Once done, respond with a JSON object and nothing else — no closing remarks. Exact shape: {"name": "concise name including size/mods", "kcal": number, "protein": number, "source": "short string, e.g. 'Tim Hortons official nutrition info' or 'estimated, no official source'"}.`;
        const searchedResult = await callClaudeWithSearch(searchPrompt);
        if (searchedResult && typeof searchedResult.kcal === "number") {
          setFoodLogResult(searchedResult);
          setFoodLogLoading(false);
          return;
        }
      } catch (e) {
        setFoodLogNotice((e && e.message ? e.message : "Live lookup failed") + " — showing a rough estimate instead.");
      }
    }

    // Fallback: instant offline estimate (used when there's no API key, or the live call failed).
    const localEstimate = estimateFoodLocally(query);
    setFoodLogResult(localEstimate);
    setFoodLogLoading(false);
  };

  const addFoodLogToToday = async () => {
    if (!foodLogResult) return;
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: foodLogResult.name,
      kcal: Math.round(foodLogResult.kcal),
      protein: Math.round(foodLogResult.protein || 0),
    };
    const updated = [...extraItems, newItem];
    setExtraItems(updated);
    await persistDaily(dailyTasks, updated);
    showToast(`+${newItem.kcal} kcal logged`);
    setFoodLogResult(null);
    setFoodLogQuery("");
  };

  const callClaudeVision = async (base64Data, mediaType, promptText) => {
    const data = await claudeRequest({
      model: AI_MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
            { type: "text", text: promptText },
          ],
        },
      ],
    });
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return extractJson(text);
  };

  const handlePhotoSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    setFoodLogError("");
    setFoodLogResult(null);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Couldn't read image"));
        reader.readAsDataURL(file);
      });
      const prompt = `Look at this photo of food or a drink. Identify what it is and estimate calories and protein for the visible portion, accounting for portion size shown. Respond with a JSON object and nothing else — no explanation before or after. Exact shape: {"name": "concise description of what's in the photo", "kcal": number, "protein": number, "source": "estimated from photo"}.`;
      const result = await callClaudeVision(base64, file.type || "image/jpeg", prompt);
      if (!result || typeof result.kcal !== "number") throw new Error("bad shape");
      setFoodLogResult(result);
    } catch (err) {
      setFoodLogError(err && err.message ? err.message : "Couldn't read that photo — try a clearer shot or search by name instead.");
    }
    setPhotoLoading(false);
    e.target.value = "";
  };

  const openRemix = (recipe) => {
    setRemixTarget(recipe);
    setRemixResult(null);
    setRemixError("");
    setRemixInstruction("");
    setRemixOpen(true);
  };

  const runRemix = async (instruction) => {
    if (!remixTarget || !instruction.trim()) return;
    setRemixLoading(true);
    setRemixError("");
    setRemixResult(null);
    try {
      const prompt = `Here is a recipe:\nName: ${remixTarget.name}\nIngredients: ${(remixTarget.ingredients || []).join(", ")}\nSteps: ${(remixTarget.steps || []).join(" | ")}\n\nRemix it according to this instruction: "${instruction.trim()}". Keep it beginner-friendly and, unless the instruction says otherwise, keep it calorie-dense (this is for someone trying to gain weight). Respond with ONLY a JSON object, no markdown fences, no preamble, exact shape: {"name": "new name reflecting the change", "cal": "approx calorie string", "category": "one of: curry, noodles, sandwich, egg, drink, sweet, other", "ingredients": ["string", "..."], "steps": ["step", "..."]}.`;
      const result = await callClaude(prompt);
      const normalized = normalizeRecipe(result);
      if (!normalized) throw new Error("bad shape");
      setRemixResult(normalized);
    } catch (e) {
      setRemixError(e && e.message && e.message !== "bad shape" ? e.message : "Couldn't remix that — try a simpler instruction or try again.");
    }
    setRemixLoading(false);
  };

  const generateMealPlan = async () => {
    setPlanError("");
    setPlanNotice("");
    setPlanResult(null);

    if (apiKey) {
      setPlanLoading(true);
      try {
        const haveItems = pantryItems.filter((p) => p.selected).map((p) => p.name);
        const pantryList = haveItems.length ? haveItems.join(", ") : PANTRY_DEFAULT.slice(0, 8).join(", ");
        const prompt = `Plan 3 days of meals for someone underweight trying to gain weight, aiming for roughly ${calorieTarget} kcal and ${proteinTarget}g protein per day. They're a beginner cook with about 30-45 min for one real cook session per day, using mostly: ${pantryList}. For each day give a short breakfast, lunch, and dinner idea (just a concise dish name, 2-6 words, not full steps). Respond with ONLY a JSON object, no markdown fences, no preamble, exact shape: {"days": [{"day": "Day 1", "breakfast": "string", "lunch": "string", "dinner": "string"}, {"day": "Day 2", ...}, {"day": "Day 3", ...}]}.`;
        const result = await callClaude(prompt);
        if (result && Array.isArray(result.days)) {
          setPlanResult(result.days);
          setPlanLoading(false);
          return;
        }
      } catch (e) {
        setPlanNotice((e && e.message ? e.message : "Live planning failed") + " — showing a plan from your recipe library instead.");
      }
      setPlanLoading(false);
    }

    const days = generateMealPlanOffline();
    setPlanResult(days);
  };

  const askWhatToEatNow = async () => {
    setNowError("");
    setNowNotice("");
    const previousName = nowResult ? nowResult.name : null;

    if (apiKey) {
      setNowLoading(true);
      try {
        const hour = new Date().getHours();
        const timeOfDay = hour < 11 ? "morning" : hour < 16 ? "afternoon" : hour < 20 ? "evening" : "late night";
        const remaining = Math.max(0, calorieTarget - totalCalories);
        const doneToday = TASKS.filter((t) => dailyTasks[t.id]).map((t) => t.label);
        const haveItems = pantryItems.filter((p) => p.selected).map((p) => p.name);
        const pantryList = haveItems.length ? haveItems.join(", ") : PANTRY_DEFAULT.slice(0, 8).join(", ");
        const prompt = `It's ${timeOfDay}. The person is underweight and trying to gain weight, with about ${remaining} kcal left to hit today's target. So far today they've completed: ${doneToday.length ? doneToday.join(", ") : "nothing yet"}. They have roughly these ingredients available: ${pantryList}. Suggest ONE specific thing to eat or drink right now that fits the time of day and helps close the calorie gap, and briefly explain why in one short sentence. Respond with ONLY a JSON object, no markdown fences, no preamble, exact shape: {"name": "concise dish/drink name", "why": "one short sentence", "kcal": number}.`;
        const result = await callClaude(prompt);
        if (result && result.name) {
          setNowResult(result);
          setNowLoading(false);
          return;
        }
      } catch (e) {
        setNowNotice((e && e.message ? e.message : "Live suggestion failed") + " — picking from your recipe library instead.");
      }
      setNowLoading(false);
    }

    const result = suggestEatNowOffline(previousName);
    setNowResult(result);
  };

  const addNowResultToToday = async () => {
    if (!nowResult) return;
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: nowResult.name,
      kcal: Math.round(nowResult.kcal || 0),
      protein: 0,
    };
    const updated = [...extraItems, newItem];
    setExtraItems(updated);
    await persistDaily(dailyTasks, updated);
    showToast(`+${newItem.kcal} kcal logged`);
    setNowResult(null);
  };

  const jumpToRecipeSearch = (name) => {
    setTab("recipes");
    setSearchQuery(name);
    setTimeout(() => searchRecipe(), 50);
  };

  const browseMealDbCategory = async (cat) => {
    setMealdbCategory(cat);
    setMealdbBrowseLoading(true);
    setMealdbError("");
    setMealdbBrowseResults([]);
    setMealdbPreview(null);
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`);
      const d = await r.json();
      setMealdbBrowseResults(d.meals || []);
    } catch (e) {
      setMealdbError("Couldn't load that category — check your connection and try again.");
    }
    setMealdbBrowseLoading(false);
  };

  const importMealDbRecipe = async (id) => {
    setMealdbDetailLoading(true);
    setMealdbError("");
    setMealdbPreview(null);
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const d = await r.json();
      const meal = d.meals && d.meals[0];
      if (!meal) throw new Error("not found");
      setMealdbPreview(parseMealDbRecipe(meal));
    } catch (e) {
      setMealdbError("Couldn't load that recipe — try again.");
    }
    setMealdbDetailLoading(false);
  };

  const searchRecipe = async () => {
    if (!searchQuery.trim()) return;
    setSearchError("");
    setSearchNotice("");
    setSearchResult(null);
    setSearchQuality(null);
    const query = searchQuery.trim();
    const queryLower = query.toLowerCase();

    // Tier 1: check recipes you've already saved — instant, no network, respects
    // anything you've customized (e.g. a remix) under that name.
    const savedMatch =
      savedRecipes.find((r) => r.name.toLowerCase() === queryLower) ||
      savedRecipes.find((r) => r.name.toLowerCase().includes(queryLower) || queryLower.includes(r.name.toLowerCase()));
    if (savedMatch) {
      setSearchResult(savedMatch);
      setSearchQuality("saved");
      return;
    }

    // Tier 2: live AI generation (if a key is set) — most flexible, tailored to the
    // exact request including any modifications mentioned.
    if (apiKey) {
      setSearchLoading(true);
      try {
        const prompt = `You are a recipe assistant for a complete beginner cook who is underweight and trying to gain weight, so recipes should lean calorie-dense (extra ghee/butter/cheese where it fits naturally). Give one recipe for: "${query}". Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape: {"name": "string", "cal": "approx calorie string like ~600-650 cal", "category": "one of: curry, noodles, sandwich, egg, drink, sweet, other", "ingredients": ["short ingredient name", "..."], "steps": ["beginner-friendly step with rough timing", "..." ]} with 4-7 steps.`;
        const recipe = await callClaude(prompt);
        const normalized = normalizeRecipe(recipe);
        if (normalized) {
          setSearchResult(normalized);
          setSearchQuality("live");
          setSearchLoading(false);
          return;
        }
      } catch (e) {
        setSearchNotice((e && e.message ? e.message : "Live search failed") + " — checking a wider recipe database instead.");
      }
      setSearchLoading(false);
    }

    // Tier 3: TheMealDB's live recipe search — hundreds of real recipes with full
    // instructions, and critically, this needs no Anthropic key at all, so it's the
    // main safety net when there's no key or the AI call failed. TheMealDB's search is
    // picky about exact name matches, so if the full phrase finds nothing, retry with
    // just the last significant word (usually the core dish/protein, e.g. "chicken" in
    // "butter chicken") before giving up to the offline library.
    setSearchLoading(true);
    try {
      const tryMealDbSearch = async (term) => {
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`);
        const d = await r.json();
        return d && d.meals && d.meals[0] ? d.meals[0] : null;
      };

      let meal = await tryMealDbSearch(query);
      if (!meal) {
        const words = query.trim().split(/\s+/).filter((w) => w.length > 2);
        const coreWord = words[words.length - 1];
        if (coreWord && coreWord.toLowerCase() !== query.trim().toLowerCase()) {
          meal = await tryMealDbSearch(coreWord);
        }
      }
      if (meal) {
        setSearchResult(parseMealDbRecipe(meal));
        setSearchQuality("mealdb");
        setSearchLoading(false);
        return;
      }
    } catch (e) {
      // No connection or the API is down — fall through to the guaranteed offline match.
    }
    setSearchLoading(false);

    // Tier 4: guaranteed instant match from the built-in 68-recipe library — works
    // fully offline, always returns something.
    const offlineMatch = searchRecipeOffline(query);
    if (offlineMatch) {
      setSearchResult(offlineMatch.recipe);
      setSearchQuality(offlineMatch.quality);
    } else {
      setSearchError("No match found anywhere — try a different search term, or browse the library below.");
    }
  };

  const togglePantryItem = async (idx) => {
    const updated = pantryItems.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p));
    setPantryItems(updated);
    try {
      await window.storage.set("pantry-items", JSON.stringify(updated), false);
    } catch (e) {}
  };

  const addPantryItem = async () => {
    const trimmed = newPantryItem.trim();
    if (!trimmed) return;
    if (pantryItems.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast("Already in your pantry");
      setNewPantryItem("");
      return;
    }
    const updated = [...pantryItems, { name: trimmed, selected: true }];
    setPantryItems(updated);
    setNewPantryItem("");
    try {
      await window.storage.set("pantry-items", JSON.stringify(updated), false);
    } catch (e) {}
  };

  const suggestFromPantry = async () => {
    const selected = pantryItems.filter((p) => p.selected).map((p) => p.name);
    if (!selected.length) {
      showToast("Select a few ingredients first");
      return;
    }
    setSuggestError("");
    setSuggestNotice("");
    setSuggestions([]);

    if (apiKey) {
      setSuggestLoading(true);
      try {
        const prompt = `Suggest exactly 2 beginner-friendly, calorie-dense recipes (for someone underweight trying to gain weight) built primarily around these ingredients: ${selected.join(
          ", "
        )}. You may assume basic staples (salt, oil, water, spices) are also available. Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape: [{"name": "string", "cal": "approx calorie string", "category": "one of: curry, noodles, sandwich, egg, drink, sweet, other", "ingredients": ["string", "..."], "steps": ["short beginner step", "..."]}] with 4-6 steps each. Keep the whole response concise.`;
        const recipes = await callClaude(prompt);
        const list = Array.isArray(recipes) ? recipes : [recipes];
        const normalized = list.map(normalizeRecipe).filter(Boolean);
        if (normalized.length) {
          setSuggestions(normalized);
          setSuggestLoading(false);
          return;
        }
      } catch (e) {
        setSuggestNotice((e && e.message ? e.message : "Live suggestion failed") + " — showing matches from your recipe library instead.");
      }
      setSuggestLoading(false);
    }

    const offlineMatches = suggestFromPantryOffline(selected);
    setSuggestions(offlineMatches);
  };

  const saveRecipe = async (recipe) => {
    const exists = savedRecipes.some((r) => r.name.toLowerCase() === recipe.name.toLowerCase());
    if (exists) {
      showToast("Already saved");
      return;
    }
    const updated = [...savedRecipes, recipe];
    setSavedRecipes(updated);
    try {
      await window.storage.set("custom-recipes", JSON.stringify(updated), false);
      showToast("Saved to My Recipes");
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const removeSavedRecipe = async (name) => {
    const updated = savedRecipes.filter((r) => r.name !== name);
    setSavedRecipes(updated);
    try {
      await window.storage.set("custom-recipes", JSON.stringify(updated), false);
    } catch (e) {}
  };

  const dismissHealthNudge = async () => {
    const now = Date.now();
    setHealthNudgeDismissedAt(now);
    try {
      await window.storage.set("health-nudge-dismissed", JSON.stringify(now), false);
    } catch (e) {}
  };

  const saveTargets = async () => {
    const newCal = parseInt(calorieTargetInput, 10) || calorieTarget;
    const newProtein = parseInt(proteinTargetInput, 10) || proteinTarget;
    setCalorieTarget(newCal);
    setProteinTarget(newProtein);

    const newOverrides = {};
    TASKS.forEach((t) => {
      const v = parseInt(taskKcalInputs[t.id], 10);
      if (!isNaN(v) && v >= 0) newOverrides[t.id] = v;
    });
    setTaskOverrides(newOverrides);

    const newApiKey = apiKeyInput.trim() ? apiKeyInput.trim() : apiKey;
    setApiKey(newApiKey);

    setCalorieTargetInput("");
    setProteinTargetInput("");
    setApiKeyInput("");
    setShowSettings(false);
    try {
      await window.storage.set("targets", JSON.stringify({ calorieTarget: newCal, proteinTarget: newProtein }), false);
      await window.storage.set("task-overrides", JSON.stringify(newOverrides), false);
      await window.storage.set("api-key", JSON.stringify(newApiKey), false);
      showToast("Settings updated");
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const clearApiKey = async () => {
    setApiKey("");
    try {
      await window.storage.set("api-key", JSON.stringify(""), false);
      showToast("API key removed");
    } catch (e) {}
  };

  const testApiKey = async () => {
    const keyToTest = apiKeyInput.trim() || apiKey;
    if (!keyToTest) {
      setTestKeyStatus("Type a key first");
      return;
    }
    setTestKeyStatus("testing");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": keyToTest,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model: AI_MODEL, max_tokens: 10, messages: [{ role: "user", content: "Say OK" }] }),
      });
      if (response.ok) {
        setTestKeyStatus("✓ Key works");
      } else {
        setTestKeyStatus(friendlyApiError(response.status));
      }
    } catch (e) {
      setTestKeyStatus("Network error — try again");
    }
  };

  const exportBackup = async () => {
    try {
      const payload = await window.storage.exportAll();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateStr = todayKey();
      const a = document.createElement("a");
      a.href = url;
      a.download = `dabba-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const now = Date.now();
      setLastBackupAt(now);
      await window.storage.set("last-backup-at", JSON.stringify(now), false);
      showToast("Backup downloaded");
    } catch (e) {
      showToast("Backup failed — try again");
    }
  };

  const exportCsv = () => {
    try {
      const dates = Array.from(new Set([...weights.map((w) => w.date), ...Object.keys(history)])).sort();
      if (!dates.length) {
        showToast("Nothing to export yet");
        return;
      }
      const weightByDate = {};
      weights.forEach((w) => {
        weightByDate[w.date] = w.weight;
      });
      const rows = [["date", "weight_kg", "calories", "protein_g", "tiles_completed", "tiles_total", "adherence_pct"]];
      dates.forEach((d) => {
        const h = history[d];
        rows.push([
          d,
          weightByDate[d] !== undefined ? weightByDate[d] : "",
          h ? h.kcal : "",
          h ? h.protein || "" : "",
          h ? h.completed : "",
          h ? h.total : "",
          h ? Math.round((h.completed / h.total) * 100) : "",
        ]);
      });
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dabba-history-${todayKey()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("CSV downloaded");
    } catch (e) {
      showToast("Export failed — try again");
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImportError("");
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload || payload.app !== "todays-dabba" || typeof payload.data !== "object") {
        throw new Error("This doesn't look like a Today's Dabba backup file.");
      }
      const confirmed = window.confirm(
        `This will replace your current data with the backup from ${payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : "an unknown date"}. Continue?`
      );
      if (!confirmed) {
        e.target.value = "";
        return;
      }
      const count = await window.storage.importAll(payload);
      showToast(`Restored ${count} items — reloading…`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setImportError(err.message || "Couldn't read that file — make sure it's a Dabba backup.");
    }
    e.target.value = "";
  };

  const taskKcal = (t) => (taskOverrides[t.id] !== undefined ? taskOverrides[t.id] : t.kcal);

  const markRecipeOpened = async (name) => {
    const updated = { ...recipeOpens, [name]: Date.now() };
    setRecipeOpens(updated);
    try {
      await window.storage.set("recipe-opens", JSON.stringify(updated), false);
    } catch (e) {}
  };

  const completedCount = TASKS.filter((t) => dailyTasks[t.id]).length;
  const startWeight = 51.6;
  const latestWeight = weights.length ? weights[weights.length - 1].weight : startWeight;
  const delta = (latestWeight - startWeight).toFixed(1);

  const trendData = useMemo(() => computeTrend(weights), [weights]);
  const chartData = trendData.map((w) => ({ date: w.date.slice(5), weight: w.interpolated ? null : w.weight, trend: w.trend }));
  const weeklyRate = useMemo(() => {
    if (trendData.length < 8) return null;
    const recent = trendData[trendData.length - 1].trend;
    const weekAgo = trendData[Math.max(0, trendData.length - 8)].trend;
    return (recent - weekAgo).toFixed(2);
  }, [trendData]);

  const extraCal = extraItems.reduce((s, i) => s + (i.kcal || 0), 0);
  const extraProtein = extraItems.reduce((s, i) => s + (i.protein || 0), 0);

  const overdueTaskIds = useMemo(() => {
    const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
    return TASKS.filter((t) => !dailyTasks[t.id] && currentHour >= t.reminderHour).map((t) => t.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyTasks, clockTick]);

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      showToast("Notifications aren't supported here");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifyPermission(perm);
      if (perm === "granted") showToast("Reminders enabled");
      else if (perm === "denied") showToast("Reminders blocked — enable in phone Settings if you change your mind");
    } catch (e) {
      showToast("Couldn't enable reminders — try again");
    }
  };

  const markNotified = async (taskId) => {
    const updated = [...notifiedToday, taskId];
    setNotifiedToday(updated);
    try {
      const raw = await window.storage.get(`daily:${key}`, false);
      const current = raw ? JSON.parse(raw.value) : { tasks: dailyTasks, extraItems };
      await window.storage.set(`daily:${key}`, JSON.stringify({ ...current, notifiedToday: updated }), false);
    } catch (e) {}
  };

  // Sync the home-screen app icon badge with how many tasks are overdue — a gentle,
  // non-naggy nudge that doesn't require notification permission or a backend.
  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;
    try {
      if (overdueTaskIds.length > 0) navigator.setAppBadge(overdueTaskIds.length);
      else navigator.clearAppBadge();
    } catch (e) {}
  }, [overdueTaskIds]);

  // Actually fire a notification the first time each task becomes overdue (if permission
  // is granted) — previously reminderHour only fed the badge/pulse and never triggered
  // a real notification at all.
  useEffect(() => {
    if (notifyPermission !== "granted" || !loaded) return;
    const toNotify = overdueTaskIds.filter((id) => !notifiedToday.includes(id));
    if (!toNotify.length) return;
    (async () => {
      for (const id of toNotify) {
        const task = TASKS.find((t) => t.id === id);
        if (!task) continue;
        try {
          if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification("Today's Dabba", { body: `${task.label} is still unchecked — ${task.detail}`, icon: "icon-192.png", tag: `reminder-${id}-${key}` });
          } else if (typeof Notification !== "undefined") {
            new Notification("Today's Dabba", { body: `${task.label} is still unchecked — ${task.detail}` });
          }
        } catch (e) {}
        await markNotified(id);
      }
    })();
  }, [overdueTaskIds, notifyPermission, loaded]);

  const mealCalories = TASKS.reduce((sum, t) => sum + (dailyTasks[t.id] ? taskKcal(t) : 0), 0);
  const totalCalories = mealCalories + extraCal;
  const calPct = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  const mealProtein = TASKS.reduce((sum, t) => sum + (dailyTasks[t.id] ? t.protein : 0), 0);
  const totalProtein = mealProtein + extraProtein;
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));

  const totalCarbs = TASKS.reduce((sum, t) => sum + (dailyTasks[t.id] ? t.carbs : 0), 0);
  const totalFat = TASKS.reduce((sum, t) => sum + (dailyTasks[t.id] ? t.fat : 0), 0);

  const projection = useMemo(() => {
    if (!goalWeight || weeklyRate === null || parseFloat(weeklyRate) <= 0) return null;
    const remaining = goalWeight - latestWeight;
    if (remaining <= 0) return "goal reached";
    const weeksNeeded = remaining / parseFloat(weeklyRate);
    const d = new Date();
    d.setDate(d.getDate() + Math.round(weeksNeeded * 7));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [goalWeight, weeklyRate, latestWeight]);

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        emoji: AMBIENT_EMOJI[i % AMBIENT_EMOJI.length],
        left: Math.round(Math.random() * 92),
        size: 14 + Math.round(Math.random() * 10),
        duration: 14 + Math.round(Math.random() * 10),
        delay: Math.round(Math.random() * 12),
      })),
    []
  );

  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = todayKey(-i);
      const h = history[d];
      days.push({ date: d, ratio: h ? h.completed / h.total : null });
    }
    return days;
  }, [history]);

  const allTimeStats = useMemo(() => {
    const days = Object.values(history);
    if (!days.length) return null;
    const totalDaysLogged = days.length;
    const overallAdherence = Math.round((days.reduce((s, d) => s + d.completed / d.total, 0) / days.length) * 100);
    const dates = Object.keys(history).sort();
    const firstDate = dates[0];
    const daysSinceStart = Math.max(1, Math.round((new Date(todayKey()) - new Date(firstDate)) / 86400000) + 1);
    const weightChange = weights.length >= 2 ? +(weights[weights.length - 1].weight - weights[0].weight).toFixed(1) : null;
    return { totalDaysLogged, overallAdherence, daysSinceStart, weightChange, firstDate };
  }, [history, weights]);

  const weeklyDigest = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = todayKey(-i);
      if (history[d]) days.push(history[d]);
    }
    if (!days.length) return null;
    const avgKcal = Math.round(days.reduce((s, d) => s + d.kcal, 0) / days.length);
    const avgProtein = Math.round(days.reduce((s, d) => s + (d.protein || 0), 0) / days.length);
    const adherence = Math.round((days.reduce((s, d) => s + d.completed / d.total, 0) / days.length) * 100);

    let suggestion = "";
    const rate = weeklyRate !== null ? parseFloat(weeklyRate) : null;
    const hasAdaptiveData = weights.length >= 10;
    if (avgKcal < calorieTarget - 300) {
      suggestion = `You're averaging ${calorieTarget - avgKcal} kcal under target — try logging one more snack or shake most days.`;
    } else if (rate !== null && rate < 0.15 && avgKcal >= calorieTarget - 150) {
      suggestion = hasAdaptiveData
        ? "Trend is flat even though intake looks on track — check the Adaptive target below for a precise number."
        : "Trend is flat even though intake looks on track — consider raising your daily target by ~150-250 kcal.";
    } else if (avgProtein < proteinTarget - 20) {
      suggestion = `Protein's been running low (~${avgProtein}g avg) — an extra egg or palm-sized portion at dinner would help.`;
    } else if (rate !== null && rate >= 0.3) {
      suggestion = hasAdaptiveData
        ? "Gaining faster than your target rate — see the Adaptive target below if you want to dial it in."
        : "Gaining faster than the ~0.4kg/week target — that's fine short-term, just keep an eye on the trend.";
    } else {
      suggestion = "Solid week — current targets look about right, keep the streak going.";
    }
    return { avgKcal, avgProtein, adherence, daysLogged: days.length, suggestion };
  }, [history, weeklyRate, calorieTarget, proteinTarget, weights]);

  // Adaptive TDEE estimate: infers actual maintenance calories from the observed
  // relationship between logged intake and the smoothed weight trend, then suggests
  // a target for the person's chosen gain rate. Needs real data to be trustworthy —
  // per MacroFactor's own documentation, adaptive estimates need several weeks of
  // consistent logging before they're reliable, so this stays "provisional" until then.
  const KCAL_PER_KG = 7700;
  const adaptiveEngine = useMemo(() => {
    if (!weeklyDigest || weeklyRate === null || weights.length < 10) return null;
    const rate = parseFloat(weeklyRate);
    const estimatedTDEE = Math.round(weeklyDigest.avgKcal - (rate * KCAL_PER_KG) / 7);
    const suggestedTarget = Math.round(estimatedTDEE + (desiredGainRate * KCAL_PER_KG) / 7);
    const confident = weights.length >= 14;
    const diff = suggestedTarget - calorieTarget;
    return { estimatedTDEE, suggestedTarget, confident, rate, diff };
  }, [weeklyDigest, weeklyRate, weights, calorieTarget, desiredGainRate]);

  const applyAdaptiveTarget = async () => {
    if (!adaptiveEngine) return;
    const newTarget = adaptiveEngine.suggestedTarget;
    setCalorieTarget(newTarget);
    try {
      await window.storage.set("targets", JSON.stringify({ calorieTarget: newTarget, proteinTarget }), false);
      showToast(`Target updated to ${newTarget} kcal`);
    } catch (e) {
      showToast("Couldn't save — try again");
    }
  };

  const saveGainRate = async (rate) => {
    setDesiredGainRate(rate);
    try {
      await window.storage.set("gain-rate", JSON.stringify(rate), false);
    } catch (e) {}
  };

  const needToBuyCount = useMemo(() => {
    const haveSet = new Set(pantryItems.map((p) => p.name.toLowerCase()));
    return shopping.filter((s) => !s.checked && !haveSet.has(s.item.toLowerCase())).length;
  }, [shopping, pantryItems]);

  useEffect(() => {
    if (!loaded) return;
    if (prevNeedToBuy.current !== null && prevNeedToBuy.current > 0 && needToBuyCount === 0 && shopping.length > 0) {
      setCelebration("shop");
      setTimeout(() => setCelebration(null), 3000);
    }
    prevNeedToBuy.current = needToBuyCount;
  }, [needToBuyCount, loaded]);

  const showHealthNudge = useMemo(() => {
    if (!healthNudgeDismissedAt) return true;
    return Date.now() - healthNudgeDismissedAt > 30 * 24 * 60 * 60 * 1000;
  }, [healthNudgeDismissedAt]);

  const staleRecipeName = useMemo(() => {
    if (RECIPES.length < 2) return null;
    let stalest = null;
    let stalestTime = Infinity;
    RECIPES.forEach((r) => {
      const t = recipeOpens[r.name] || 0;
      if (t < stalestTime) {
        stalestTime = t;
        stalest = r.name;
      }
    });
    return stalest;
  }, [recipeOpens]);

  const toggleFavorite = async (name) => {
    const updated = favorites.includes(name) ? favorites.filter((f) => f !== name) : [...favorites, name];
    setFavorites(updated);
    try {
      await window.storage.set("favorite-recipes", JSON.stringify(updated), false);
    } catch (e) {}
  };

  const saveRecipeNote = async (name, note) => {
    const updated = { ...recipeNotes };
    if (note && note.trim()) updated[name] = note.trim();
    else delete updated[name];
    setRecipeNotes(updated);
    try {
      await window.storage.set("recipe-notes", JSON.stringify(updated), false);
    } catch (e) {}
  };

  // The unified recipe library: built-in + saved recipes, combined, filtered, and sorted.
  // This is the "biggest menu" view — everything you have local access to in one place.
  const isSavedRecipe = (name) => savedRecipes.some((r) => r.name === name);
  const libraryRecipes = useMemo(() => {
    let list = [...RECIPES, ...savedRecipes];

    if (recipeListSearch.trim()) {
      const q = recipeListSearch.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (recipeFilter !== "all") list = list.filter((r) => r.category === recipeFilter);
    if (recipeSlotFilters.length) list = list.filter((r) => (r.slots || []).some((s) => recipeSlotFilters.includes(s)));
    if (recipeDietFilter !== "all") list = list.filter((r) => inferDiet(r) === recipeDietFilter);

    list = [...list];
    if (recipeSort === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (recipeSort === "cal-desc") {
      list.sort((a, b) => parseCalNumber(b.cal) - parseCalNumber(a.cal));
    } else if (recipeSort === "cal-asc") {
      list.sort((a, b) => parseCalNumber(a.cal) - parseCalNumber(b.cal));
    } else if (recipeSort === "tryme") {
      list.sort((a, b) => (recipeOpens[a.name] || 0) - (recipeOpens[b.name] || 0));
    } else if (recipeSort === "favorites") {
      list.sort((a, b) => (favorites.includes(b.name) ? 1 : 0) - (favorites.includes(a.name) ? 1 : 0));
    }
    return list;
  }, [savedRecipes, recipeListSearch, recipeFilter, recipeSlotFilters, recipeDietFilter, recipeSort, recipeOpens, favorites]);

  const recentlyViewedRecipes = useMemo(() => {
    const allRecipesForLookup = [...RECIPES, ...savedRecipes];
    return Object.entries(recipeOpens)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => allRecipesForLookup.find((r) => r.name === name))
      .filter(Boolean);
  }, [recipeOpens, savedRecipes]);

  const pickSurpriseRecipe = () => {
    const pool = [...RECIPES, ...savedRecipes];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseRecipe(pick);
    markRecipeOpened(pick.name);
  };

  if (!loaded) {
    return (
      <div
        style={{
          background: "radial-gradient(ellipse at top, #241E17 0%, #1C1815 60%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;1,500&display=swap');
          @import url('https://api.fontshare.com/v2/css?f[]=satoshi@500&display=swap');
          @keyframes dabbaSpin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
          @keyframes dotPulse { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
          .load-dot { animation: dotPulse 1.2s ease-in-out infinite; }
        `}</style>
        <Dabba3D size={92} />
        <div style={{ color: PALETTE.textPrimary, fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "0.95rem" }}>Packing your dabba</div>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          <span className="load-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: PALETTE.accent, animationDelay: "0s" }} />
          <span className="load-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: PALETTE.accent, animationDelay: "0.15s" }} />
          <span className="load-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: PALETTE.accent, animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 120% 60% at 20% -10%, #2E2413 0%, transparent 55%), radial-gradient(ellipse 100% 50% at 100% 10%, #24352C 0%, transparent 50%), #1C1815",
        color: PALETTE.textPrimary,
        fontFamily: "'Satoshi', sans-serif",
        paddingBottom: "5.5rem",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap');
        :root {
          --motion-spring: cubic-bezier(.22,1,.36,1);
          --motion-bounce: cubic-bezier(.34,1.56,.64,1);
          --motion-snappy: cubic-bezier(.2,.8,.2,1);
        }
        * { box-sizing: border-box; }
        html { background: ${PALETTE.bg}; scroll-behavior: smooth; }
        body {
          margin: 0;
          background: ${PALETTE.bg};
          overscroll-behavior-y: none;
          -webkit-tap-highlight-color: transparent;
          text-rendering: optimizeLegibility;
        }
        button, input, textarea, select { font: inherit; }
        button { touch-action: manipulation; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 2px solid ${PALETTE.accent};
          outline-offset: 3px;
        }
        ::selection { background: rgba(227,160,8,0.28); color: ${PALETTE.cream}; }
        .dot-texture {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(242,233,220,0.05) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
          z-index: 0;
        }
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          animation: blobDrift 14s ease-in-out infinite;
        }
        @keyframes blobDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(12px, -14px) scale(1.08); }
        }
        .app-header {
          box-shadow: 0 10px 30px rgba(0,0,0,0.22);
          -webkit-backdrop-filter: blur(18px) saturate(1.25);
          backdrop-filter: blur(18px) saturate(1.25);
        }
        .header-action, .streak-chip {
          box-shadow: inset 0 1px rgba(255,255,255,0.035), 0 6px 18px rgba(0,0,0,0.16);
          transition: transform 0.22s var(--motion-spring), border-color 0.22s ease, background 0.22s ease;
        }
        .header-action:active, .streak-chip:active { transform: scale(0.94); }
        .page-stage { min-height: calc(100vh - 9rem); }
        .fade-in { animation: fadeIn 0.42s var(--motion-spring); }
        .pop-in { animation: popIn 0.46s var(--motion-bounce); }
        .sheet-slide-up { animation: sheetSlideUp 0.38s var(--motion-spring); }
        .badge-pulse { animation: badgePulse 2.4s ease-in-out infinite; }
        @keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        @keyframes sheetSlideUp {
          from { opacity: 0; transform: translateY(34px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .page-enter { animation: pageEnterRight 0.42s var(--motion-spring); }
        .page-enter-right { animation: pageEnterRight 0.42s var(--motion-spring); }
        .page-enter-left { animation: pageEnterLeft 0.42s var(--motion-spring); }
        .nav-icon-bounce { animation: navBounce 0.44s var(--motion-bounce); }
        @keyframes navBounce {
          0% { transform: translateY(0) scale(1); }
          45% { transform: translateY(-2px) scale(1.16); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes pageEnterRight {
          from { opacity: 0; transform: translate3d(26px,8px,0) scale(0.988); filter: blur(3px); }
          to { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); }
        }
        @keyframes pageEnterLeft {
          from { opacity: 0; transform: translate3d(-26px,8px,0) scale(0.988); filter: blur(3px); }
          to { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); }
        }
        .check-pop { animation: checkPop 0.46s var(--motion-bounce); }
        .bottom-nav {
          background: rgba(28,24,21,0.84) !important;
          -webkit-backdrop-filter: blur(22px) saturate(1.35);
          backdrop-filter: blur(22px) saturate(1.35);
          box-shadow: 0 -14px 38px rgba(0,0,0,0.28);
        }
        .bottom-nav-inner { isolation: isolate; }
        .nav-active-pill {
          box-shadow: inset 0 1px rgba(255,255,255,0.035), 0 8px 20px rgba(0,0,0,0.18);
        }
        .nav-top-indicator { box-shadow: 0 0 12px rgba(227,160,8,0.55); }
        .nav-btn {
          min-height: 52px;
          border-radius: 13px;
          transition: color 0.22s ease, transform 0.18s var(--motion-spring), opacity 0.22s ease;
        }
        .nav-btn:active { transform: scale(0.9) translateY(1px); }
        .nav-btn.active { color: ${PALETTE.accent}; }
        .nav-icon { transition: transform 0.28s var(--motion-spring), filter 0.24s ease; }
        .nav-btn.active .nav-icon { transform: translateY(-1px) scale(1.06); filter: drop-shadow(0 4px 8px rgba(227,160,8,0.24)); }
        .card-hover {
          position: relative;
          overflow: hidden;
          transition: transform 0.24s var(--motion-spring), box-shadow 0.24s ease, border-color 0.24s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.28), inset 0 1px rgba(255,255,255,0.018);
          transform-style: preserve-3d;
          perspective: 700px;
        }
        .card-hover:active { transform: perspective(700px) rotateX(2deg) scale(0.982); box-shadow: 0 3px 10px rgba(0,0,0,0.3); }
        .tiffin-stack {
          background: linear-gradient(180deg, rgba(37,32,25,0.96), rgba(31,26,20,0.96)) !important;
          box-shadow: 0 18px 42px rgba(0,0,0,0.34), inset 0 1px rgba(255,255,255,0.025);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }
        .tier-btn {
          position: relative;
          overflow: hidden;
          min-height: 70px;
          border: 1px solid transparent !important;
          transition: transform 0.22s var(--motion-spring), background 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease !important;
          transform-style: preserve-3d;
        }
        .tier-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(112deg, transparent 18%, rgba(255,255,255,0.08) 48%, transparent 74%);
          transform: translateX(-115%);
          transition: transform 0.62s var(--motion-spring);
        }
        .tier-btn:active::after { transform: translateX(115%); }
        .tier-btn:not(.is-done) { background: rgba(28,24,21,0.38) !important; border-color: rgba(74,62,44,0.34) !important; }
        .tier-btn.is-done { border-color: rgba(252,235,200,0.12) !important; box-shadow: 0 8px 24px rgba(227,160,8,0.18) !important; }
        .tiffin-tile-3d:active { transform: perspective(700px) rotateX(3deg) scale(0.977); }
        .tile-time {
          border-radius: 999px;
          padding: 0.28rem 0.48rem;
          background: rgba(0,0,0,0.13);
          border: 1px solid rgba(255,255,255,0.035);
        }
        .elevated { box-shadow: 0 12px 34px rgba(0,0,0,0.34), inset 0 1px rgba(255,255,255,0.02); }
        @keyframes dabbaSpin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(0.992);} to { opacity: 1; transform: translateY(0) scale(1);} }
        @keyframes popIn { from { opacity: 0; transform: translateY(8px) scale(0.82);} to { opacity: 1; transform: translateY(0) scale(1);} }

        @keyframes checkPop {
          0% { transform: scale(0.45) rotate(-18deg); opacity: 0; }
          62% { transform: scale(1.24) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420px) rotate(540deg); opacity: 0; }
        }
        @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes overduePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(227,160,8,0); } 50% { box-shadow: 0 0 0 3px rgba(227,160,8,0.25); } }
        .overdue-tile { animation: overduePulse 2.5s ease-in-out infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes steamRise {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          25% { opacity: 0.55; }
          100% { transform: translateY(-22px) scaleX(1.4); opacity: 0; }
        }
        .steam {
          position: absolute;
          top: 6px;
          width: 3px;
          height: 12px;
          background: ${PALETTE.textPrimary};
          border-radius: 2px;
          opacity: 0;
          animation: steamRise 2.4s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(20deg); }
        }
        .mascot-sparkle { position: absolute; color: #E3A008; font-size: 1rem; animation: twinkle 1.6s ease-in-out infinite; }
        @keyframes driftUp {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          8% { opacity: 0.16; }
          92% { opacity: 0.12; }
          100% { transform: translateY(-10vh) rotate(25deg); opacity: 0; }
        }
        .ambient-particle { position: fixed; bottom: 0; pointer-events: none; z-index: 0; filter: grayscale(0.15); }
        .stagger-in { opacity: 0; animation: fadeIn 0.5s var(--motion-spring) forwards; }
        .confetti { position: absolute; top: 0; animation: confettiFall linear forwards; }
        .flame-icon { animation: flicker 1.6s ease-in-out infinite; }
        ::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
          .ambient-particle, .bg-blob, .mascot-sparkle, .steam { display: none !important; }
        }
      `}</style>

      {/* Decorative background layers */}
      <div className="dot-texture" />
      <div className="bg-blob" style={{ top: "-80px", left: "-60px", width: "260px", height: "260px", background: PALETTE.accent, opacity: 0.08 }} />
      <div className="bg-blob" style={{ top: "30%", right: "-90px", width: "220px", height: "220px", background: PALETTE.success, opacity: 0.09 }} />
      <div className="bg-blob" style={{ bottom: "10%", left: "-70px", width: "200px", height: "200px", background: PALETTE.accent2, opacity: 0.07 }} />

      {/* Ambient floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="ambient-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `driftUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Cooking mode */}
      <CookingMode
        recipe={cookingRecipe}
        onClose={() => setCookingRecipe(null)}
        onAddToShopping={addRecipeIngredientsToShopping}
        onMarkMeal={async (taskId) => {
          if (!dailyTasks[taskId]) await toggleTask(taskId);
          showToast(`Logged as today's ${taskId}`);
          setCookingRecipe(null);
        }}
      />

      {/* Meet your mascot — 3D/video showcase, lazy-loaded only when tapped open so it
          never adds weight to normal page loads (the GLB model alone is several MB). */}
      {show3DMascot && (
        <div
          className="fade-in"
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem" }}
          onClick={() => setShow3DMascot(false)}
        >
          <div
            style={{ background: PALETTE.surface, borderRadius: "20px", padding: "1.1rem", maxWidth: "380px", width: "100%", border: `1px solid ${PALETTE.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.05rem" }}>Meet Dabba</div>
              <button onClick={() => setShow3DMascot(false)} title="Close" style={{ background: PALETTE.surfaceDark, border: "none", borderRadius: "999px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={14} color={PALETTE.textMuted} />
              </button>
            </div>

            <div style={{ width: "100%", aspectRatio: "1", borderRadius: "14px", overflow: "hidden", background: PALETTE.bg, marginBottom: "0.9rem" }}>
              {mascotViewMode === "video" ? (
                <video src="mascot-orbit.mp4" autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <model-viewer
                  src="mascot.glb"
                  poster="icon-512.png"
                  auto-rotate={prefersReducedMotion ? undefined : true}
                  camera-controls
                  shadow-intensity="1"
                  exposure="1"
                  style={{ width: "100%", height: "100%", backgroundColor: PALETTE.bg }}
                ></model-viewer>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setMascotViewMode("video")}
                style={{ flex: 1, background: mascotViewMode === "video" ? PALETTE.accent : PALETTE.surfaceDark, border: "none", borderRadius: "10px", padding: "0.6rem", color: mascotViewMode === "video" ? PALETTE.bg : PALETTE.textSecondary, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Cinematic
              </button>
              <button
                onClick={() => setMascotViewMode("3d")}
                style={{ flex: 1, background: mascotViewMode === "3d" ? PALETTE.accent : PALETTE.surfaceDark, border: "none", borderRadius: "10px", padding: "0.6rem", color: mascotViewMode === "3d" ? PALETTE.bg : PALETTE.textSecondary, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Interactive 3D
              </button>
            </div>
            {mascotViewMode === "3d" && <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted, textAlign: "center", marginTop: "0.5rem" }}>Drag to rotate, pinch to zoom</div>}
          </div>
        </div>
      )}

      {/* Day drill-down */}
      {selectedDay && history[selectedDay] && (
        <div style={{ position: "fixed", inset: 0, zIndex: 65, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }} onClick={() => setSelectedDay(null)}>
          <div
            className="pop-in"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#211C15", border: `1px solid ${PALETTE.border}`, borderRadius: "18px", padding: "1.25rem", width: "100%", maxWidth: "320px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.05rem" }}>
                {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <button onClick={() => setSelectedDay(null)} title="Close" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={16} color={PALETTE.textMuted} />
              </button>
            </div>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>
                  {history[selectedDay].completed}/{history[selectedDay].total}
                </div>
                <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>tiers packed</div>
              </div>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>{history[selectedDay].kcal}</div>
                <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>kcal</div>
              </div>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>{history[selectedDay].protein || 0}g</div>
                <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>protein</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remix sheet */}
      {remixOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 68, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setRemixOpen(false)}
        >
          <div
            className="sheet-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#211C15", borderRadius: "20px 20px 0 0", padding: "0.6rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))", width: "100%", maxWidth: "480px", margin: "0 auto", border: `1px solid ${PALETTE.border}`, borderBottom: "none", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -12px 40px rgba(0,0,0,0.4)" }}
          >
            <div style={{ width: "36px", height: "4px", borderRadius: "999px", background: PALETTE.borderLight, margin: "0 auto 0.9rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.1rem" }}>Remix recipe</div>
              <button onClick={() => setRemixOpen(false)} title="Close" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} color={PALETTE.textMuted} />
              </button>
            </div>
            <div style={{ fontSize: "0.8rem", color: PALETTE.textMuted, marginBottom: "0.3rem" }}>{remixTarget && remixTarget.name}</div>
            <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, marginBottom: "1rem" }}>{apiKey ? "Uses your Anthropic API key." : "Needs an API key — add one in ⚙️ Settings."}</div>

            {!remixResult && (
              <>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  {["Make it vegetarian", "Double it", "Make it simpler", "Less spicy", "Make it higher calorie"].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => runRemix(chip)}
                      disabled={remixLoading}
                      style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", padding: "0.4rem 0.75rem", color: PALETTE.textSecondary, fontSize: "0.76rem", fontWeight: 600, cursor: remixLoading ? "default" : "pointer" }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <input
                    type="text"
                    value={remixInstruction}
                    onChange={(e) => setRemixInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runRemix(remixInstruction)}
                    placeholder="or type your own instruction"
                    style={{ flex: 1, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.6rem 0.8rem", color: PALETTE.textPrimary, fontSize: "0.85rem", outline: "none" }}
                  />
                  <button
                    onClick={() => runRemix(remixInstruction)}
                    disabled={remixLoading}
                    style={{ background: PALETTE.accent2, border: "none", borderRadius: "8px", padding: "0.6rem 0.9rem", color: PALETTE.bg, fontWeight: 700, cursor: remixLoading ? "default" : "pointer", display: "flex", alignItems: "center" }}
                  >
                    {remixLoading ? <Loader2 size={15} className="spin" /> : <Shuffle size={15} />}
                  </button>
                </div>
                {remixError && <div style={{ fontSize: "0.78rem", color: PALETTE.error }}>{remixError}</div>}
                {remixLoading && <div style={{ fontSize: "0.8rem", color: PALETTE.textMuted }}>Remixing…</div>}
              </>
            )}

            {remixResult && (
              <div className="fade-in">
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.75rem" }}>
                  <RecipePhoto recipe={remixResult} size={48} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{remixResult.name}</div>
                    <div style={{ fontSize: "0.78rem", color: PALETTE.textMuted }}>{remixResult.cal}</div>
                  </div>
                </div>
                <ol style={{ margin: 0, padding: "0 0 0.9rem 1.1rem", fontSize: "0.85rem", color: PALETTE.textSecondary, lineHeight: 1.6 }}>
                  {remixResult.steps.map((s, si) => (
                    <li key={si} style={{ marginBottom: "0.3rem" }}>
                      {s}
                    </li>
                  ))}
                </ol>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setCookingRecipe(remixResult);
                      setRemixOpen(false);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.accent, border: "none", borderRadius: "8px", padding: "0.55rem 0.85rem", color: PALETTE.bg, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <Play size={13} /> Start cooking
                  </button>
                  <button
                    onClick={async () => {
                      await saveRecipe(remixResult);
                      setRemixOpen(false);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.55rem 0.85rem", color: PALETTE.success, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    <Bookmark size={13} /> Save
                  </button>
                  <button
                    onClick={() => setRemixResult(null)}
                    style={{ background: "transparent", border: "none", color: PALETTE.textMuted, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Try another remix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings sheet */}
      {showSettings && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="sheet-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#211C15",
              borderRadius: "20px 20px 0 0",
              padding: "0.6rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))",
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
              border: `1px solid ${PALETTE.border}`,
              borderBottom: "none",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 -12px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ width: "36px", height: "4px", borderRadius: "999px", background: PALETTE.borderLight, margin: "0 auto 0.9rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.15rem" }}>Settings</div>
              <button onClick={() => setShowSettings(false)} title="Close" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} color={PALETTE.textMuted} />
              </button>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.78rem", color: PALETTE.textMuted }}>Calorie target (kcal/day)</label>
              <input
                type="number"
                value={calorieTargetInput}
                onChange={(e) => setCalorieTargetInput(e.target.value)}
                style={{ width: "100%", marginTop: "0.35rem", background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.9rem", color: PALETTE.textPrimary, fontSize: "0.95rem", outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.78rem", color: PALETTE.textMuted }}>Protein target (g/day)</label>
              <input
                type="number"
                value={proteinTargetInput}
                onChange={(e) => setProteinTargetInput(e.target.value)}
                style={{ width: "100%", marginTop: "0.35rem", background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.9rem", color: PALETTE.textPrimary, fontSize: "0.95rem", outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.78rem", color: PALETTE.textMuted }}>Tiffin tile calories — match what you actually cook</label>
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {TASKS.filter((t) => t.kcal > 0).map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.82rem", color: PALETTE.textPrimary }}>{t.label}</span>
                    <input
                      type="number"
                      value={taskKcalInputs[t.id] ?? ""}
                      onChange={(e) => setTaskKcalInputs((prev) => ({ ...prev, [t.id]: e.target.value }))}
                      style={{ width: "90px", background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.45rem 0.6rem", color: PALETTE.textPrimary, fontSize: "0.85rem", outline: "none", textAlign: "right" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem", background: PALETTE.surfaceDark, borderRadius: "12px", padding: "0.9rem", border: `1px solid ${PALETTE.border}` }}>
              <label style={{ fontSize: "0.78rem", color: PALETTE.textMuted, fontWeight: 600 }}>Reminders</label>
              <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, marginTop: "0.35rem", lineHeight: 1.5 }}>
                Get a notification the first time each tiffin tile goes overdue for the day (needs the app open or backgrounded — iOS doesn't allow true background alarms for web apps).
              </div>
              <button
                onClick={requestNotifications}
                disabled={notifyPermission === "granted"}
                style={{
                  marginTop: "0.6rem",
                  background: notifyPermission === "granted" ? PALETTE.surface : PALETTE.success,
                  border: notifyPermission === "granted" ? `1px solid ${PALETTE.border}` : "none",
                  borderRadius: "8px",
                  padding: "0.5rem 0.9rem",
                  color: notifyPermission === "granted" ? PALETTE.success : PALETTE.textPrimary,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: notifyPermission === "granted" ? "default" : "pointer",
                }}
              >
                {notifyPermission === "granted" ? "✓ Reminders on" : notifyPermission === "denied" ? "Blocked — check phone Settings" : "Enable reminders"}
              </button>
            </div>

            <div style={{ marginBottom: "1.25rem", background: PALETTE.surfaceDark, borderRadius: "12px", padding: "0.9rem", border: `1px solid ${PALETTE.border}` }}>
              <label style={{ fontSize: "0.78rem", color: PALETTE.textMuted, fontWeight: 600 }}>Backup & storage</label>
              <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, marginTop: "0.35rem", lineHeight: 1.5 }}>
                Your data lives only on this device. Since browsers can occasionally clear storage, back it up as a file every so often — especially before clearing Safari history or getting a new phone.
                <br />
                {lastBackupAt ? `Last backup: ${new Date(lastBackupAt).toLocaleDateString()}` : "No backup taken yet"}
                {storageEstimate && storageEstimate.usage !== undefined && (
                  <>
                    {" · "}
                    {(storageEstimate.usage / 1024).toFixed(0)} KB used
                  </>
                )}
                {persistenceGranted && " · protected storage ✓"}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                <button
                  onClick={exportBackup}
                  style={{ flex: 1, background: PALETTE.success, border: "none", borderRadius: "8px", padding: "0.55rem", color: PALETTE.textPrimary, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
                >
                  Export backup
                </button>
                <button
                  onClick={() => importFileRef.current && importFileRef.current.click()}
                  style={{ flex: 1, background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.55rem", color: PALETTE.accent, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
                >
                  Import backup
                </button>
                <input ref={importFileRef} type="file" accept="application/json,.json" onChange={handleImportFile} style={{ display: "none" }} />
              </div>
              {importError && <div style={{ fontSize: "0.7rem", color: PALETTE.error, marginTop: "0.5rem" }}>{importError}</div>}
              <button
                onClick={exportCsv}
                style={{ width: "100%", marginTop: "0.5rem", background: "transparent", border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem", color: PALETTE.textMuted, fontWeight: 600, fontSize: "0.74rem", cursor: "pointer" }}
              >
                Export weight & adherence history as CSV
              </button>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.78rem", color: PALETTE.textMuted }}>Anthropic API key — enables recipe search, remix, and photo logging</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={apiKey ? "•••••••••••••••••••• (saved)" : "sk-ant-..."}
                style={{ width: "100%", marginTop: "0.35rem", background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.9rem", color: PALETTE.textPrimary, fontSize: "0.85rem", outline: "none" }}
              />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  onClick={testApiKey}
                  style={{ background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.45rem 0.8rem", color: PALETTE.textSecondary, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {testKeyStatus === "testing" ? "Testing…" : "Test key"}
                </button>
                {testKeyStatus && testKeyStatus !== "testing" && (
                  <div style={{ fontSize: "0.72rem", color: testKeyStatus.startsWith("✓") ? PALETTE.success : PALETTE.error, alignSelf: "center" }}>{testKeyStatus}</div>
                )}
              </div>
              <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, marginTop: "0.4rem" }}>
                Get one at console.anthropic.com → API Keys. Stored only on this device.
                {apiKey && (
                  <button onClick={clearApiKey} style={{ background: "transparent", border: "none", color: PALETTE.error, fontSize: "0.68rem", marginLeft: "0.5rem", cursor: "pointer", padding: 0 }}>
                    Remove key
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={saveTargets}
              style={{ width: "100%", background: PALETTE.success, border: "none", borderRadius: "12px", padding: "0.8rem", color: PALETTE.textPrimary, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
            >
              Save settings
            </button>
          </div>
        </div>
      )}

      {/* Milestone celebration overlay */}
      {celebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {Array.from({ length: 26 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                width: "8px",
                height: "8px",
                borderRadius: i % 2 === 0 ? "50%" : "2px",
                background: [PALETTE.accent, PALETTE.accent2, PALETTE.success, PALETTE.textPrimary][i % 4],
                animationDuration: `${1.6 + Math.random() * 1.2}s`,
                animationDelay: `${Math.random() * 0.4}s`,
              }}
            />
          ))}
          <div
            className="pop-in"
            style={{
              background: PALETTE.surface,
              border: `1px solid ${PALETTE.accent}`,
              borderRadius: "20px",
              padding: "1.5rem 2rem",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <PartyPopper size={32} color={PALETTE.accent} style={{ marginBottom: "0.5rem" }} />
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 700 }}>
              {celebration === "shop" ? "List cleared! 🛒" : `${celebration}-day streak!`}
            </div>
            <div style={{ fontSize: "0.85rem", color: PALETTE.textSecondary, marginTop: "0.25rem" }}>
              {celebration === "shop" ? "Everything's picked up — ready to cook." : "You're building a real habit here."}
            </div>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <div className="app-header" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(28,24,21,0.86)", backdropFilter: "blur(18px)", borderBottom: `1px solid ${PALETTE.border}`, paddingTop: "calc(env(safe-area-inset-top) + 6px)" }}>
        <div style={{ padding: "1.1rem 1.25rem", maxWidth: "480px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: PALETTE.accent2, fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.4rem" }}>Today's Dabba 🍱</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => {
                setCalorieTargetInput(String(calorieTarget));
                setProteinTargetInput(String(proteinTarget));
                const seeded = {};
                TASKS.forEach((t) => {
                  seeded[t.id] = String(taskKcal(t));
                });
                setTaskKcalInputs(seeded);
                setApiKeyInput(apiKey);
                setShowSettings(true);
              }}
              className="header-action"
              aria-label="Open settings"
              title="Settings"
              style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Settings size={15} color={PALETTE.textMuted} />
            </button>
            <div
              className="streak-chip"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                background: PALETTE.surface,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: "999px",
                padding: "0.4rem 0.8rem",
              }}
            >
              <Flame size={14} color={PALETTE.accent} className="flame-icon" />
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{streakData.streak}</span>
              {streakData.freezeAvailable && streakData.streak > 0 && <ShieldCheck size={13} color={PALETTE.success} />}
            </div>
          </div>
        </div>
      </div>

      {/* Install coaching banner — installing exempts the app from iOS storage eviction */}
      {showInstallBanner && (
        <div
          className="fade-in"
          style={{
            maxWidth: "480px",
            margin: "0.75rem auto 0",
            padding: "0 1.25rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem", background: "#2A2416", border: "1px solid #4A3E1C", borderRadius: "14px", padding: "0.85rem 1rem" }}>
            <span style={{ fontSize: "1.1rem" }}>📲</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", color: "#E8DCC5", lineHeight: 1.5 }}>
                For safer, permanent storage, add this to your home screen: tap the Share icon in Safari → <strong>Add to Home Screen</strong>.
              </div>
              <button onClick={dismissInstallBanner} style={{ marginTop: "0.4rem", background: "transparent", border: "none", color: PALETTE.accent2, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div key={tab} className={`page-stage page-enter page-enter-${slideDirection}`} style={{ maxWidth: "480px", margin: "0 auto", position: "relative", zIndex: 1 }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {tab === "today" && (
          <>
            {showWelcome && (
              <div className="fade-in" style={{ margin: "1.25rem 1.25rem 0" }}>
                <div style={{ background: `linear-gradient(135deg, ${PALETTE.accent2} 0%, ${PALETTE.amberDark} 100%)`, borderRadius: "18px", padding: "1.1rem 1.2rem", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.05rem", color: PALETTE.bg, marginBottom: "0.4rem" }}>Welcome to Today's Dabba 🍱</div>
                  <div style={{ fontSize: "0.82rem", color: PALETTE.bg, opacity: 0.85, lineHeight: 1.5, marginBottom: "0.8rem" }}>
                    Six tiles, one cook session a night. Tap a tile off as you go — everything else (calories, streaks, your recipe library) builds from there.
                  </div>
                  <button onClick={dismissWelcome} style={{ background: PALETTE.bg, border: "none", borderRadius: "999px", padding: "0.5rem 1rem", color: PALETTE.textPrimary, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                    Let's go
                  </button>
                </div>
              </div>
            )}

            {/* Mascot hero */}
            <div style={{ margin: "1.25rem 1.25rem 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: `linear-gradient(135deg, ${PALETTE.surface} 0%, ${PALETTE.surfaceDark} 100%)`,
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: "20px",
                  padding: "1.1rem 1.2rem",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: "-40px", right: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: PALETTE.accent, opacity: 0.06 }} />
                <button
                  onClick={() => {
                    setShow3DMascot(true);
                    setMascotViewMode("video");
                  }}
                  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", position: "relative" }}
                  title="Tap to see Dabba in 3D"
                >
                  <Mascot pct={Math.round((completedCount / TASKS.length) * 100)} />
                  <div
                    className="badge-pulse"
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: PALETTE.accent,
                      border: `2px solid ${PALETTE.surfaceDark}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 2px 8px ${PALETTE.accent}88`,
                    }}
                  >
                    <Box3D size={13} color={PALETTE.bg} strokeWidth={2.4} />
                  </div>
                </button>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.01em" }}>
                    {timeGreeting()}, Abhi
                  </div>
                  <div style={{ fontSize: "0.78rem", color: PALETTE.textMuted, marginTop: "0.25rem", maxWidth: "180px", fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
                    {completedCount === 0 && "Let's get today's dabba packed 🍱"}
                    {completedCount > 0 && completedCount < TASKS.length && `${TASKS.length - completedCount} tier${TASKS.length - completedCount > 1 ? "s" : ""} left today`}
                    {completedCount === TASKS.length && "Fully packed — nice work today! 🎉"}
                  </div>
                </div>
                <div style={{ flexShrink: 0, position: "relative", zIndex: 1, width: "64px", height: "64px" }}>
                  <model-viewer
                    src="mascot.glb"
                    poster="icon-192.png"
                    auto-rotate={prefersReducedMotion ? undefined : true}
                    auto-rotate-delay="0"
                    rotation-per-second="30deg"
                    disable-zoom
                    interaction-prompt="none"
                    style={{ width: "100%", height: "100%", "--poster-color": "transparent", backgroundColor: "transparent" }}
                  ></model-viewer>
                </div>
              </div>
            </div>

            {/* Ring dashboard */}
            <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", justifyContent: "space-around" }}>
              <Ring pct={calPct} color={PALETTE.accent} label="Calories" value={totalCalories} target={calorieTarget} unit=" kcal" />
              <Ring pct={proteinPct} color={PALETTE.accent2} label="Protein" value={totalProtein} target={proteinTarget} unit="g" />
              <Ring pct={Math.round((completedCount / TASKS.length) * 100)} color={PALETTE.success} label="Tiers" value={completedCount} target={TASKS.length} unit="" />
            </div>

            {/* Carb / fat pills */}
            <div style={{ padding: "0.75rem 1.25rem 0", display: "flex", justifyContent: "center", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", padding: "0.35rem 0.8rem" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#D9A75C", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: PALETTE.textSecondary }}>
                  Carbs <strong style={{ color: PALETTE.textPrimary }}>{totalCarbs}g</strong> / {CARB_TARGET}g
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", padding: "0.35rem 0.8rem" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#C97C9C", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: PALETTE.textSecondary }}>
                  Fat <strong style={{ color: PALETTE.textPrimary }}>{totalFat}g</strong> / {FAT_TARGET}g
                </span>
              </div>
            </div>

            {/* What should I eat now */}
            <div style={{ padding: "1.25rem 1.25rem 0" }}>
              {!nowResult && !nowLoading && (
                <button
                  onClick={askWhatToEatNow}
                  className="elevated"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "0.85rem", color: PALETTE.textPrimary, fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                >
                  <Lightbulb size={16} color={PALETTE.accent} /> Not sure what to eat? Ask
                </button>
              )}
              {nowLoading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", color: PALETTE.textMuted, fontSize: "0.85rem" }}>
                  <Loader2 size={16} className="spin" /> Thinking about what's around you…
                </div>
              )}
              {nowError && <div style={{ fontSize: "0.78rem", color: PALETTE.error, textAlign: "center" }}>{nowError}</div>}
              {nowNotice && <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, textAlign: "center" }}>{nowNotice}</div>}
              {nowResult && (
                <div className="pop-in elevated" style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                    <Lightbulb size={15} color={PALETTE.accent} />
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem" }}>{nowResult.name}</div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: PALETTE.textSecondary, marginBottom: "0.3rem" }}>{nowResult.why}</div>
                  <div style={{ fontSize: "0.78rem", color: PALETTE.textMuted, marginBottom: "0.7rem" }}>~{nowResult.kcal} kcal</div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      onClick={addNowResultToToday}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: PALETTE.success, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.textPrimary, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      <Plus size={13} /> Log it
                    </button>
                    <button
                      onClick={() => jumpToRecipeSearch(nowResult.name)}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.accent, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      <ChefHat size={13} /> Get full recipe
                    </button>
                    <button
                      onClick={askWhatToEatNow}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "transparent", border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.textMuted, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      <Shuffle size={12} /> Suggest another
                    </button>
                    <button
                      onClick={() => setNowResult(null)}
                      style={{ background: "transparent", border: "none", color: PALETTE.textMuted, fontSize: "0.78rem", cursor: "pointer" }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hand portion quick add */}
            <div style={{ padding: "1.25rem 1.25rem 0" }}>
              <button
                onClick={() => setShowPortions(!showPortions)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: PALETTE.surface,
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: "14px",
                  padding: "0.8rem 1rem",
                  color: PALETTE.textPrimary,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Quick-add extra food</span>
                <ChevronDown size={16} color={PALETTE.textMuted} style={{ transform: showPortions ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showPortions && (
                <div className="fade-in" style={{ background: PALETTE.surfaceDark, borderRadius: "14px", padding: "0.9rem", marginTop: "0.4rem", border: `1px solid ${PALETTE.border}` }}>
                  <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, marginBottom: "0.5rem" }}>Ate something specific? Search it — chain, size, and extras (e.g. "Tim Hortons medium iced coffee, extra cream"):</div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
                    <input
                      type="text"
                      value={foodLogQuery}
                      onChange={(e) => setFoodLogQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchFoodLog()}
                      placeholder="e.g. McDonald's Big Mac, no cheese"
                      style={{ flex: 1, background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem 0.7rem", color: PALETTE.textPrimary, fontSize: "0.8rem", outline: "none" }}
                    />
                    <button
                      onClick={searchFoodLog}
                      disabled={foodLogLoading}
                      style={{ background: PALETTE.accent2, border: "none", borderRadius: "8px", padding: "0.5rem 0.7rem", color: PALETTE.bg, fontWeight: 700, cursor: foodLogLoading ? "default" : "pointer", display: "flex", alignItems: "center", opacity: foodLogLoading ? 0.7 : 1 }}
                    >
                      {foodLogLoading ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
                    </button>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} style={{ display: "none" }} />
                  <button
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={photoLoading}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      background: PALETTE.surface,
                      border: `1px solid ${PALETTE.border}`,
                      borderRadius: "8px",
                      padding: "0.55rem",
                      color: PALETTE.textSecondary,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: photoLoading ? "default" : "pointer",
                      marginBottom: "0.6rem",
                    }}
                  >
                    {photoLoading ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
                    {photoLoading ? "Reading photo…" : "Or snap a photo of your food"}
                  </button>
                  <div style={{ fontSize: "0.66rem", color: PALETTE.textMutedGreen, marginBottom: "0.6rem", textAlign: "center" }}>{apiKey ? "Uses your Anthropic API key." : "Needs an API key — add one in ⚙️ Settings."}</div>

                  {foodLogError && <div style={{ fontSize: "0.74rem", color: PALETTE.error, marginBottom: "0.6rem" }}>{foodLogError}</div>}
                  {foodLogNotice && <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, marginBottom: "0.6rem" }}>{foodLogNotice}</div>}
                  {foodLogLoading && <div style={{ fontSize: "0.76rem", color: PALETTE.textMuted, marginBottom: "0.6rem" }}>Looking that up live…</div>}
                  {foodLogResult && (
                    <div className="pop-in" style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.8rem", marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: PALETTE.textPrimary }}>{foodLogResult.name}</div>
                      <div style={{ fontSize: "0.78rem", color: PALETTE.accent, marginTop: "0.15rem" }}>
                        {Math.round(foodLogResult.kcal)} kcal{foodLogResult.protein ? ` · ${Math.round(foodLogResult.protein)}g protein` : ""}
                      </div>
                      {foodLogResult.source && <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted, marginTop: "0.15rem" }}>{foodLogResult.source}</div>}
                      <button
                        onClick={addFoodLogToToday}
                        style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.35rem", background: PALETTE.success, border: "none", borderRadius: "8px", padding: "0.45rem 0.75rem", color: PALETTE.textPrimary, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        <Plus size={13} /> Add to today
                      </button>
                    </div>
                  )}

                  <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, marginBottom: "0.5rem" }}>Or just type the calories directly:</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="number"
                      value={extraInput}
                      onChange={(e) => setExtraInput(e.target.value)}
                      placeholder="e.g. 250"
                      style={{ flex: 1, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem 0.7rem", color: PALETTE.textPrimary, fontSize: "0.8rem", outline: "none" }}
                    />
                    <button
                      onClick={addExtraCal}
                      style={{ background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.textPrimary, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Today's logged extras */}
            {extraItems.length > 0 && (
              <div style={{ padding: "1rem 1.25rem 0" }}>
                <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                  Logged today · {extraItems.length} item{extraItems.length > 1 ? "s" : ""}
                </div>
                <div style={{ background: PALETTE.surfaceDark, borderRadius: "14px", border: `1px solid ${PALETTE.border}`, padding: "0.3rem" }}>
                  {extraItems.map((item) => (
                    <div key={item.id} className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.7rem" }}>
                      <div>
                        <div style={{ fontSize: "0.85rem", color: PALETTE.textPrimary }}>{item.name}</div>
                        <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted }}>
                          {item.kcal} kcal{item.protein ? ` · ${item.protein}g protein` : ""}
                        </div>
                      </div>
                      <button onClick={() => removeExtraItem(item.id)} title="Remove item" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.3rem" }}>
                        <X size={14} color={PALETTE.textMuted} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tiffin stack */}
            <div style={{ padding: "1.25rem 1.25rem 0" }}>
              <div className="elevated tiffin-stack" style={{ background: PALETTE.surface, borderRadius: "22px", padding: "0.55rem", border: `1px solid ${PALETTE.border}` }}>
                {TASKS.map((t, i) => {
                  const done = !!dailyTasks[t.id];
                  const overdue = !done && overdueTaskIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      className={`tier-btn stagger-in tiffin-tile-3d${done ? " is-done" : ""}${overdue ? " overdue-tile" : ""}`}
                      onClick={() => toggleTask(t.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        background: done ? `linear-gradient(135deg, ${PALETTE.accent} 0%, ${PALETTE.accent2} 115%)` : "transparent",
                        border: "none",
                        borderRadius: "14px",
                        padding: "0.85rem 0.9rem",
                        marginBottom: i === TASKS.length - 1 ? 0 : "0.35rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.25s ease",
                        animationDelay: `${i * 0.06}s`,
                        boxShadow: done ? "0 2px 12px rgba(227,160,8,0.25)" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: done ? "none" : `2px solid ${PALETTE.borderLight}`,
                          background: done ? PALETTE.bg : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {done && <Check size={16} color={PALETTE.accent} strokeWidth={3} className="check-pop" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem", color: done ? PALETTE.bg : PALETTE.textPrimary }}>{t.label}</div>
                        <div style={{ fontSize: "0.78rem", color: done ? "#3D3115" : PALETTE.textMuted }}>
                          {t.detail}
                          {t.kcal > 0 && <span> · ~{taskKcal(t)} kcal</span>}
                        </div>
                      </div>
                      <div className="tile-time" style={{ fontSize: "0.7rem", fontWeight: 700, color: done ? PALETTE.bg : PALETTE.textMuted, whiteSpace: "nowrap" }}>{t.time}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === "progress" && (
          <div style={{ padding: "1.5rem 1.25rem 0" }}>
            <PageBanner illustration={<GrowthIllustration />} title="Progress" subtitle="Small daily steps, tracked honestly" />

            {showHealthNudge && (
              <div
                className="fade-in"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.7rem",
                  background: "#2A2416",
                  border: "1px solid #4A3E1C",
                  borderRadius: "14px",
                  padding: "0.9rem 1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>🩺</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.82rem", color: "#E8DCC5", lineHeight: 1.5 }}>
                    Gentle reminder: your starting BMI was in the underweight range. A periodic checkup alongside this plan is worth keeping on the calendar.
                  </div>
                  <button
                    onClick={dismissHealthNudge}
                    style={{ marginTop: "0.5rem", background: "transparent", border: "none", color: PALETTE.accent2, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    Got it, remind me in 30 days
                  </button>
                </div>
              </div>
            )}

            {allTimeStats && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  background: `linear-gradient(135deg, ${PALETTE.surface} 0%, ${PALETTE.surfaceDark} 100%)`,
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: "16px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.24)",
                }}
              >
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>{allTimeStats.daysSinceStart}</div>
                  <div style={{ fontSize: "0.64rem", color: PALETTE.textMuted }}>days on the plan</div>
                </div>
                <div style={{ width: "1px", background: PALETTE.border }} />
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Fraunces', serif", color: PALETTE.success }}>{allTimeStats.overallAdherence}%</div>
                  <div style={{ fontSize: "0.64rem", color: PALETTE.textMuted }}>all-time adherence</div>
                </div>
                <div style={{ width: "1px", background: PALETTE.border }} />
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Fraunces', serif", color: allTimeStats.weightChange > 0 ? PALETTE.accent : PALETTE.textPrimary }}>
                    {allTimeStats.weightChange !== null ? `${allTimeStats.weightChange > 0 ? "+" : ""}${allTimeStats.weightChange}kg` : "—"}
                  </div>
                  <div style={{ fontSize: "0.64rem", color: PALETTE.textMuted }}>total change</div>
                </div>
                <div style={{ width: "1px", background: PALETTE.border }} />
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Fraunces', serif", color: PALETTE.accent2 }}>{streakData.bestStreak || 0}</div>
                  <div style={{ fontSize: "0.64rem", color: PALETTE.textMuted }}>best streak</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Scale size={18} color={PALETTE.success} />
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>Weight</h2>
            </div>

            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 600, fontFamily: "'Fraunces', serif" }}>{latestWeight} kg</div>
                <div style={{ fontSize: "0.75rem", color: PALETTE.textMuted }}>current (raw)</div>
              </div>
              <div>
                <div style={{ fontSize: "1.6rem", fontWeight: 600, fontFamily: "'Fraunces', serif", color: delta >= 0 ? PALETTE.success : PALETTE.error }}>
                  {delta >= 0 ? "+" : ""}
                  {delta} kg
                </div>
                <div style={{ fontSize: "0.75rem", color: PALETTE.textMuted }}>since 51.6 kg baseline</div>
              </div>
              {weeklyRate !== null && (
                <div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 600, fontFamily: "'Fraunces', serif", color: PALETTE.accent }}>
                    {weeklyRate >= 0 ? "+" : ""}
                    {weeklyRate}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: PALETTE.textMuted }}>kg/week (trend)</div>
                </div>
              )}
            </div>

            {chartData.length > 1 && (
              <div style={{ marginBottom: "0.5rem" }}>
                <SimpleWeightChart data={chartData} startWeight={startWeight} />
                <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, textAlign: "center", marginTop: "0.25rem" }}>
                  Faint line = daily scale weight (noisy) · Gold line = smoothed trend
                </div>
              </div>
            )}

            {chartData.length <= 1 && (
              <div
                className="fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1.75rem 1rem",
                  background: PALETTE.surfaceDark,
                  borderRadius: "14px",
                  border: `1px dashed ${PALETTE.border}`,
                  marginBottom: "0.5rem",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>⚖️✨</span>
                <div style={{ fontSize: "0.82rem", color: PALETTE.textSecondary }}>Log a few weigh-ins and your trend line will start showing up here.</div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem" }}>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Log today's weight (kg)"
                style={{ flex: 1, background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.9rem", color: PALETTE.textPrimary, fontSize: "0.9rem", outline: "none" }}
              />
              <button
                onClick={logWeight}
                style={{ background: PALETTE.success, border: "none", borderRadius: "10px", padding: "0.7rem 1.1rem", color: PALETTE.textPrimary, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
              >
                <Plus size={16} /> Log
              </button>
            </div>

            {weights.length > 0 && (
              <details style={{ marginTop: "0.6rem" }}>
                <summary style={{ fontSize: "0.75rem", color: PALETTE.textMuted, cursor: "pointer", userSelect: "none" }}>Recent entries ({weights.length}) — tap to edit or remove</summary>
                <div style={{ marginTop: "0.5rem", background: PALETTE.surfaceDark, borderRadius: "12px", border: `1px solid ${PALETTE.border}`, padding: "0.3rem" }}>
                  {[...weights]
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .slice(0, 14)
                    .map((w) => (
                      <div key={w.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.7rem" }}>
                        <span style={{ fontSize: "0.8rem", color: PALETTE.textSecondary }}>{w.date}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{w.weight} kg</span>
                          <button onClick={() => deleteWeight(w.date)} title="Delete entry" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem" }}>
                            <X size={14} color={PALETTE.textMuted} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            )}

            <div style={{ marginTop: "0.85rem" }}>
              {goalWeight ? (
                <div style={{ fontSize: "0.8rem", color: PALETTE.textMuted }}>
                  Goal: <span style={{ color: PALETTE.textPrimary, fontWeight: 600 }}>{goalWeight} kg</span>
                  {projection && projection !== "goal reached" && (
                    <>
                      {" "}
                      · projected around <span style={{ color: PALETTE.accent, fontWeight: 600 }}>{projection}</span>
                    </>
                  )}
                  {projection === "goal reached" && <span style={{ color: PALETTE.success, fontWeight: 600 }}> · reached! 🎉</span>}
                  {!projection && <span> · log a couple weeks of weight to get a projection</span>}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <input
                    type="number"
                    step="0.1"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Set a goal weight (kg)"
                    style={{ flex: 1, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.55rem 0.8rem", color: PALETTE.textPrimary, fontSize: "0.82rem", outline: "none" }}
                  />
                  <button onClick={setGoal} style={{ background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.55rem 0.9rem", color: PALETTE.accent, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>
                    Set goal
                  </button>
                </div>
              )}
            </div>

            {weeklyDigest && (
              <div style={{ marginTop: "1.75rem", background: `linear-gradient(135deg, ${PALETTE.surface} 0%, ${PALETTE.surfaceDark} 100%)`, borderRadius: "16px", padding: "1.1rem", border: `1px solid ${PALETTE.border}`, boxShadow: "0 6px 20px rgba(0,0,0,0.24)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Sparkles size={16} color={PALETTE.accent2} />
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>This week</h2>
                </div>
                <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                  <div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>{weeklyDigest.avgKcal}</div>
                    <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>avg kcal/day</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Fraunces', serif" }}>{weeklyDigest.avgProtein}g</div>
                    <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>avg protein/day</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Fraunces', serif", color: PALETTE.success }}>{weeklyDigest.adherence}%</div>
                    <div style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>adherence</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: PALETTE.textSecondary, lineHeight: 1.5, borderTop: `1px solid ${PALETTE.border}`, paddingTop: "0.75rem" }}>{weeklyDigest.suggestion}</div>
              </div>
            )}

            {adaptiveEngine && (
              <div style={{ marginTop: "0.75rem", background: `linear-gradient(135deg, ${PALETTE.surfaceDark} 0%, ${PALETTE.bg} 100%)`, borderRadius: "16px", padding: "1.1rem", border: `1px solid ${PALETTE.border}`, boxShadow: "0 6px 20px rgba(0,0,0,0.24)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <TrendingUp size={16} color={PALETTE.success} />
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Adaptive target</h2>
                  {!adaptiveEngine.confident && (
                    <span style={{ fontSize: "0.62rem", background: PALETTE.border, color: PALETTE.textMuted, borderRadius: "999px", padding: "0.15rem 0.5rem", fontWeight: 700 }}>PROVISIONAL</span>
                  )}
                </div>
                <div style={{ fontSize: "0.8rem", color: PALETTE.textSecondary, lineHeight: 1.6 }}>
                  Based on your actual intake vs. weight trend, your real maintenance looks like{" "}
                  <strong style={{ color: PALETTE.textPrimary }}>~{adaptiveEngine.estimatedTDEE} kcal/day</strong>. To gain at a steady ~{desiredGainRate} kg/week, your target would be{" "}
                  <strong style={{ color: PALETTE.accent }}>{adaptiveEngine.suggestedTarget} kcal</strong>
                  {Math.abs(adaptiveEngine.diff) < 100 ? " — that's basically where you already are." : `, ${adaptiveEngine.diff > 0 ? "about " + adaptiveEngine.diff + " more" : "about " + Math.abs(adaptiveEngine.diff) + " less"} than your current ${calorieTarget}.`}
                </div>
                {!adaptiveEngine.confident && (
                  <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, marginTop: "0.5rem" }}>Based on {weights.length} weigh-ins so far — gets more reliable past 2 weeks of consistent logging.</div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.7rem" }}>
                  <span style={{ fontSize: "0.68rem", color: PALETTE.textMuted }}>Target rate:</span>
                  {[0.25, 0.35, 0.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => saveGainRate(rate)}
                      style={{
                        background: desiredGainRate === rate ? PALETTE.success : PALETTE.surface,
                        border: `1px solid ${desiredGainRate === rate ? PALETTE.success : PALETTE.border}`,
                        borderRadius: "999px",
                        padding: "0.25rem 0.6rem",
                        color: desiredGainRate === rate ? PALETTE.textPrimary : PALETTE.textMuted,
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {rate} kg/wk
                    </button>
                  ))}
                </div>
                {Math.abs(adaptiveEngine.diff) >= 100 && (
                  <button
                    onClick={applyAdaptiveTarget}
                    style={{ marginTop: "0.7rem", background: PALETTE.success, border: "none", borderRadius: "10px", padding: "0.6rem 1rem", color: PALETTE.textPrimary, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Apply {adaptiveEngine.suggestedTarget} kcal target
                  </button>
                )}
              </div>
            )}

            <div style={{ marginTop: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <PartyPopper size={18} color={PALETTE.accent2} />
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  Badges {streakData.bestStreak > 0 && <span style={{ fontSize: "0.75rem", color: PALETTE.textMuted, fontWeight: 400 }}>· best streak {streakData.bestStreak} days</span>}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                {MILESTONES.map((m) => {
                  const unlocked = (streakData.bestStreak || 0) >= m;
                  const BadgeIcon = { 7: Flame, 14: Sparkles, 30: ShieldCheck, 50: Star, 66: PartyPopper, 100: CheckCircle2 }[m] || Flame;
                  const badgeColor = { 7: PALETTE.accent2, 14: PALETTE.success, 30: PALETTE.accent, 50: PALETTE.accent, 66: PALETTE.accent2, 100: PALETTE.success }[m] || PALETTE.accent;
                  return (
                    <div
                      key={m}
                      title={unlocked ? `Reached at ${m} days` : `Reach a ${m}-day streak to unlock`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.35rem",
                        width: "64px",
                      }}
                    >
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          background: unlocked ? `linear-gradient(150deg, ${badgeColor} 0%, ${PALETTE.amberDark} 100%)` : PALETTE.surface,
                          border: `1px solid ${unlocked ? badgeColor : PALETTE.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: unlocked ? 1 : 0.5,
                          boxShadow: unlocked ? `0 0 0 3px ${PALETTE.bg}, 0 0 14px ${badgeColor}77, inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.25)` : "inset 0 1px 3px rgba(0,0,0,0.3)",
                          position: "relative",
                        }}
                      >
                        <BadgeIcon size={22} color={unlocked ? PALETTE.bg : PALETTE.textMutedBrown} fill={unlocked && (m === 50 || m === 100) ? PALETTE.bg : "none"} />
                        {!unlocked && (
                          <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "18px", height: "18px", borderRadius: "50%", background: PALETTE.surfaceDark, border: `1px solid ${PALETTE.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={PALETTE.textMuted} strokeWidth="2.5">
                              <rect x="5" y="11" width="14" height="9" rx="2" />
                              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: unlocked ? PALETTE.textPrimary : PALETTE.textMutedBrown, fontWeight: unlocked ? 700 : 600 }}>{m}d</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Flame size={18} color={PALETTE.accent} />
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>Last 30 days</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "0.3rem" }}>
                {last30Days.map((d) => {
                  let bg = PALETTE.surface;
                  if (d.ratio !== null) {
                    if (d.ratio >= 1) bg = PALETTE.success;
                    else if (d.ratio >= 0.5) bg = PALETTE.accent;
                    else if (d.ratio > 0) bg = "#8A6A2C";
                    else bg = "#3D2E1C";
                  }
                  return (
                    <button
                      key={d.date}
                      onClick={() => d.ratio !== null && setSelectedDay(d.date)}
                      title={`${d.date}: ${d.ratio === null ? "no data" : Math.round(d.ratio * 100) + "% complete"}`}
                      style={{ aspectRatio: "1", borderRadius: "6px", background: bg, border: `1px solid ${PALETTE.border}`, cursor: d.ratio !== null ? "pointer" : "default", padding: 0 }}
                    />
                  );
                })}
              </div>
              <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, marginTop: "0.5rem" }}>Green = full day · gold = partial · dark = missed</div>
            </div>
          </div>
        )}

        {tab === "recipes" && (
          <div style={{ padding: "1.5rem 1.25rem 0" }}>
            <PageBanner illustration={<ChefIllustration />} title="Recipes" subtitle="Beginner-friendly, always calorie-dense" />

            {/* 3-day meal plan */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <CalendarDays size={18} color={PALETTE.success} />
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>3-day meal plan</h2>
              </div>
              {!planResult && (
                <button
                  onClick={generateMealPlan}
                  disabled={planLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: PALETTE.success, border: "none", borderRadius: "12px", padding: "0.8rem", color: PALETTE.textPrimary, fontSize: "0.88rem", fontWeight: 700, cursor: planLoading ? "default" : "pointer", opacity: planLoading ? 0.7 : 1 }}
                >
                  {planLoading ? <Loader2 size={16} className="spin" /> : <CalendarDays size={16} />}
                  {planLoading ? "Planning your next 3 days…" : "Generate a 3-day plan"}
                </button>
              )}
              {planError && <div style={{ fontSize: "0.78rem", color: PALETTE.error, marginTop: "0.5rem" }}>{planError}</div>}
              {planNotice && <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, marginTop: "0.5rem" }}>{planNotice}</div>}
              {!apiKey && !planResult && (
                <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, marginTop: "0.5rem" }}>Add an API key in ⚙️ Settings for a live, personalized plan instead of your recipe library.</div>
              )}
              {planResult && (
                <div className="fade-in">
                  {planResult.map((d, i) => (
                    <div key={i} style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "0.9rem 1rem", marginBottom: "0.5rem" }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.5rem", color: PALETTE.accent }}>{d.day}</div>
                      {[
                        { label: "Breakfast", val: d.breakfast },
                        { label: "Lunch", val: d.lunch },
                        { label: "Dinner", val: d.dinner },
                      ].map((m) => (
                        <button
                          key={m.label}
                          onClick={() => jumpToRecipeSearch(m.val)}
                          style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", padding: "0.4rem 0", cursor: "pointer", textAlign: "left" }}
                        >
                          <span style={{ fontSize: "0.78rem", color: PALETTE.textMuted, width: "70px", flexShrink: 0 }}>{m.label}</span>
                          <span style={{ fontSize: "0.85rem", color: PALETTE.textPrimary, flex: 1 }}>{m.val}</span>
                          <ChevronRight size={14} color={PALETTE.textMutedBrown} />
                        </button>
                      ))}
                    </div>
                  ))}
                  <button
                    onClick={() => setPlanResult(null)}
                    style={{ width: "100%", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.6rem", color: PALETTE.textMuted, fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    Generate a new plan
                  </button>
                </div>
              )}
            </div>

            {/* Live recipe search */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Search size={18} color={PALETTE.accent2} />
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>Search any recipe</h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchRecipe()}
                placeholder="e.g. butter chicken, protein pancakes…"
                style={{ flex: 1, background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.7rem 0.9rem", color: PALETTE.textPrimary, fontSize: "0.88rem", outline: "none" }}
              />
              <button
                onClick={searchRecipe}
                disabled={searchLoading}
                style={{ background: PALETTE.accent2, border: "none", borderRadius: "10px", padding: "0.7rem 1rem", color: PALETTE.bg, fontWeight: 700, cursor: searchLoading ? "default" : "pointer", display: "flex", alignItems: "center", gap: "0.3rem", opacity: searchLoading ? 0.7 : 1 }}
              >
                {searchLoading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
              </button>
            </div>
            {searchError && <div style={{ fontSize: "0.78rem", color: PALETTE.error, marginBottom: "0.75rem" }}>{searchError}</div>}
            {searchLoading && <div style={{ fontSize: "0.75rem", color: PALETTE.textMuted, marginBottom: "0.5rem" }}>Searching live…</div>}
            {searchNotice && <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, marginBottom: "0.5rem" }}>{searchNotice}</div>}
            {searchResult && (
              <>
                {searchQuality === "live" && <div style={{ fontSize: "0.72rem", color: PALETTE.success, marginBottom: "0.5rem" }}>✓ Live result</div>}
                {searchQuality === "saved" && <div style={{ fontSize: "0.72rem", color: PALETTE.success, marginBottom: "0.5rem" }}>📌 From your saved recipes</div>}
                {searchQuality === "mealdb" && <div style={{ fontSize: "0.72rem", color: PALETTE.success, marginBottom: "0.5rem" }}>✓ Found in the recipe database</div>}
                {searchQuality && !["exact", "live", "saved", "mealdb"].includes(searchQuality) && (
                  <div style={{ fontSize: "0.74rem", color: PALETTE.textMuted, marginBottom: "0.5rem" }}>
                    {searchQuality === "keyword" ? "Closest match from your recipe library:" : "No exact match — closest thing from your library:"}
                  </div>
                )}
                <DynamicRecipeCard recipe={searchResult} onAddToShopping={addRecipeIngredientsToShopping} onSave={saveRecipe} onStartCooking={setCookingRecipe} onRemix={openRemix} />
              </>
            )}
            {!apiKey && (
              <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, marginTop: "0.5rem" }}>Add an API key in ⚙️ Settings for AI-tailored results too, on top of the recipe database search.</div>
            )}

            {/* Browse a bigger recipe library — real recipes with photos, pulled live from TheMealDB */}
            <div style={{ marginTop: "1.75rem" }}>
              <button
                onClick={() => setShowBrowseLibrary(!showBrowseLibrary)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "0.8rem 1rem", color: PALETTE.textPrimary, cursor: "pointer", marginBottom: showBrowseLibrary ? "0.6rem" : 0 }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  <Utensils size={16} color={PALETTE.accent2} /> Browse a bigger recipe library
                </span>
                <ChevronDown size={16} color={PALETTE.textMuted} style={{ transform: showBrowseLibrary ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showBrowseLibrary && (
                <div className="fade-in">
                  <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, marginBottom: "0.6rem" }}>Hundreds of real recipes with photos — pick a category:</div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                    {MEALDB_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => browseMealDbCategory(cat)}
                        style={{
                          background: mealdbCategory === cat ? PALETTE.accent2 : PALETTE.surface,
                          border: `1px solid ${mealdbCategory === cat ? PALETTE.accent2 : PALETTE.border}`,
                          borderRadius: "999px",
                          padding: "0.4rem 0.75rem",
                          color: mealdbCategory === cat ? PALETTE.bg : PALETTE.textSecondary,
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {mealdbBrowseLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: PALETTE.textMuted, fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                      <Loader2 size={15} className="spin" /> Loading {mealdbCategory}…
                    </div>
                  )}
                  {mealdbError && <div style={{ fontSize: "0.78rem", color: PALETTE.error, marginBottom: "0.75rem" }}>{mealdbError}</div>}

                  {mealdbBrowseResults.length > 0 && !mealdbPreview && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      {mealdbBrowseResults.map((m) => (
                        <button
                          key={m.idMeal}
                          onClick={() => importMealDbRecipe(m.idMeal)}
                          style={{ background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "12px", padding: "0.4rem", cursor: "pointer", textAlign: "center" }}
                        >
                          <div style={{ width: "100%", aspectRatio: "1", borderRadius: "8px", overflow: "hidden", marginBottom: "0.35rem" }}>
                            <img src={m.strMealThumb} alt={m.strMeal} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </div>
                          <div style={{ fontSize: "0.68rem", color: PALETTE.textPrimary, lineHeight: 1.3 }}>{m.strMeal}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {mealdbDetailLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: PALETTE.textMuted, fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                      <Loader2 size={15} className="spin" /> Loading recipe…
                    </div>
                  )}
                  {mealdbPreview && (
                    <div className="fade-in">
                      <button
                        onClick={() => setMealdbPreview(null)}
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "transparent", border: "none", color: PALETTE.textMuted, fontSize: "0.76rem", cursor: "pointer", marginBottom: "0.5rem", padding: 0 }}
                      >
                        <ChevronLeft size={14} /> Back to {mealdbCategory}
                      </button>
                      <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, marginBottom: "0.5rem" }}>Calories aren't provided by this source, so they're a rough estimate.</div>
                      <DynamicRecipeCard recipe={mealdbPreview} onAddToShopping={addRecipeIngredientsToShopping} onSave={saveRecipe} onStartCooking={setCookingRecipe} onRemix={openRemix} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filter by what you have */}
            <div style={{ marginTop: "1.75rem" }}>
              <button
                onClick={() => setShowFilter(!showFilter)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "0.8rem 1rem", color: PALETTE.textPrimary, cursor: "pointer", marginBottom: showFilter ? "0.5rem" : 0 }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  <Wand2 size={16} color={PALETTE.success} /> Suggest from what I have
                </span>
                <ChevronDown size={16} color={PALETTE.textMuted} style={{ transform: showFilter ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showFilter && (
                <div className="fade-in" style={{ background: PALETTE.surfaceDark, borderRadius: "14px", padding: "0.9rem", border: `1px solid ${PALETTE.border}` }}>
                  <div style={{ fontSize: "0.7rem", color: PALETTE.textMuted, marginBottom: "0.6rem" }}>Tap a name to use it in a suggestion · tap × to remove it</div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    {pantryItems.map((p, i) => (
                      <div
                        key={p.name + i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          background: p.selected ? PALETTE.success : PALETTE.surface,
                          border: `1px solid ${p.selected ? PALETTE.success : PALETTE.border}`,
                          borderRadius: "999px",
                          padding: "0.4rem 0.5rem 0.4rem 0.75rem",
                        }}
                      >
                        <button
                          onClick={() => togglePantryItem(i)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: p.selected ? PALETTE.textPrimary : PALETTE.textSecondary,
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          {p.name}
                        </button>
                        <button
                          onClick={() => removeFromPantry(p.name)}
                          title="Remove from pantry"
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.1rem", display: "flex", opacity: 0.6 }}
                        >
                          <X size={11} color={p.selected ? PALETTE.textPrimary : PALETTE.textMuted} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <input
                      type="text"
                      value={newPantryItem}
                      onChange={(e) => setNewPantryItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPantryItem()}
                      placeholder="Add an item you have"
                      style={{ flex: 1, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: "8px", padding: "0.5rem 0.7rem", color: PALETTE.textPrimary, fontSize: "0.8rem", outline: "none" }}
                    />
                    <button onClick={addPantryItem} style={{ background: PALETTE.border, border: "none", borderRadius: "8px", padding: "0.5rem 0.8rem", color: PALETTE.textPrimary, fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={suggestFromPantry}
                    disabled={suggestLoading}
                    style={{ width: "100%", background: PALETTE.success, border: "none", borderRadius: "10px", padding: "0.7rem", color: PALETTE.textPrimary, fontWeight: 700, fontSize: "0.85rem", cursor: suggestLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", opacity: suggestLoading ? 0.7 : 1 }}
                  >
                    {suggestLoading ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />}
                    {suggestLoading ? "Thinking…" : "Suggest recipes"}
                  </button>
                  {suggestError && <div style={{ fontSize: "0.78rem", color: PALETTE.error, marginTop: "0.6rem" }}>{suggestError}</div>}
                  {suggestNotice && <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, marginTop: "0.6rem" }}>{suggestNotice}</div>}
                  {!apiKey && (
                    <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, marginTop: "0.6rem" }}>Add an API key in ⚙️ Settings for live, tailored suggestions instead of your recipe library.</div>
                  )}
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                {suggestions.map((r, i) => (
                  <DynamicRecipeCard key={r.name + i} recipe={r} onAddToShopping={addRecipeIngredientsToShopping} onSave={saveRecipe} onStartCooking={setCookingRecipe} onRemix={openRemix} />
                ))}
              </div>
            )}

            {/* Surprise me */}
            <div style={{ marginTop: "1.75rem" }}>
              <button
                onClick={pickSurpriseRecipe}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "14px", padding: "0.8rem", color: PALETTE.textPrimary, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
              >
                <Shuffle size={16} color={PALETTE.accent} /> Surprise me
              </button>
              {surpriseRecipe && (
                <div className="fade-in" style={{ marginTop: "0.6rem" }}>
                  <DynamicRecipeCard
                    recipe={surpriseRecipe}
                    onAddToShopping={addRecipeIngredientsToShopping}
                    onStartCooking={(rec) => {
                      setCookingRecipe(rec);
                      markRecipeOpened(rec.name);
                    }}
                    onRemix={openRemix}
                    isFavorite={favorites.includes(surpriseRecipe.name)}
                    onToggleFavorite={toggleFavorite}
                    note={recipeNotes[surpriseRecipe.name]}
                    onSaveNote={saveRecipeNote}
                  />
                </div>
              )}
            </div>

            {/* Recently viewed */}
            {recentlyViewedRecipes.length > 0 && (
              <div style={{ marginTop: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Clock size={18} color={PALETTE.textMuted} />
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>Recently viewed</h2>
                </div>
                <div style={{ display: "flex", gap: "0.6rem", overflowX: "auto", paddingBottom: "0.4rem" }}>
                  {recentlyViewedRecipes.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => {
                        setCookingRecipe(r);
                        markRecipeOpened(r.name);
                      }}
                      style={{ flexShrink: 0, width: "84px", background: "transparent", border: "none", cursor: "pointer", textAlign: "center" }}
                    >
                      <RecipePhoto recipe={r} size={64} />
                      <div style={{ fontSize: "0.66rem", color: PALETTE.textSecondary, marginTop: "0.3rem", lineHeight: 1.25 }}>{r.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Unified recipe library — everything you have local access to, filterable and sortable */}
            <div style={{ marginTop: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Utensils size={18} color={PALETTE.accent2} />
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>
                  Recipe library <span style={{ fontSize: "0.75rem", color: PALETTE.textMuted, fontWeight: 400 }}>· {libraryRecipes.length}</span>
                </h2>
              </div>

              <input
                type="text"
                value={recipeListSearch}
                onChange={(e) => setRecipeListSearch(e.target.value)}
                placeholder="Filter your library by name…"
                style={{ width: "100%", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.6rem 0.85rem", color: PALETTE.textPrimary, fontSize: "0.82rem", outline: "none", marginBottom: "0.7rem" }}
              />

              <div style={{ fontSize: "0.66rem", color: PALETTE.textMutedGreen, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.3rem 0.15rem" }}>Category</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                {["all", ...Array.from(new Set(RECIPES.map((r) => r.category)))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRecipeFilter(cat)}
                    style={{
                      background: recipeFilter === cat ? PALETTE.accent : PALETTE.surface,
                      border: `1px solid ${recipeFilter === cat ? PALETTE.accent : PALETTE.border}`,
                      borderRadius: "999px",
                      padding: "0.32rem 0.7rem",
                      color: recipeFilter === cat ? PALETTE.bg : PALETTE.textSecondary,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 0.3rem 0.15rem" }}>
                <div style={{ fontSize: "0.66rem", color: PALETTE.textMutedGreen, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Meal (tap multiple)</div>
                {recipeSlotFilters.length > 0 && (
                  <button onClick={() => setRecipeSlotFilters([])} style={{ background: "transparent", border: "none", color: PALETTE.textMuted, fontSize: "0.66rem", cursor: "pointer" }}>
                    Clear
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                {["breakfast", "lunch", "dinner", "snack"].map((slot) => {
                  const active = recipeSlotFilters.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => setRecipeSlotFilters(active ? recipeSlotFilters.filter((s) => s !== slot) : [...recipeSlotFilters, slot])}
                      style={{
                        background: active ? PALETTE.success : PALETTE.surface,
                        border: `1px solid ${active ? PALETTE.success : PALETTE.border}`,
                        borderRadius: "999px",
                        padding: "0.32rem 0.7rem",
                        color: active ? PALETTE.textPrimary : PALETTE.textSecondary,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {active && "✓ "}
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: "0.66rem", color: PALETTE.textMutedGreen, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.3rem 0.15rem" }}>Diet</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                {[
                  { id: "all", label: "All" },
                  { id: "veg", label: "Veg" },
                  { id: "egg", label: "Egg" },
                  { id: "nonveg", label: "Non-veg" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setRecipeDietFilter(d.id)}
                    style={{
                      background: recipeDietFilter === d.id ? PALETTE.accent2 : PALETTE.surface,
                      border: `1px solid ${recipeDietFilter === d.id ? PALETTE.accent2 : PALETTE.border}`,
                      borderRadius: "999px",
                      padding: "0.32rem 0.7rem",
                      color: recipeDietFilter === d.id ? PALETTE.bg : PALETTE.textSecondary,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: "0.66rem", color: PALETTE.textMutedGreen, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.3rem 0.15rem" }}>Sort</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {[
                  { id: "default", label: "Default" },
                  { id: "az", label: "A–Z" },
                  { id: "cal-desc", label: "Calories ↓" },
                  { id: "cal-asc", label: "Calories ↑" },
                  { id: "tryme", label: "Haven't tried" },
                  { id: "favorites", label: "★ Favorites" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setRecipeSort(s.id)}
                    style={{
                      background: recipeSort === s.id ? PALETTE.surface : "transparent",
                      border: `1px solid ${recipeSort === s.id ? PALETTE.accent : PALETTE.border}`,
                      borderRadius: "999px",
                      padding: "0.32rem 0.7rem",
                      color: recipeSort === s.id ? PALETTE.accent : PALETTE.textMuted,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {libraryRecipes.length ? (
                libraryRecipes.map((r, i) => (
                  <DynamicRecipeCard
                    key={r.name + i}
                    recipe={r}
                    onAddToShopping={addRecipeIngredientsToShopping}
                    onRemove={isSavedRecipe(r.name) ? removeSavedRecipe : undefined}
                    onStartCooking={(rec) => {
                      setCookingRecipe(rec);
                      markRecipeOpened(rec.name);
                    }}
                    onOpen={markRecipeOpened}
                    onRemix={openRemix}
                    isFavorite={favorites.includes(r.name)}
                    onToggleFavorite={toggleFavorite}
                    note={recipeNotes[r.name]}
                    onSaveNote={saveRecipeNote}
                    badge={
                      staleRecipeName === r.name && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", background: PALETTE.border, color: PALETTE.accent2, fontSize: "0.62rem", fontWeight: 700, borderRadius: "999px", padding: "0.15rem 0.5rem" }}>
                          <Clock size={10} /> try me
                        </span>
                      )
                    }
                  />
                ))
              ) : (
                <EmptyState illustration={<EmptySearchIllustration />} title="No recipes match those filters" subtitle="Try loosening a filter or clearing the search." />
              )}
            </div>
          </div>
        )}

        {tab === "shop" && (
          <div style={{ padding: "1.5rem 1.25rem 0" }}>
            <PageBanner illustration={<BasketIllustration />} title="Shop" subtitle="Only the real gaps, nothing you already have" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShoppingBasket size={18} color={PALETTE.accent} />
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>Shopping list</h2>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => copyShoppingList(shopping.filter((s) => !s.checked))}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", padding: "0.35rem 0.7rem", color: PALETTE.textMuted, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                >
                  <Copy size={12} /> Copy
                </button>
                <button
                  onClick={() => shareShoppingList(shopping.filter((s) => !s.checked))}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "999px", padding: "0.35rem 0.7rem", color: PALETTE.textMuted, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                >
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>

            {deletedShoppingItem && (
              <div className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: PALETTE.surfaceDark, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.6rem 0.85rem", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: "0.78rem", color: PALETTE.textSecondary }}>Removed "{deletedShoppingItem.item.item}"</span>
                <button onClick={undoRemoveShoppingItem} style={{ background: "transparent", border: "none", color: PALETTE.accent, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                  Undo
                </button>
              </div>
            )}

            {/* Manual add */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.1rem" }}>
              <input
                type="text"
                value={shoppingInput}
                onChange={(e) => setShoppingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addManualShoppingItem(shoppingInput);
                    setShoppingInput("");
                  }
                }}
                placeholder="Add an item (e.g. 2 dozen eggs)"
                style={{ flex: 1, background: PALETTE.surface, border: `1px solid ${PALETTE.border}`, borderRadius: "10px", padding: "0.65rem 0.9rem", color: PALETTE.textPrimary, fontSize: "0.85rem", outline: "none" }}
              />
              <button
                onClick={() => {
                  addManualShoppingItem(shoppingInput);
                  setShoppingInput("");
                }}
                style={{ background: PALETTE.success, border: "none", borderRadius: "10px", padding: "0.65rem 1rem", color: PALETTE.textPrimary, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <Plus size={16} />
              </button>
            </div>

            {(() => {
              const haveSet = new Set(pantryItems.map((p) => p.name.toLowerCase()));
              const needToBuy = shopping.filter((s, i) => !s.checked && !haveSet.has(s.item.toLowerCase())).map((s) => ({ ...s, idx: shopping.indexOf(s) }));
              const alreadyHave = shopping.filter((s) => haveSet.has(s.item.toLowerCase()) && !s.checked).map((s) => ({ ...s, idx: shopping.indexOf(s) }));
              const bought = shopping.filter((s) => s.checked).map((s) => ({ ...s, idx: shopping.indexOf(s) }));

              // Group "need to buy" by rough grocery aisle so it's actually useful in a store.
              const grouped = {};
              needToBuy.forEach((s) => {
                const aisle = getAisle(s.item);
                if (!grouped[aisle]) grouped[aisle] = [];
                grouped[aisle].push(s);
              });

              const renderRow = (s, { showStrike = false, onDelete = null, extraAction = null, showQtyControls = true } = {}) => (
                <div key={s.item + s.idx} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem 0.6rem" }}>
                  <button
                    onClick={() => toggleShopping(s.idx)}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", flex: 1, minWidth: 0 }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        border: s.checked ? "none" : `2px solid ${PALETTE.borderLight}`,
                        background: s.checked ? PALETTE.success : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {s.checked && <Check size={14} color={PALETTE.textPrimary} strokeWidth={3} className="check-pop" />}
                    </div>
                    <span style={{ fontSize: "0.9rem", color: s.checked ? PALETTE.textMutedGreen : PALETTE.textPrimary, textDecoration: showStrike && s.checked ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.item}
                    </span>
                  </button>
                  {showQtyControls && !s.checked ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0, background: PALETTE.surfaceDark, borderRadius: "999px", padding: "0.15rem" }}>
                      <button
                        onClick={() => updateShoppingQty(s.idx, -1)}
                        style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: PALETTE.textMuted, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1 }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: "0.72rem", color: PALETTE.textSecondary, minWidth: "14px", textAlign: "center", fontWeight: 600 }}>{s.qty || 1}</span>
                      <button
                        onClick={() => updateShoppingQty(s.idx, 1)}
                        style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: PALETTE.textMuted, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1 }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    (s.qty || 1) > 1 && <span style={{ fontSize: "0.72rem", color: PALETTE.textMuted, flexShrink: 0 }}>×{s.qty}</span>
                  )}
                  {extraAction}
                  {onDelete && (
                    <button onClick={onDelete} title="Remove from list" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem", flexShrink: 0 }}>
                      <X size={14} color={PALETTE.textMuted} />
                    </button>
                  )}
                </div>
              );

              return (
                <>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.4rem 0.2rem" }}>
                      Need to buy · {needToBuy.length}
                    </div>
                    {needToBuy.length ? (
                      AISLE_ORDER.filter((aisle) => grouped[aisle] && grouped[aisle].length).map((aisle) => (
                        <div key={aisle} style={{ marginBottom: "0.6rem" }}>
                          <div style={{ fontSize: "0.68rem", color: PALETTE.textMutedGreen, fontWeight: 600, margin: "0 0 0.25rem 0.3rem" }}>{aisle}</div>
                          <div style={{ background: PALETTE.surface, borderRadius: "14px", border: `1px solid ${PALETTE.border}`, padding: "0.2rem" }}>
                            {grouped[aisle].map((s) => renderRow(s, { showStrike: true, onDelete: () => removeShoppingItem(s.idx) }))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState illustration={<AllDoneIllustration />} title="Nothing left to buy" subtitle="Your pantry's covered — nice." />
                    )}
                  </div>

                  {alreadyHave.length > 0 && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0.9rem 0 0.4rem 0.2rem" }}>
                        Already in your pantry · {alreadyHave.length}
                      </div>
                      <div style={{ background: PALETTE.surfaceDark, borderRadius: "14px", border: `1px solid ${PALETTE.border}`, padding: "0.2rem", opacity: 0.85 }}>
                        {alreadyHave.map((s) =>
                          renderRow(s, {
                            showStrike: false,
                            onDelete: () => removeShoppingItem(s.idx),
                            extraAction: (
                              <button
                                onClick={() => removeFromPantry(s.item)}
                                title="Actually, I need to buy this"
                                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.2rem", flexShrink: 0 }}
                              >
                                <RotateCcw size={13} color={PALETTE.textMuted} />
                              </button>
                            ),
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {bought.length > 0 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.9rem 0 0.4rem 0.2rem" }}>
                        <div style={{ fontSize: "0.72rem", color: PALETTE.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Bought · {bought.length}</div>
                        <button onClick={clearBoughtItems} style={{ background: "transparent", border: "none", color: PALETTE.accent2, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>
                          Clear
                        </button>
                      </div>
                      <div style={{ background: PALETTE.surfaceDark, borderRadius: "14px", border: `1px solid ${PALETTE.border}`, padding: "0.2rem" }}>
                        {bought.map((s) => renderRow(s, { showStrike: true, onDelete: () => removeShoppingItem(s.idx) }))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div
        className="bottom-nav"
        role="navigation"
        aria-label="Primary"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(28,24,21,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${PALETTE.border}`,
          zIndex: 30,
        }}
      >
        <div className="bottom-nav-inner" style={{ maxWidth: "480px", margin: "0 auto", display: "flex", padding: "0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom))", position: "relative" }}>
          <div
            className="nav-active-pill"
            style={{
              position: "absolute",
              top: "0.5rem",
              bottom: "calc(0.5rem + env(safe-area-inset-bottom))",
              left: `calc(0.5rem + ${NAV_ITEMS.findIndex((i) => i.id === tab)} * (100% - 1rem) / ${NAV_ITEMS.length})`,
              width: `calc((100% - 1rem) / ${NAV_ITEMS.length})`,
              background: PALETTE.surface,
              borderRadius: "12px",
              transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
            }}
          />
          <div
            className="nav-top-indicator"
            style={{
              position: "absolute",
              top: 0,
              left: `calc(${NAV_ITEMS.findIndex((i) => i.id === tab)} * (100% / ${NAV_ITEMS.length}) + (100% / ${NAV_ITEMS.length} / 2) - 12px)`,
              width: "24px",
              height: "3px",
              borderRadius: "0 0 3px 3px",
              background: PALETTE.accent,
              transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
              boxShadow: `0 0 6px ${PALETTE.accent}88`,
            }}
          />
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn${active ? " active" : ""}`}
                onClick={() => setTab(item.id)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  padding: "0.5rem 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.25rem",
                  cursor: "pointer",
                  color: active ? PALETTE.accent : PALETTE.textMuted,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div style={{ position: "relative" }} className={`nav-icon${active ? " nav-icon-bounce" : ""}`}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                  {item.id === "today" && streakData.streak > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-10px",
                        background: PALETTE.accent,
                        color: PALETTE.bg,
                        fontSize: "0.55rem",
                        fontWeight: 800,
                        borderRadius: "999px",
                        minWidth: "14px",
                        height: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        lineHeight: 1,
                      }}
                    >
                      {streakData.streak}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.66rem", fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {toast && (
        <div
          className="pop-in"
          style={{
            position: "fixed",
            bottom: "5.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: `linear-gradient(135deg, ${PALETTE.surface} 0%, ${PALETTE.surfaceDark} 100%)`,
            border: `1px solid ${PALETTE.borderLight}`,
            borderRadius: "999px",
            padding: "0.65rem 1.2rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: PALETTE.textPrimary,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 40,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          <Sparkles size={14} color={PALETTE.accent} /> {toast}
        </div>
      )}
    </div>
  );
}
