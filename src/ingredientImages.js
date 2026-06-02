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
}
