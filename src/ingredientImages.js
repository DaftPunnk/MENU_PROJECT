// 食材图映射:把菜品 JSON 里每个食材的 image 关键字,对应到打包后的真实图片 URL
// Ingredient image map — maps each ingredient's `image` key (from the dish JSON) to a bundled image URL.
// 以后每做好一张透明食材图,丢进 assets,在这里加一行即可,组件会自动用图代替 emoji。
// Each time you add a new transparent ingredient image to assets, add one line here and the
// component will use the image instead of the emoji automatically.

import chicken from './assets/chicken.webp'
import cashew from './assets/cashew.webp'
import chili from './assets/chili.webp'
import peppercorn from './assets/peppercorn.webp'
import scallion from './assets/scallion.webp'
import ginger from './assets/ginger.webp'
import garlic from './assets/garlic.webp'
import soy_sauce from './assets/soy_sauce.webp'
import vinegar from './assets/vinegar.webp'
import sugar from './assets/sugar.webp'
import cooking_wine from './assets/cooking_wine.webp'
import cornstarch from './assets/cornstarch.webp'

// 松露虾饺 Ha Kao 的食材 / Ha Kao ingredients
import shrimp from './assets/shrimp.webp'
import truffle from './assets/truffle.webp'
import truffle_oil from './assets/truffle_oil.webp'
import wheat_starch from './assets/wheat_starch.webp'
import tapioca from './assets/tapioca.webp'
import salt from './assets/salt.webp'

// Flox Tail 的食材 / Flox Tail ingredients (foamer + rice-paper bird stay as emoji)
import rum from './assets/rum.webp'
import benedictine from './assets/benedictine.webp'
import cinnamon from './assets/cinnamon.webp'
import fennel from './assets/fennel.webp'
import star_anise from './assets/star_anise.webp'
import grapefruit from './assets/grapefruit.webp'
import pineapple from './assets/pineapple.webp'
import peach from './assets/peach.webp'
import lime from './assets/lime.webp'

export const ingredientImages = {
  chicken,
  cashew,
  chili,
  peppercorn,
  scallion,
  ginger,
  garlic,
  soy_sauce,
  vinegar,
  sugar,
  cooking_wine,
  cornstarch,
  // 松露虾饺 / Ha Kao
  shrimp,
  truffle,
  truffle_oil,
  wheat_starch,
  tapioca,
  salt,
  // Flox Tail
  rum,
  benedictine,
  cinnamon,
  fennel,
  star_anise,
  grapefruit,
  pineapple,
  peach,
  lime,
}
