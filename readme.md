# Vue Storefront Smile Extension

The Smile integration module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront).

## Installation

By hand (preferer):

```shell
git clone git@github.com:AbsoluteWebServices/vsf-smile.git ./vue-storefront/src/modules/
```

Registration the Smile module. Go to `./vue-storefront/src/modules/index.ts`

```js
...
import { Smile } from './vsf-smile';

export const registerModules: VueStorefrontModule[] = [
  ...
  Smile
]
```

Add the config from local.json to your config.

## Usage

Add RewardSlider component

```vue
<template>
  <reward-slider @reward-purchased="onRewardPurchase" />
</template>

<script>
import RewardSlider from 'src/modules/vsf-smile/components/RewardSlider'

export default {
  components: {
    RewardSlider
  },
  methods: {
    onRewardPurchase (couponCode) {
      // Handle coupon code
    }
  }
}
```

## Smile API extension

Install additional extension for `vue-storefront-api`: [vsf-api-smile](https://github.com/AbsoluteWebServices/vsf-api-smile).
