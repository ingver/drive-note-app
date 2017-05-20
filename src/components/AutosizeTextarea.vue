<template>
  <textarea @input="changeContent">{{ content }}</textarea>
</template>

<script>

import autosize from 'autosize'

export default {
  name: 'autosize-textarea',
  props: ['content'],

  mounted() {
    autosize(this.$el)
  },

  methods: {
    changeContent() {
      this.$emit('input', this.$el.value);
    }
  }
}

</script>
